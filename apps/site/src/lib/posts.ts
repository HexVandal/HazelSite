import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";

import type { Post, PostFrontmatter, PostSource } from "@/lib/types/posts";

/**
 * Posts live in /content/blog as .md or .mdx files. They are read at build
 * time (see generateStaticParams) so the blog ships as fully static pages.
 */
const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 180;
const POST_EXTENSIONS = /\.mdx?$/;
const GLOOM_API_URL = (process.env.GLOOM_API_INTERNAL_URL || process.env.REALM_API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
type GloomPost = { slug:string; title:string; description?:string; content?:string; published_at?:string; created_at?:string; updated_at?:string; tags?:string[]; reading_time?:string; is_published?:boolean; cover_image?:string };
async function fetchGloomPosts(path:string):Promise<GloomPost[]>{try{const response=await fetch(`${GLOOM_API_URL}/v1/posts${path}`,{next:{revalidate:60}});if(!response.ok)return[];const data=await response.json();return Array.isArray(data.posts)?data.posts:[];}catch{return[];}}
async function fetchGloomPost(slug:string):Promise<GloomPost|null>{try{const response=await fetch(`${GLOOM_API_URL}/v1/posts/${encodeURIComponent(slug)}`,{next:{revalidate:60}});if(!response.ok)return null;return await response.json();}catch{return null;}}
function remotePostSummary(post:GloomPost):Post {const date=post.published_at||post.created_at||"";const minutes=Math.max(1,Number.parseInt(post.reading_time||"1",10)||1);return {slug:post.slug,title:post.title,description:post.description||"",createdAt:date,updatedAt:post.updated_at||date,tags:post.tags||[],readingTime:post.reading_time||`${minutes} min read`,readingMinutes:minutes};}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Tiny YAML subset parser: enough for `key: value`, `key: [a, b]` and
 * block lists (`key:` + `- item`). Keeps the dependency footprint at zero.
 */
function parseFrontmatter(source: string): {
  data: Partial<PostFrontmatter>;
  content: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { data: {}, content: source };
  }

  const raw = match[1];
  const data: Record<string, string | string[]> = {};
  let currentKey = "";

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentKey) {
      const existing = data[currentKey];
      const list = Array.isArray(existing) ? existing : [];
      list.push(unquote(trimmed.slice(2)));
      data[currentKey] = list;
      continue;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) continue;

    currentKey = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!value) {
      data[currentKey] = [];
    } else if (value.startsWith("[") && value.endsWith("]")) {
      data[currentKey] = value
        .slice(1, -1)
        .split(",")
        .map((item) => unquote(item))
        .filter(Boolean);
    } else {
      data[currentKey] = unquote(value);
    }
  }

  return {
    data: data as Partial<PostFrontmatter>,
    content: source.slice(match[0].length),
  };
}

export function estimateReadingTime(markdown: string): {
  minutes: number;
  label: string;
} {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-|]/g, " ");

  const words = plain.split(/\s+/).filter(Boolean).length;
  const precise = words / WORDS_PER_MINUTE;
  const minutes = Math.max(1, Math.round(precise));

  return {
    minutes,
    label: precise < 1 ? "< 1 min read" : `${minutes} min read`,
  };
}

function toPost(slug: string, source: string): Post {
  const { data, content } = parseFrontmatter(source);
  const { minutes, label } = estimateReadingTime(content);
  const createdAt = data.createdAt ?? "";
  const fallbackTitle = slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    slug,
    title: data.title || fallbackTitle,
    description: data.description ?? "",
    createdAt,
    updatedAt: data.updatedAt || createdAt,
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: label,
    readingMinutes: minutes,
  };
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** All posts, newest edit first. */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  let filenames: string[];

  try {
    filenames = await fs.readdir(POSTS_DIRECTORY);
  } catch {
    // No content directory yet - the blog simply renders empty.
    return [];
  }

  const posts = await Promise.all(
    filenames
      .filter((filename) => POST_EXTENSIONS.test(filename))
      .map(async (filename) => {
        const filePath = path.join(POSTS_DIRECTORY, filename);
        const source = await fs.readFile(filePath, "utf8");
        return toPost(filename.replace(POST_EXTENSIONS, ""), source);
      }),
  );

  const remote = await fetchGloomPosts("?published=true&limit=200");
  const merged = new Map(posts.map((post) => [post.slug, post]));
  for (const post of remote) if (post.is_published !== false && !merged.has(post.slug)) merged.set(post.slug, remotePostSummary(post));
  return [...merged.values()].sort((a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt));
});

/** A single post, or null when the slug does not exist. */
export const getPostBySlug = cache(
  async (slug: string): Promise<PostSource | null> => {
    // Reject traversal attempts before touching the file system.
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) return null;

    for (const extension of [".mdx", ".md"]) {
      try {
        const source = await fs.readFile(
          path.join(POSTS_DIRECTORY, `${slug}${extension}`),
          "utf8",
        );
        const { data, content } = parseFrontmatter(source);
        const { minutes, label } = estimateReadingTime(content);
        const createdAt = data.createdAt ?? "";
        const fallbackTitle = slug
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return {
          frontmatter: {
            title: data.title || fallbackTitle,
            description: data.description ?? "",
            createdAt,
            updatedAt: data.updatedAt || createdAt,
            tags: Array.isArray(data.tags) ? data.tags : [],
          },
          content,
          readingTime: label,
          readingMinutes: minutes,
        };
      } catch {
        // Try the next extension.
      }
    }

    const remote = await fetchGloomPost(slug);
    if (!remote || remote.is_published === false || !remote.content) return null;
    const summary = remotePostSummary(remote);
    return {
      frontmatter: { title: summary.title, description: summary.description, createdAt: summary.createdAt, updatedAt: summary.updatedAt, tags: summary.tags },
      content: remote.content,
      readingTime: summary.readingTime,
      readingMinutes: summary.readingMinutes,
    };
  },
);

/** Slugs of every post, for generateStaticParams. */
export const getPostSlugs = cache(async (): Promise<string[]> => {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
});
