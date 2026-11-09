import { readFile } from "node:fs/promises";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to apply database/schema.sql");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const schema = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
  await pool.query(schema);
  console.log("HazelSite API database schema is up to date.");
} catch (error) {
  console.error("Database migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
