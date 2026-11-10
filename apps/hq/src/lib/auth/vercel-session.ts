import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { get, put } from "@vercel/blob";

export type VercelAdminSession = {
  id: "vercel-owner";
  email: string;
  username: string;
  full_name: string;
  is_superadmin: true;
  permissions: ["*"];
  type: "session" | "2fa";
  iat: number;
  exp: number;
};

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  return value;
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function issueAdminToken(email: string, type: VercelAdminSession["type"], ttlSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const payload: VercelAdminSession = {
    id: "vercel-owner",
    email,
    username: email.split("@")[0],
    full_name: email.split("@")[0],
    is_superadmin: true,
    permissions: ["*"],
    type,
    iat: now,
    exp: now + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signed = `v1.${body}`;
  return `${signed}.${signature(signed)}`;
}

export async function consumeRecoveryCode(code: string): Promise<boolean> {
  const token = process.env.CONTENT_BLOB_READ_WRITE_TOKEN;
  const hashesRaw = process.env.ADMIN_RECOVERY_CODE_HASHES || "[]";
  if (!token) return false;
  let hashes: string[];
  try { hashes = JSON.parse(hashesRaw); } catch { return false; }
  if (!Array.isArray(hashes) || !hashes.length) return false;
  const usedResult = await get("auth/recovery-used.json", { access: "private", token, useCache: false }).catch(() => null);
  let used: number[] = [];
  if (usedResult?.statusCode === 200 && usedResult.stream) {
    try { const parsed = await new Response(usedResult.stream).json() as { used?: number[] }; used = Array.isArray(parsed.used) ? parsed.used : []; } catch { used = []; }
  }
  for (let i = 0; i < hashes.length; i += 1) {
    if (used.includes(i) || typeof hashes[i] !== "string") continue;
    if (await bcrypt.compare(code.trim().toUpperCase(), hashes[i]).catch(() => false)) {
      used.push(i);
      await put("auth/recovery-used.json", JSON.stringify({ used }), { access: "private", token, addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
      return true;
    }
  }
  return false;
}

export function verifyAdminToken(token: string | undefined, expectedType: VercelAdminSession["type"] = "session"): VercelAdminSession | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const signed = `${parts[0]}.${parts[1]}`;
  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = Buffer.from(signature(signed));
    actual = Buffer.from(parts[2]);
  } catch {
    return null;
  }
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as VercelAdminSession;
    if (payload.type !== expectedType || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    const allowlist = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!allowlist || payload.email.toLowerCase() !== allowlist) return null;
    return payload;
  } catch {
    return null;
  }
}
