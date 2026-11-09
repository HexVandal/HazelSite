import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, audit, hasRole, randomToken, sha256 } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "owner")) return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  const { rows } = await query("select id,email,role,expires_at,accepted_at,created_at from admin_invitations order by created_at desc limit 200");
  return NextResponse.json({ invitations: rows });
}
const schema = z.object({ email: z.string().email().max(254), role: z.enum(["admin","editor","moderator","viewer"]) });
export async function POST(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !hasRole(actor, "owner")) return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and role." }, { status: 400 });
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  const email = parsed.data.email.toLowerCase();
  const { rows } = await query("insert into admin_invitations(email,role,token_hash,invited_by,expires_at) values($1,$2,$3,$4,$5) returning id,email,role,expires_at,created_at", [email, parsed.data.role, sha256(token), actor.id, expiresAt]);
  await audit(actor, "admin.invited", { email, role: parsed.data.role });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  return NextResponse.json({ invitation: rows[0], inviteUrl: `${origin}/admin/accept-invite?token=${encodeURIComponent(token)}`, delivery: "Copy and send this one-time link to the invitee; email delivery is not configured." }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
