import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { issueAdminToken } from "@/lib/auth/vercel-session";


let windowStartedAt = Date.now();
let failedAttempts = 0;
const MAX_FAILURES = 12;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const now = Date.now();
  if (now - windowStartedAt > WINDOW_MS) {
    windowStartedAt = now;
    failedAttempts = 0;
  }
  if (failedAttempts >= MAX_FAILURES) return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });

  try {
    const body = await req.json();
    const identifier = typeof body.identifier === "string" ? body.identifier.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
    const totpSecret = process.env.ADMIN_TOTP_SECRET || "";
    if (!adminEmail || !passwordHash || !totpSecret || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json({ error: "Admin sign-in is not configured yet." }, { status: 503 });
    }
    const username = adminEmail.split("@")[0];
    const matches = (identifier === adminEmail || identifier === username) && password.length <= 128 && await bcrypt.compare(password, passwordHash).catch(() => false);
    if (!matches) {
      failedAttempts += 1;
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    failedAttempts = 0;
    const tempToken = issueAdminToken(adminEmail, "2fa", 5 * 60);
    return NextResponse.json({ status: "2fa_required", two_factor_required: true, temp_token: tempToken });
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 400 });
  }
}
