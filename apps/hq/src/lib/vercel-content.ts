import { del, get, list, put } from "@vercel/blob";

export type BlogRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  cover_image: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ContactRecord = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  user_agent: string;
  ip_address: string;
};

const CONTENT_TOKEN = () => process.env.CONTENT_BLOB_READ_WRITE_TOKEN;
const MEDIA_TOKEN = () => process.env.MEDIA_BLOB_READ_WRITE_TOKEN;

function requireContentToken() {
  const token = CONTENT_TOKEN();
  if (!token) throw new Error("CONTENT_BLOB_READ_WRITE_TOKEN is not configured");
  return token;
}

function requireMediaToken() {
  const token = MEDIA_TOKEN();
  if (!token) throw new Error("MEDIA_BLOB_READ_WRITE_TOKEN is not configured");
  return token;
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const token = requireContentToken();
  const result = await get(pathname, { access: "private", token, useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const text = await new Response(result.stream).text();
  return JSON.parse(text) as T;
}

async function writeJson(pathname: string, value: unknown) {
  const token = requireContentToken();
  return put(pathname, JSON.stringify(value), {
    access: "private",
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 0,
  });
}

async function listPathnames(prefix: string): Promise<string[]> {
  const token = requireContentToken();
  const result = await list({ prefix, token, limit: 1000 });
  return result.blobs.map((blob) => blob.pathname);
}

export async function listPosts(includeDrafts = false): Promise<BlogRecord[]> {
  const paths = await listPathnames("posts/");
  const records = await Promise.all(paths.map((path) => readJson<BlogRecord>(path)));
  return records
    .filter((post): post is BlogRecord => Boolean(post))
    .filter((post) => includeDrafts || post.is_published)
    .sort((a, b) => Date.parse(b.published_at || b.updated_at) - Date.parse(a.published_at || a.updated_at));
}

export async function getPost(slug: string): Promise<BlogRecord | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return readJson<BlogRecord>(`posts/${slug}.json`);
}

export async function savePost(input: Partial<BlogRecord> & { slug: string; title: string; content: string }): Promise<BlogRecord> {
  const slug = input.slug.toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug must contain lowercase letters, numbers, and hyphens only");
  const previous = await getPost(slug);
  const now = new Date().toISOString();
  const isPublished = Boolean(input.is_published);
  const post: BlogRecord = {
    id: previous?.id || input.id || crypto.randomUUID(),
    slug,
    title: input.title.trim().slice(0, 200),
    description: (input.description || "").trim().slice(0, 500),
    content: input.content.slice(0, 250_000),
    tags: Array.isArray(input.tags) ? input.tags.filter((tag) => typeof tag === "string").slice(0, 30) : [],
    cover_image: (input.cover_image || "").trim().slice(0, 2048),
    is_published: isPublished,
    created_at: previous?.created_at || input.created_at || now,
    updated_at: now,
    published_at: isPublished ? (previous?.published_at || now) : null,
  };
  await writeJson(`posts/${slug}.json`, post);
  return post;
}

export async function removePost(slug: string): Promise<boolean> {
  const post = await getPost(slug);
  if (!post) return false;
  await del(`posts/${slug}.json`, { token: requireContentToken() });
  return true;
}

export async function saveMessage(input: Omit<ContactRecord, "id" | "created_at"> & { id?: string; created_at?: string }): Promise<ContactRecord> {
  const message: ContactRecord = {
    ...input,
    id: input.id || crypto.randomUUID(),
    created_at: input.created_at || new Date().toISOString(),
  };
  await writeJson(`messages/${message.created_at.slice(0, 10)}/${message.id}.json`, message);
  return message;
}

export async function listMessages(): Promise<ContactRecord[]> {
  const paths = await listPathnames("messages/");
  const records = await Promise.all(paths.map((path) => readJson<ContactRecord>(path)));
  return records
    .filter((message): message is ContactRecord => Boolean(message))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export async function removeMessage(id: string): Promise<boolean> {
  const messages = await listPathnames("messages/");
  const match = messages.find((path) => path.endsWith(`/${id}.json`));
  if (!match) return false;
  await del(match, { token: requireContentToken() });
  return true;
}

export async function saveImage(file: File): Promise<{ url: string; pathname: string; contentType: string; size: number }> {
  const token = requireMediaToken();
  if (!file.type.startsWith("image/")) throw new Error("Only image uploads are allowed");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be 8 MB or smaller");
  const extension = file.name.toLowerCase().match(/\.(png|jpe?g|webp|gif|avif)$/)?.[0] || "";
  if (!extension) throw new Error("Supported image types are PNG, JPEG, WebP, GIF, and AVIF");
  const result = await put(`blog/${crypto.randomUUID()}${extension}`, file, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: file.type,
  });
  return { url: result.url, pathname: result.pathname, contentType: file.type, size: file.size };
}
