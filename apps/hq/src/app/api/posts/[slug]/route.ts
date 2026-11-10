import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { getPost, removePost, savePost } from "@/lib/vercel-content";


export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { slug } = await params;
  try {
    const post = await getPost(slug);
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ ...post, cover_image: post.cover_image });
  } catch (error) {
    console.error("Unable to read blog post", error);
    return NextResponse.json({ error: "Post is temporarily unavailable." }, { status: 503 });
  }
}

async function update(req: NextRequest, params: Promise<{ slug: string }>) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  try {
    const { slug: oldSlug } = await params;
    const previous = await getPost(oldSlug);
    if (!previous) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : previous.title;
    const content = typeof body.content === "string" ? body.content : previous.content;
    const requestedSlug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : oldSlug;
    const slug = requestedSlug.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
    if (!title || !content || !slug) return NextResponse.json({ error: "Title, slug, and content are required." }, { status: 400 });
    if (slug !== oldSlug && await getPost(slug)) return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    const post = await savePost({
      ...previous,
      slug,
      title,
      content,
      description: typeof body.description === "string" ? body.description : previous.description,
      tags: Array.isArray(body.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === "string") : previous.tags,
      cover_image: typeof body.cover_image === "string" ? body.cover_image : previous.cover_image,
      is_published: typeof body.is_published === "boolean" ? body.is_published : previous.is_published,
    });
    if (slug !== oldSlug) await removePost(oldSlug);
    return NextResponse.json({ ...post, reading_time: `${Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 180))} min read` });
  } catch (error) {
    console.error("Unable to update blog post", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update post." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) { return update(req, params); }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) { return update(req, params); }

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  try {
    const { slug } = await params;
    const removed = await removePost(slug);
    return removed ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Post not found." }, { status: 404 });
  } catch (error) {
    console.error("Unable to delete blog post", error);
    return NextResponse.json({ error: "Could not delete post." }, { status: 503 });
  }
}
