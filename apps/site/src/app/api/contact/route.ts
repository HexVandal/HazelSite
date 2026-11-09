import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid contact form submission." }, { status: 400 });
    }
    const fields = body as Record<string, unknown>;
    const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
    const payload = {
      name: text("name"),
      email: text("email"),
      subject: text("subject"),
      message: text("message"),
      _gotcha: text("_gotcha"),
    };
    if (payload._gotcha) {
      return NextResponse.json({ status: "success", message: "Your message has been sent successfully." });
    }
    if (!payload.name || payload.name.length < 2 || payload.name.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254 ||
        payload.subject.length < 3 || payload.subject.length > 200 ||
        payload.message.length < 10 || payload.message.length > 5000) {
      return NextResponse.json({ error: "Please check the name, email, subject, and message fields." }, { status: 400 });
    }

    const apiBase = (process.env.GLOOM_API_INTERNAL_URL || process.env.REALM_API_INTERNAL_URL || "http://api:8080").replace(/\/+$/, "");
    const upstream = await fetch(`${apiBase}/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gloom-Request": "1",
        "User-Agent": request.headers.get("user-agent") || "Gloom Contact Form",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const result = await upstream.json().catch(() => ({}));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Contact service is temporarily unavailable. Please try again later." }, { status: 502 });
  }
}
