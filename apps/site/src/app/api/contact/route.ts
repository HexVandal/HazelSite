import { NextResponse, type NextRequest } from "next/server";
import { saveContactMessage } from "@/lib/vercel-content";


const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
let windowStartedAt = Date.now();
let submissionsInWindow = 0;

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  _gotcha: string;
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    if (new URL(origin).host !== host) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let input: Partial<ContactPayload>;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid contact form submission." }, { status: 400 });
  }
  const text = (key: keyof ContactPayload) => typeof input[key] === "string" ? (input[key] as string).trim() : "";
  const payload: ContactPayload = {
    name: text("name"),
    email: text("email"),
    subject: text("subject"),
    message: text("message"),
    _gotcha: text("_gotcha"),
  };
  if (payload._gotcha) return NextResponse.json({ status: "success", message: "Your message has been sent successfully." });
  if (payload.name.length < 2 || payload.name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254 ||
      payload.subject.length < 3 || payload.subject.length > 200 ||
      payload.message.length < 10 || payload.message.length > 5000) {
    return NextResponse.json({ error: "Please check the name, email, subject, and message fields." }, { status: 400 });
  }

  const now = Date.now();
  if (now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    submissionsInWindow = 0;
  }
  if (submissionsInWindow >= MAX_PER_WINDOW) return NextResponse.json({ error: "Please wait a moment before sending another message." }, { status: 429 });
  submissionsInWindow += 1;

  try {
    await saveContactMessage({
      name: payload.name,
      email: payload.email.toLowerCase(),
      subject: payload.subject,
      message: payload.message,
      user_agent: "",
      ip_address: "",
    });
    return NextResponse.json({ status: "success", message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("Contact message could not be stored", error);
    return NextResponse.json({ error: "Contact service is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
