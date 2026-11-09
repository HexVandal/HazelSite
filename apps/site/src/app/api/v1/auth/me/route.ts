import { NextRequest, NextResponse } from "next/server";
import { authenticate, audit, clearSession } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  const { rows } = await query<{ totp_enabled: boolean; created_at: Date }>("select totp_enabled,created_at from admin_users where id=$1", [actor.id]);
  return NextResponse.json({ user: { id: actor.id, email: actor.email, displayName: actor.displayName, role: actor.role, totpEnabled: rows[0]?.totp_enabled ?? false, createdAt: rows[0]?.created_at } }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(request: NextRequest) {
  const actor = await authenticate(request);
  if (actor) {
    await query("update admin_users set session_version=session_version+1,updated_at=now() where id=$1", [actor.id]);
    await audit(actor, "auth.logout");
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
