import { get, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

type DayFile = { date: string; events: StoredVisit[] };

const ANALYTICS_PREFIX = "analytics/visits/";
const CACHE_TTL_MS = 60_000;

const cache = new Map<string, { expires: number; payload: unknown }>();

const EMPTY = {
  total_views: 0,
  unique_visitors: 0,
  views_today: 0,
  views_trend: [] as { date: string; views: number; unique: number }[],
  top_pages: [] as { path: string; views: number; unique: number }[],
  top_posts: [] as { slug: string; title: string; views: number; unique: number }[],
  top_referrers: [] as { referrer: string; count: number }[],
  device_stats: [] as { device: string; count: number }[],
  browser_stats: [] as { browser: string; count: number }[],
  country_stats: [] as {
    country_code: string;
    country: string;
    views: number;
    unique: number;
    percentage: number;
    lat?: number;
    long?: number;
    key?: string;
  }[],
  city_stats: [] as { city: string; country: string; country_code: string; views: number; unique: number }[],
  site_stats: [] as { site: string; views: number; unique: number }[],
  recent_views: [] as {
    id: string;
    path: string;
    referrer: string;
    browser: string;
    os: string;
    created_at: string;
    site?: string;
    country_code?: string;
    country?: string;
  }[],
  storage_configured: true,
};

function periodToCutoff(period: string): number {
  const now = Date.now();
  switch (period) {
    case "24h":
      return now - 24 * 60 * 60 * 1000;
    case "7d":
      return now - 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return now - 30 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

function prettySlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function referrerLabel(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 80);
  }
}

async function listDayPathnames(token: string): Promise<string[]> {
  const pathnames: string[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 5; page += 1) {
    const result = await list({ prefix: ANALYTICS_PREFIX, token, limit: 1000, cursor });
    pathnames.push(
      ...result.blobs
        .map((blob) => blob.pathname)
        .filter((pathname) => pathname.endsWith(".json")),
    );
    if (!result.hasMore || !result.cursor) break;
    cursor = result.cursor;
  }
  return pathnames;
}

async function readDayFile(pathname: string, token: string): Promise<DayFile | null> {
  try {
    const result = await get(pathname, { access: "private", token, useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const parsed = JSON.parse(await new Response(result.stream).text()) as DayFile;
    if (!parsed || !Array.isArray(parsed.events)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const period = req.nextUrl.searchParams.get("period") || "30d";
  const token = process.env.CONTENT_BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json({ ...EMPTY, storage_configured: false });
  }

  const cached = cache.get(period);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.payload);
  }

  try {
    const cutoff = periodToCutoff(period);
    const pathnames = await listDayPathnames(token);

    // Day files are named analytics/visits/YYYY-MM-DD.json — skip shards outside the window.
    const cutoffDay = cutoff > 0 ? new Date(cutoff).toISOString().slice(0, 10) : "0000-00-00";
    const wanted = pathnames.filter((pathname) => {
      const day = pathname.slice(ANALYTICS_PREFIX.length, -".json".length);
      return day >= cutoffDay;
    });

    const dayFiles = await Promise.all(wanted.map((pathname) => readDayFile(pathname, token)));
    const events = dayFiles
      .flatMap((file) => file?.events ?? [])
      .filter((event) => Date.parse(event.timestamp) >= cutoff);

    const totalViews = events.length;
    const uniqueVisitors = new Set(events.map((event) => event.visitor).filter(Boolean)).size;
    const today = new Date().toISOString().slice(0, 10);

    const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
    const referrerMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const locationMap = new Map<
      string,
      {
        label: string;
        country: string;
        country_code: string;
        views: number;
        visitors: Set<string>;
        lat?: number;
        long?: number;
      }
    >();
    const trendMap = new Map<string, { views: number; visitors: Set<string> }>();
    const siteMap = new Map<string, { views: number; visitors: Set<string> }>();

    for (const event of events) {
      const page = pageMap.get(event.path) ?? { views: 0, visitors: new Set<string>() };
      page.views += 1;
      if (event.visitor) page.visitors.add(event.visitor);
      pageMap.set(event.path, page);

      const referrer = referrerLabel(event.referrer);
      referrerMap.set(referrer, (referrerMap.get(referrer) ?? 0) + 1);
      deviceMap.set(event.device || "Unknown", (deviceMap.get(event.device || "Unknown") ?? 0) + 1);
      browserMap.set(event.browser || "Unknown", (browserMap.get(event.browser || "Unknown") ?? 0) + 1);

      const code = event.country_code || "XX";
      const hasCoords =
        typeof event.latitude === "number" &&
        typeof event.longitude === "number" &&
        Number.isFinite(event.latitude) &&
        Number.isFinite(event.longitude);
      const cityName = event.city || "";
      const locationKey = hasCoords && cityName ? `${cityName}|${code}` : `${code}`;
      const location = locationMap.get(locationKey) ?? {
        label: (hasCoords && cityName) || event.country || "Unknown",
        country: event.country || "Unknown",
        country_code: code,
        views: 0,
        visitors: new Set<string>(),
        lat: hasCoords ? event.latitude ?? undefined : undefined,
        long: hasCoords ? event.longitude ?? undefined : undefined,
      };
      location.views += 1;
      if (event.visitor) location.visitors.add(event.visitor);
      locationMap.set(locationKey, location);

      const day = event.timestamp.slice(0, 10);
      const trend = trendMap.get(day) ?? { views: 0, visitors: new Set<string>() };
      trend.views += 1;
      if (event.visitor) trend.visitors.add(event.visitor);
      trendMap.set(day, trend);

      const siteName = event.site || "hazel-vampyr.vercel.app";
      const site = siteMap.get(siteName) ?? { views: 0, visitors: new Set<string>() };
      site.views += 1;
      if (event.visitor) site.visitors.add(event.visitor);
      siteMap.set(siteName, site);
    }

    const total = Math.max(1, totalViews);

    const topPages = Array.from(pageMap.entries())
      .map(([path, stat]) => ({ path, views: stat.views, unique: stat.visitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topPosts = topPages
      .filter((page) => page.path.startsWith("/blog/") && page.path !== "/blog/")
      .map((page) => {
        const slug = page.path.replace(/^\/blog\//, "").split(/[/?#]/)[0];
        return { slug, title: prettySlug(slug), views: page.views, unique: page.unique };
      })
      .slice(0, 10);

    // Globe rows: one per city when coordinates are known, else per country.
    const countryStats = Array.from(locationMap.entries())
      .map(([key, stat]) => ({
        country_code: stat.country_code,
        country: stat.label,
        views: stat.views,
        unique: stat.visitors.size,
        percentage: Math.round((stat.views / total) * 1000) / 10,
        lat: stat.lat,
        long: stat.long,
        key,
      }))
      .sort((a, b) => b.views - a.views);

    const cityStats = Array.from(locationMap.values())
      .filter((stat) => typeof stat.lat === "number" && typeof stat.long === "number")
      .map((stat) => ({
        city: stat.label,
        country: stat.country,
        country_code: stat.country_code,
        views: stat.views,
        unique: stat.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 12);

    const payload = {
      total_views: totalViews,
      unique_visitors: uniqueVisitors,
      views_today: trendMap.get(today)?.views ?? 0,
      views_trend: Array.from(trendMap.entries())
        .map(([date, stat]) => ({ date, views: stat.views, unique: stat.visitors.size }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      top_pages: topPages,
      top_posts: topPosts,
      top_referrers: Array.from(referrerMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      device_stats: Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
      browser_stats: Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count),
      country_stats: countryStats,
      city_stats: cityStats,
      site_stats: Array.from(siteMap.entries())
        .map(([site, stat]) => ({ site, views: stat.views, unique: stat.visitors.size }))
        .sort((a, b) => b.views - a.views),
      recent_views: [...events]
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, 25)
        .map((event) => ({
          id: event.id,
          path: event.path,
          referrer: event.referrer,
          browser: event.browser,
          os: event.os,
          created_at: event.timestamp,
          site: event.site,
          country_code: event.country_code,
          country: event.country,
        })),
      storage_configured: true,
    };

    cache.set(period, { expires: Date.now() + CACHE_TTL_MS, payload });
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Unable to load analytics", error);
    return NextResponse.json({ ...EMPTY, storage_configured: Boolean(token) }, { status: 200 });
  }
}
