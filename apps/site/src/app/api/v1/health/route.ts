import { NextResponse } from "next/server";
import { databaseConfigured, query } from "@/lib/platform/db";
export const runtime = "nodejs";
export async function GET() {
  if (!databaseConfigured()) return NextResponse.json({ status: "degraded", api: "gloom-api", database: "not-configured" }, { status: 503 });
  try {
    await query("select 1");
    return NextResponse.json({ status: "ok", api: "gloom-api", database: "ok", time: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "degraded", api: "gloom-api", database: "unavailable" }, { status: 503 });
  }
}
