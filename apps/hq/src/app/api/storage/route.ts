import { del, list, put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";


function mediaToken() {
  const token = process.env.MEDIA_BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("MEDIA_BLOB_READ_WRITE_TOKEN is not configured");
  return token;
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  if (!process.env.MEDIA_BLOB_READ_WRITE_TOKEN) {
    if (req.nextUrl.searchParams.get("type") === "stats") {
      return NextResponse.json({ active_backend: "vercel-blob", total_files: 0, total_original_bytes: 0, total_compressed_bytes: 0, average_savings_percent: 0, storage_configured: false });
    }
    return NextResponse.json({ files: [], total: 0, storage_configured: false });
  }
  try {
    const token = mediaToken();
    const { blobs } = await list({ prefix: "blog/", limit: 1000, token });
    const files = blobs.map((blob) => ({
      id: blob.pathname,
      filename: blob.pathname.split("/").pop() || blob.pathname,
      content_type: `image/${(blob.pathname.match(/\.(png|jpe?g|webp|gif|avif)$/i)?.[1]?.toLowerCase() || "jpeg").replace("jpg", "jpeg")}`,
      original_size: blob.size,
      compressed_size: blob.size,
      url: blob.url,
      webp_url: "",
      storage_backend: "vercel-blob",
      created_at: blob.uploadedAt.toISOString(),
      sha256: "",
    }));
    const totalBytes = files.reduce((sum, file) => sum + file.original_size, 0);
    if (req.nextUrl.searchParams.get("type") === "stats") {
      return NextResponse.json({ active_backend: "vercel-blob", total_files: files.length, total_original_bytes: totalBytes, total_compressed_bytes: totalBytes, average_savings_percent: 0 });
    }
    const search = req.nextUrl.searchParams.get("search")?.toLowerCase();
    const filtered = search ? files.filter((file) => file.filename.toLowerCase().includes(search)) : files;
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 20)));
    const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") || 0));
    return NextResponse.json({ files: filtered.slice(offset, offset + limit), total: filtered.length });
  } catch (error) {
    console.error("Unable to list Vercel Blob images", error);
    return NextResponse.json({ error: "Image storage is not configured or unavailable." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  try {
    const type = req.headers.get("content-type") || "";
    let file: File | null = null;
    if (type.toLowerCase().includes("multipart/form-data")) {
      const form = await req.formData();
      const candidate = form.get("file");
      if (candidate instanceof File) file = candidate;
    } else {
      const bytes = await req.arrayBuffer();
      const filename = req.headers.get("x-filename") || req.nextUrl.searchParams.get("filename") || "image-upload";
      file = new File([bytes], filename, { type });
    }
    if (!file || file.size === 0) return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files can be uploaded here." }, { status: 415 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Images must be 4 MB or smaller on this upload route." }, { status: 413 });
    const extension = file.name.toLowerCase().match(/\.(png|jpe?g|webp|gif|avif)$/)?.[0];
    if (!extension) return NextResponse.json({ error: "Use PNG, JPEG, WebP, GIF, or AVIF images." }, { status: 415 });
    const result = await put(`blog/${crypto.randomUUID()}${extension}`, file, { access: "public", token: mediaToken(), contentType: file.type });
    return NextResponse.json({ id: result.pathname, filename: result.pathname.split("/").pop(), content_type: file.type, original_size: file.size, compressed_size: file.size, url: result.url, storage_backend: "vercel-blob", created_at: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !id.startsWith("blog/") || id.includes("..")) return NextResponse.json({ error: "A valid image id is required." }, { status: 400 });
  try {
    await del(id, { token: mediaToken() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Image deletion failed", error);
    return NextResponse.json({ error: "Image could not be deleted." }, { status: 503 });
  }
}
