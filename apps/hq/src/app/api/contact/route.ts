import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { listMessages, removeMessage } from "@/lib/vercel-content";


export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  if (!process.env.CONTENT_BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ submissions: [], total: 0, storage_configured: false });
  }
  try {
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 20)));
    const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") || 0));
    const search = (req.nextUrl.searchParams.get("search") || "").toLocaleLowerCase();
    const messages = await listMessages();
    const filtered = search ? messages.filter((message) =>
      [message.name, message.email, message.subject, message.message].some((value) => value.toLocaleLowerCase().includes(search)),
    ) : messages;
    return NextResponse.json({ submissions: filtered.slice(offset, offset + limit), total: filtered.length });
  } catch (error) {
    console.error("Unable to list contact messages", error);
    return NextResponse.json({ error: "Messages are temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9-]{8,80}$/.test(id)) {
    return NextResponse.json({ error: "A valid message id is required." }, { status: 400 });
  }
  try {
    const removed = await removeMessage(id);
    return removed
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Message not found." }, { status: 404 });
  } catch (error) {
    console.error("Unable to delete contact message", error);
    return NextResponse.json({ error: "Message could not be deleted." }, { status: 503 });
  }
}
