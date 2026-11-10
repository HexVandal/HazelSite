import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  if (!process.env.MEDIA_BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob media storage is not configured." }, { status: 503 });
  }
  return NextResponse.json({ uploadUrl: "/api/storage" });
}
