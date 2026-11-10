import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/vercel-session";

export type AuthResult =
  | { token: string; user: ReturnType<typeof verifyAdminToken>; error?: never }
  | { token?: never; user?: never; error: NextResponse };

export function getSessionToken(req: NextRequest): string | undefined {
  return req.cookies.get("realm_auth_token")?.value;
}

export function requireAuth(req: NextRequest): AuthResult {
  const token = getSessionToken(req);
  const user = verifyAdminToken(token, "session");
  if (!token || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized: authentication required" }, { status: 401 }),
    };
  }
  return { token, user };
}
