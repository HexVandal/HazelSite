import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, audit, hasRole, randomToken, sha256 } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
const scopesAllowed = new Set(["content:read","content:write","storage:write","logs:read","telemetry:read","admin:*"]);
export async function GET(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "admin")) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  const { rows } = await query("select id,name,prefix,scopes,last_used_at,expires_at,revoked_at,created_at from api_tokens order by created_at desc limit 200");
  return NextResponse.json({ tokens: rows });
}
const schema = z.object({ name: z.string().trim().min(2).max(80), scopes: z.array(z.string()).min(1).max(12), expiresAt: z.string().datetime().optional() });
export async function POST(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "owner")) return NextResponse.json({ error: "Owner access required to create API tokens." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.scopes.some((scope) => !scopesAllowed.has(scope))) return NextResponse.json({ error: "Token name or scopes are invalid." }, { status: 400 });
  const raw = `gloom_${randomToken(32)}`;
  const prefix = raw.slice(0, 14);
  const { rows } = await query("insert into api_tokens(user_id,name,prefix,token_hash,scopes,expires_at) values($1,$2,$3,$4,$5,$6) returning id,name,prefix,scopes,expires_at,created_at", [actor.id, parsed.data.name, prefix, sha256(raw), parsed.data.scopes, parsed.data.expiresAt ?? null]);
  await audit(actor, "api_token.created", { id: rows[0].id, scopes: parsed.data.scopes });
  return NextResponse.json({ token: raw, record: rows[0], warning: "Copy this token now. Its secret cannot be retrieved again." }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "owner")) return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Token ID is required." }, { status: 400 });
  await query("update api_tokens set revoked_at=now() where id=$1 and revoked_at is null", [id]);
  await audit(actor, "api_token.revoked", { id });
  return NextResponse.json({ ok: true });
}
