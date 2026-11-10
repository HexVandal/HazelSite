import { get, list, put } from "@vercel/blob";

export type StoredPost = {
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

export type StoredMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  user_agent: string;
  ip_address: string;
};

function contentToken() {
  const token = process.env.CONTENT_BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("CONTENT_BLOB_READ_WRITE_TOKEN is not configured");
  return token;
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private", token: contentToken(), useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return JSON.parse(await new Response(result.stream).text()) as T;
}

export async function getPublishedPosts(): Promise<StoredPost[]> {
  const { blobs } = await list({ prefix: "posts/", limit: 1000, token: contentToken() });
  const posts = await Promise.all(blobs.map((blob) => readJson<StoredPost>(blob.pathname)));
  return posts
    .filter((post): post is StoredPost => Boolean(post?.is_published))
    .sort((a, b) => Date.parse(b.published_at || b.updated_at) - Date.parse(a.published_at || a.updated_at));
}

export async function getPublishedPost(slug: string): Promise<StoredPost | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const post = await readJson<StoredPost>(`posts/${slug}.json`);
  return post?.is_published ? post : null;
}

export async function saveContactMessage(input: Omit<StoredMessage, "id" | "created_at">): Promise<void> {
  const message: StoredMessage = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  await put(`messages/${message.created_at.slice(0, 10)}/${message.id}.json`, JSON.stringify(message), {
    access: "private",
    token: contentToken(),
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  });
}
