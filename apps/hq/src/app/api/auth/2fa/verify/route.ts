import { type NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { issueAdminToken, verifyAdminToken, consumeRecoveryCode } from "@/lib/auth/vercel-session";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tempToken = typeof body.temp_token === "string" ? body.temp_token : typeof body.tempToken === "string" ? body.tempToken : "";
    const code = typeof body.code === "string" ? body.code.replace(/\s/g, "") : "";
    const challenge = verifyAdminToken(tempToken, "2fa");
    const secret = process.env.ADMIN_TOTP_SECRET || "";
    if (!challenge || !secret || !code) {
      return NextResponse.json({ error: "The verification code is invalid or expired." }, { status: 401 });
    }
    let verified = false;
    if (/^\d{6}$/.test(code)) {
      const totp = new OTPAuth.TOTP({
        issuer: "HazelSite HQ",
        label: challenge.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });
      verified = totp.validate({ token: code, window: 1 }) !== null;
    } else {
      verified = await consumeRecoveryCode(code);
    }
    if (!verified) return NextResponse.json({ error: "The verification code is invalid or expired." }, { status: 401 });

    const sessionToken = issueAdminToken(challenge.email, "session", 8 * 60 * 60);
    const response = NextResponse.json({
      status: "success",
      user: { id: "vercel-owner", username: challenge.username, email: challenge.email, full_name: challenge.full_name, avatar_url: null, two_factor_enabled: true },
      admin: { id: "vercel-owner", is_superadmin: true, permissions: ["*"] },
    });
    response.cookies.set("realm_auth_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("2FA verification failed", error);
    return NextResponse.json({ error: "Unable to verify the code." }, { status: 400 });
  }
}
