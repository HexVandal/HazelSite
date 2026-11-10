import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/vercel-session";


export async function GET(req: NextRequest) {
  const token = req.cookies.get("realm_auth_token")?.value;
  const session = verifyAdminToken(token, "session");
  if (!session) return NextResponse.json({ user: null, admin: null }, { status: 200 });
  return NextResponse.json({
    status: "success",
    user: { id: session.id, username: session.username, email: session.email, full_name: session.full_name, avatar_url: null, two_factor_enabled: true },
    admin: { id: session.id, is_superadmin: true, permissions: ["*"] },
  });
}
