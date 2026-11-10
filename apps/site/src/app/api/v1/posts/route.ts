import { NextRequest, NextResponse } from "next/server";
import { getPublishedPost, getPublishedPosts } from "@/lib/vercel-content";


export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (slug) {
      const post = await getPublishedPost(slug);
      if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
      return NextResponse.json({ post }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
    }
    const posts = await getPublishedPosts();
    return NextResponse.json({ posts }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Unable to load published posts", error);
    return NextResponse.json({ error: "Posts are temporarily unavailable.", posts: [] }, { status: 503 });
  }
}
