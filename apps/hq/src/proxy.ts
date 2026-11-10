import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/vercel-session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("realm_auth_token")?.value;
  const valid = Boolean(verifyAdminToken(token, "session"));
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!valid && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    if (request.nextUrl.pathname !== "/") loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (valid && isLoginPage) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)"],
};
