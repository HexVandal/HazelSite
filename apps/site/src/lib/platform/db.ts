import "server-only";
import { Pool, type QueryResultRow } from "pg";

type DbGlobal = typeof globalThis & { __gloomApiPool?: Pool };

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const root = globalThis as DbGlobal;
  root.__gloomApiPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === "disable" ? undefined : process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  return root.__gloomApiPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export async function rateLimit(bucket: string, limit: number, windowSeconds: number) {
  const { rows } = await query<{ request_count: number }>(
    `insert into api_rate_limits(bucket, window_started_at, request_count)
     values ($1, now(), 1)
     on conflict(bucket) do update set
       request_count = case when api_rate_limits.window_started_at < now() - ($2 * interval '1 second') then 1 else api_rate_limits.request_count + 1 end,
       window_started_at = case when api_rate_limits.window_started_at < now() - ($2 * interval '1 second') then now() else api_rate_limits.window_started_at end
     returning request_count`,
    [bucket, windowSeconds],
  );
  return Number(rows[0]?.request_count ?? 0) <= limit;
}
