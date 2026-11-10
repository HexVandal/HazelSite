import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  // Public blog pages read current content from Vercel Blob on demand, so no
  // cross-project cache purge or webhook secret is needed.
  return NextResponse.json({ success: true, revalidated: false });
}
