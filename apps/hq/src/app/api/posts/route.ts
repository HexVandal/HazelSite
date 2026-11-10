import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { getPost, listPosts, savePost, type BlogRecord } from "@/lib/vercel-content";


function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

function summary(post: BlogRecord) {
  const words = post.content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return { id: post.id, slug: post.slug, title: post.title, description: post.description, tags: post.tags, reading_time: `${minutes} min read`, is_published: post.is_published, published_at: post.published_at || undefined, created_at: post.created_at, updated_at: post.updated_at, cover_image: post.cover_image };
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  if (!process.env.CONTENT_BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ posts: [], total: 0, storage_configured: false });
  }
  try {
    let posts = await listPosts(true);
    const search = req.nextUrl.searchParams.get("search")?.toLowerCase();
    const tag = req.nextUrl.searchParams.get("tag")?.toLowerCase();
    const published = req.nextUrl.searchParams.get("is_published");
    if (search) posts = posts.filter((post) => `${post.title} ${post.description} ${post.slug} ${post.tags.join(" ")}`.toLowerCase().includes(search));
    if (tag) posts = posts.filter((post) => post.tags.some((entry) => entry.toLowerCase() === tag));
    if (published !== null) posts = posts.filter((post) => post.is_published === (published === "true"));
    const total = posts.length;
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 50)));
    const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") || 0));
    return NextResponse.json({ posts: posts.slice(offset, offset + limit).map(summary), total });
  } catch (error) {
    console.error("Unable to read blog records", error);
    return NextResponse.json({ error: "Posts are temporarily unavailable.", posts: [], total: 0 }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const slug = slugify(typeof body.slug === "string" && body.slug.trim() ? body.slug : title);
    if (!title || !content || !slug) return NextResponse.json({ error: "Title, slug, and content are required." }, { status: 400 });
    if (await getPost(slug)) return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    const post = await savePost({
      slug, title, content,
      description: typeof body.description === "string" ? body.description : "",
      tags: Array.isArray(body.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
      cover_image: typeof body.cover_image === "string" ? body.cover_image : "",
      is_published: Boolean(body.is_published),
    });
    return NextResponse.json({ ...post, reading_time: summary(post).reading_time }, { status: 201 });
  } catch (error) {
    console.error("Unable to create blog post", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create post." }, { status: 503 });
  }
}
