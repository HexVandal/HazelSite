import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, audit, hasRole, hasScope } from "@/lib/platform/auth";
import { databaseConfigured, query } from "@/lib/platform/db";
export const runtime = "nodejs";
const schema = z.object({ slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i).max(120), title: z.string().trim().min(1).max(180), summary: z.string().max(500).default(""), body: z.string().max(500_000), tags: z.array(z.string().max(40)).max(30).default([]), status: z.enum(["draft","published","archived"]).default("draft"), featuredImageUrl: z.string().url().max(1000).optional().or(z.literal("")) });

export async function GET(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !(actor.tokenId ? hasScope(actor,"content:read") : hasRole(actor,"editor"))) return NextResponse.json({ error: "Editor access required." }, { status: 401 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const status = request.nextUrl.searchParams.get("status");
  const { rows } = await query(`select id,slug,title,summary,tags,status,featured_image_url,published_at,created_at,updated_at from blog_posts ${["draft","published","archived"].includes(status || "") ? "where status=$1" : ""} order by updated_at desc limit 500`, ["draft","published","archived"].includes(status || "") ? [status] : []);
  return NextResponse.json({ posts: rows }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !(actor.tokenId ? hasScope(actor,"content:write") : hasRole(actor,"editor"))) return NextResponse.json({ error: "Editor access required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Post fields are invalid." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const data = parsed.data;
  const body = data.body.replace(/<\/?(?:script|iframe|object|embed|style|form)[^>]*>/gi, "");
  const { rows } = await query(
    `insert into blog_posts(slug,title,summary,body,tags,status,featured_image_url,author_id,published_at)
     values($1,$2,$3,$4,$5,$6,$7,$8,case when $6='published' then now() else null end)
     on conflict(slug) do update set title=excluded.title,summary=excluded.summary,body=excluded.body,tags=excluded.tags,status=excluded.status,featured_image_url=excluded.featured_image_url,author_id=excluded.author_id,published_at=case when excluded.status='published' then coalesce(blog_posts.published_at,now()) else null end,updated_at=now()
     returning id,slug,title,summary,tags,status,featured_image_url,published_at,created_at,updated_at`,
    [data.slug.toLowerCase(), data.title, data.summary, body, data.tags, data.status, data.featuredImageUrl || null, actor.id],
  );
  await audit(actor, data.status === "published" ? "post.published" : "post.saved", { slug: data.slug });
  return NextResponse.json({ post: rows[0] }, { status: 201 });
}
