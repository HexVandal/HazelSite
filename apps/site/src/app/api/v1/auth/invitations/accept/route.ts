import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "@/lib/platform/db";
import { sha256 } from "@/lib/platform/auth";
export const runtime = "nodejs";
const schema = z.object({ token: z.string().min(32).max(200), name: z.string().trim().min(2).max(80), password: z.string().min(12).max(200) });
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invitation details are invalid. Passwords must be at least 12 characters." }, { status: 400 });
  const client = await (await import("@/lib/platform/db")).getPool().connect();
  try {
    await client.query("begin");
    const result = await client.query("select id,email,role,expires_at from admin_invitations where token_hash=$1 and accepted_at is null and expires_at>now() for update", [sha256(parsed.data.token)]);
    const invitation = result.rows[0];
    if (!invitation) { await client.query("rollback"); return NextResponse.json({ error: "Invitation is invalid, expired, or already used." }, { status: 400 }); }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await client.query("insert into admin_users(email,name,password_hash,role) values($1,$2,$3,$4) on conflict(email) do nothing returning id", [invitation.email, parsed.data.name, passwordHash, invitation.role]);
    if (!user.rows[0]) { await client.query("rollback"); return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 }); }
    await client.query("update admin_invitations set accepted_at=now() where id=$1", [invitation.id]);
    await client.query("commit");
    return NextResponse.json({ ok: true, email: invitation.email, message: "Account created. You can now sign in." }, { status: 201 });
  } catch (error) { await client.query("rollback"); throw error; }
  finally { client.release(); }
}
