import { list } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";


export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id.startsWith("blog/") || id.includes("..")) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    const token = process.env.MEDIA_BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
    const { blobs } = await list({ prefix: id, limit: 20, token });
    const blob = blobs.find((item) => item.pathname === id);
    if (!blob) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    return NextResponse.json({ url: blob.url, expires_at: null });
  } catch (error) {
    console.error("Unable to resolve image URL", error);
    return NextResponse.json({ error: "Image could not be opened." }, { status: 503 });
  }
}
