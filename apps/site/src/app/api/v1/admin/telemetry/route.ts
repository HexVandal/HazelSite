import os from "node:os";
import { NextRequest, NextResponse } from "next/server";
import { authenticate, hasRole, hasScope } from "@/lib/platform/auth";
import { getPool, query } from "@/lib/platform/db";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !(actor.tokenId ? hasScope(actor,"telemetry:read") : hasRole(actor,"admin"))) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  let dbLatencyMs: number | null = null;
  try { const start = performance.now(); await query("select 1"); dbLatencyMs = Math.round(performance.now() - start); } catch { /* report degraded DB */ }
  const mem = process.memoryUsage();
  const load = os.loadavg();
  const sample = { processUptime: Math.round(process.uptime()), rssBytes: mem.rss, heapUsedBytes: mem.heapUsed, load1m: load[0] ?? null, dbLatencyMs, poolTotal: getPool().totalCount };
  await query("insert into telemetry_samples(process_uptime_seconds,rss_bytes,heap_used_bytes,load_1m,db_latency_ms,db_pool_total) values($1,$2,$3,$4,$5,$6)", [sample.processUptime, sample.rssBytes, sample.heapUsedBytes, sample.load1m, sample.dbLatencyMs, sample.poolTotal]);
  const history = request.nextUrl.searchParams.get("history") === "true" ? (await query("select sampled_at,process_uptime_seconds,rss_bytes,heap_used_bytes,load_1m,db_latency_ms,db_pool_total from telemetry_samples order by sampled_at desc limit 120")).rows : [];
  return NextResponse.json({ runtime: "node-process/container", sample, history: history.reverse(), note: "On serverless hosts these are per-instance process/container metrics, not physical host CPU or clock telemetry." }, { headers: { "Cache-Control": "no-store" } });
}
