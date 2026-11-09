import "server-only";
import { createHash, randomBytes, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { query } from "@/lib/platform/db";

export type AdminRole = "owner" | "admin" | "editor" | "moderator" | "viewer";
export type Actor = { id: string; email: string; displayName: string; role: AdminRole; scopes: string[]; tokenId?: string };
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-gloom_session" : "gloom_session";
const encoder = new TextEncoder();

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return encoder.encode(value);
}

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const visitorDigest = (value: string) => createHmac("sha256", process.env.SESSION_SECRET || "local-development-only").update(value).digest("hex");

export async function createSession(user: { id: string; email: string; display_name: string; role: AdminRole; session_version: number }) {
  const token = await new SignJWT({ email: user.email, role: user.role, sv: user.session_version })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuer("gloom-api").setAudience("gloom-admin")
    .setIssuedAt().setExpirationTime("8h").sign(sessionSecret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export async function authenticate(request: Request): Promise<Actor | null> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (token) {
    const hash = sha256(token);
    const { rows } = await query<{ token_id: string; scopes: string[]; id: string; email: string; display_name: string; role: AdminRole }>(
      `select t.id as token_id,t.scopes,u.id,u.email,u.display_name,u.role from api_tokens t join admin_users u on u.id=t.user_id where t.token_hash=$1 and t.revoked_at is null and (t.expires_at is null or t.expires_at>now()) and u.disabled_at is null limit 1`, [hash],
    );
    const row = rows[0];
    if (!row) return null;
    void query("update api_tokens set last_used_at=now() where id=$1", [row.token_id]).catch(() => undefined);
    return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, scopes: row.scopes, tokenId: row.token_id };
  }

  const { cookies: requestCookies } = await import("next/headers");
  const jar = await requestCookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, sessionSecret(), { issuer: "gloom-api", audience: "gloom-admin" });
    const id = String(payload.sub || "");
    if (!id) return null;
    const { rows } = await query<{ id: string; email: string; display_name: string; role: AdminRole; session_version: number; disabled_at: Date | null }>(
      "select id,email,display_name,role,session_version,disabled_at from admin_users where id=$1 limit 1", [id],
    );
    const user = rows[0];
    if (!user || user.disabled_at || user.session_version !== Number(payload.sv)) return null;
    return { id: user.id, email: user.email, displayName: user.display_name, role: user.role, scopes: ["*"] };
  } catch {
    return null;
  }
}

const roleRanks: Record<AdminRole, number> = { viewer: 1, moderator: 2, editor: 3, admin: 4, owner: 5 };
export function hasRole(actor: Actor, minimum: AdminRole) {
  if (actor.tokenId) return actor.scopes.includes("*") || actor.scopes.includes(`role:${minimum}`) || actor.scopes.includes("admin:*");
  return roleRanks[actor.role] >= roleRanks[minimum];
}

export function hasScope(actor: Actor, scope: string) {
  if (!actor.tokenId) return true;
  return actor.scopes.includes("*") || actor.scopes.includes(scope) || actor.scopes.includes("admin:*");
}

export async function audit(actor: Actor | null, event: string, metadata: Record<string, unknown> = {}, level: "info" | "warn" | "error" = "info") {
  try {
    await query("insert into structured_logs(level,event,actor_id,metadata) values($1,$2,$3,$4::jsonb)", [level, event.slice(0, 120), actor?.id ?? null, JSON.stringify(metadata)]);
  } catch {
    // Logging must not turn a successful user operation into a failure.
  }
}
