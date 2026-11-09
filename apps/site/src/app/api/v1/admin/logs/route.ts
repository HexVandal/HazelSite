import { NextRequest, NextResponse } from "next/server";
import { authenticate, hasRole, hasScope } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !(actor.tokenId ? hasScope(actor,"logs:read") : hasRole(actor,"admin"))) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  const limit = Math.min(500, Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 100)));
  const level = request.nextUrl.searchParams.get("level");
  const event = request.nextUrl.searchParams.get("event");
  const params: unknown[] = [];
  const clauses: string[] = [];
  if (["debug","info","warn","error"].includes(level || "")) { params.push(level); clauses.push(`level=$${params.length}`); }
  if (event) { params.push(`%${event.slice(0,80)}%`); clauses.push(`event ilike $${params.length}`); }
  params.push(limit);
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const { rows } = await query(`select id,level,event,request_id,actor_id,metadata,created_at from structured_logs ${where} order by created_at desc limit $${params.length}`, params);
  return NextResponse.json({ logs: rows }, { headers: { "Cache-Control": "no-store" } });
}
