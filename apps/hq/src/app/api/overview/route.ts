import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { listMessages, listPosts } from "@/lib/vercel-content";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  if (!process.env.CONTENT_BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      storage_configured: false,
      posts: { total: 0, published: 0, drafts: 0 },
      messages: { total: 0, latest_at: null },
      images: { total: 0, bytes: 0 },
    });
  }
  try {
    const [posts, messages, media] = await Promise.all([
      listPosts(true),
      listMessages(),
      process.env.MEDIA_BLOB_READ_WRITE_TOKEN
        ? list({ prefix: "blog/", limit: 1000, token: process.env.MEDIA_BLOB_READ_WRITE_TOKEN })
        : Promise.resolve({ blobs: [] }),
    ]);
    return NextResponse.json({
      storage_configured: true,
      posts: { total: posts.length, published: posts.filter((post) => post.is_published).length, drafts: posts.filter((post) => !post.is_published).length },
      messages: { total: messages.length, latest_at: messages[0]?.created_at || null },
      images: { total: media.blobs.length, bytes: media.blobs.reduce((sum, blob) => sum + blob.size, 0) },
    });
  } catch (error) {
    console.error("Unable to load HQ overview", error);
    return NextResponse.json({ error: "Overview is temporarily unavailable." }, { status: 503 });
  }
}
