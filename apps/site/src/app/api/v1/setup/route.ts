import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPool } from "@/lib/platform/db";
import { createSession, audit } from "@/lib/platform/auth";
export const runtime = "nodejs";
const schema = z.object({ setupToken: z.string().min(24), email: z.string().email().max(254), password: z.string().min(12).max(128), displayName: z.string().max(80).default("Owner") });
export async function POST(request: NextRequest) {
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  if (!setupToken) return NextResponse.json({ error: "Initial setup is disabled. Configure ADMIN_SETUP_TOKEN before creating the first owner." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.setupToken !== setupToken) return NextResponse.json({ error: "Invalid setup request." }, { status: 403 });
  const client = await getPool().connect();
  let owner: { id: string; email: string; display_name: string; role: "owner"; session_version: number };
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(hashtext('hazelsite-first-owner'))");
    const count = await client.query("select count(*)::int as count from admin_users");
    if (count.rows[0].count > 0) { await client.query("rollback"); return NextResponse.json({ error: "An administrator already exists; setup is closed." }, { status: 409 }); }
    const email = parsed.data.email.toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const result = await client.query("insert into admin_users(email,display_name,password_hash,role) values($1,$2,$3,'owner') returning id,email,display_name,role,session_version", [email, parsed.data.displayName, passwordHash]);
    owner = result.rows[0];
    await client.query("commit");
  } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
  await createSession(owner);
  await audit({ id: owner.id, email: owner.email, displayName: owner.display_name, role: owner.role, scopes: ["*"] }, "admin.owner_bootstrapped");
  return NextResponse.json({ ok: true, user: { id: owner.id, email: owner.email, displayName: owner.display_name, role: owner.role } }, { status: 201 });
}
