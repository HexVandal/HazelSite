import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import { z } from "zod";
import { query, rateLimit } from "@/lib/platform/db";
import { audit, createSession, visitorDigest } from "@/lib/platform/auth";
export const runtime = "nodejs";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128), totpCode: z.string().optional() });

export async function POST(request: NextRequest) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!await rateLimit(`login:${visitorDigest(ip)}`, 10, 900)) return NextResponse.json({ error: "Too many sign-in attempts. Wait 15 minutes and try again." }, { status: 429 });

  const { rows } = await query<{ id: string; email: string; display_name: string; role: "owner" | "admin" | "editor" | "moderator" | "viewer"; password_hash: string; totp_secret: string | null; totp_enabled: boolean; session_version: number; disabled_at: Date | null }>(
    "select id,email,display_name,role,password_hash,totp_secret,totp_enabled,session_version,disabled_at from admin_users where email=$1 limit 1", [body.data.email.toLowerCase()],
  );
  const user = rows[0];
  if (!user || user.disabled_at || !await bcrypt.compare(body.data.password, user.password_hash)) {
    await audit(null, "auth.login_failed", { ip: visitorDigest(ip), email: body.data.email.toLowerCase() }, "warn");
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  if (user.totp_enabled) {
    if (!body.data.totpCode || !user.totp_secret) return NextResponse.json({ totpRequired: true }, { status: 200 });
    const totp = new OTPAuth.TOTP({ issuer: "Gloom HQ", label: user.email, secret: OTPAuth.Secret.fromBase32(user.totp_secret), digits: 6, period: 30 });
    if (totp.validate({ token: body.data.totpCode.replace(/\s/g, ""), window: 1 }) === null) {
      await audit({ id: user.id, email: user.email, displayName: user.display_name, role: user.role, scopes: [] }, "auth.totp_failed", {}, "warn");
      return NextResponse.json({ error: "That authenticator code is invalid." }, { status: 401 });
    }
  }
  await createSession(user);
  await audit({ id: user.id, email: user.email, displayName: user.display_name, role: user.role, scopes: ["*"] }, "auth.login");
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } }, { headers: { "Cache-Control": "no-store" } });
}
