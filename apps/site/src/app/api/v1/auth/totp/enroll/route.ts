import { NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { authenticate, hasRole } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({ issuer: "Gloom HQ", label: actor.email, secret, digits: 6, period: 30 });
  await query("update admin_users set totp_pending_secret=$1,updated_at=now() where id=$2", [secret.base32, actor.id]);
  return NextResponse.json({ secret: secret.base32, otpauthUrl: totp.toString(), qrDataUrl: await QRCode.toDataURL(totp.toString()), verified: false }, { headers: { "Cache-Control": "no-store" } });
}
