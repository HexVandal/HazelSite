import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { z } from "zod";
import { authenticate, audit, hasRole } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
const schema = z.object({ code: z.string().min(6).max(8) });
export async function POST(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the six-digit authenticator code." }, { status: 400 });
  const { rows } = await query<{ totp_pending_secret: string | null }>("select totp_pending_secret from admin_users where id=$1", [actor.id]);
  const secret = rows[0]?.totp_pending_secret;
  if (!secret) return NextResponse.json({ error: "Start authenticator setup first." }, { status: 409 });
  const totp = new OTPAuth.TOTP({ issuer: "Gloom HQ", label: actor.email, secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 });
  if (totp.validate({ token: parsed.data.code.replace(/\s/g, ""), window: 1 }) === null) return NextResponse.json({ error: "That authenticator code is invalid." }, { status: 400 });
  const recoveryCodes = Array.from({ length: 10 }, () => randomBytes(5).toString("hex").toUpperCase());
  const hashes = recoveryCodes.map((code) => createHash("sha256").update(code).digest("hex"));
  await query("update admin_users set totp_secret=totp_pending_secret,totp_pending_secret=null,totp_enabled=true,recovery_code_hashes=$1,updated_at=now() where id=$2", [hashes, actor.id]);
  await audit(actor, "auth.totp_enabled");
  return NextResponse.json({ enabled: true, recoveryCodes }, { headers: { "Cache-Control": "no-store" } });
}
