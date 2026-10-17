import { mkdirSync } from "node:fs";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { runMigrations } from "./migrate";
import { seedDatabase } from "./seed";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
export type DbMode = "postgres" | "demo";

/**
 * Database connection.
 *
 *  • DATABASE_URL set (e.g. Neon)  → real PostgreSQL via node-postgres.
 *  • DATABASE_URL not set          → "demo mode": PGlite, a full PostgreSQL
 *    engine running inside Node. Data is stored in ./.data/pglite locally
 *    (in memory on serverless hosts), so the demo works with zero setup.
 *
 * Both modes run exactly the same schema, migrations and queries.
 */
export function getDatabaseUrl(): string {
  // DATABASE_URL is the documented setting (Neon or any PostgreSQL). The Netlify
  // variables are picked up as a convenience when a Netlify-managed database is attached.
  return (process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || process.env.NETLIFY_DATABASE_URL || "").trim();
}

export function getDbMode(): DbMode {
  return getDatabaseUrl() ? "postgres" : "demo";
}

/** Where demo-mode data lives: on disk locally, in memory on serverless hosts. */
export function demoStorage(): "disk" | "memory" {
  const configured = process.env.PGLITE_DATA_DIR?.trim();
  if (configured === "memory") return "memory";
  if (!configured && isServerlessHost()) return "memory";
  return "disk";
}

/**
 * node-postgres 8 already treats sslmode=require/prefer/verify-ca as full
 * certificate verification but logs a deprecation warning, and pg 9 will
 * weaken those modes. Neon (and other hosted Postgres) use publicly trusted
 * certificates, so we ask for verify-full explicitly: same behaviour today,
 * no warning, and no silent downgrade later.
 */
function normalizeSslMode(url: string): string {
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");
    if (mode && ["prefer", "require", "verify-ca"].includes(mode) && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
  } catch {
    // Not a URL-style connection string; pass it through unchanged.
  }
  return url;
}

type DbState = {
  promise: Promise<Database> | null;
  close: (() => Promise<void>) | null;
};

const globalForDb = globalThis as unknown as { __garageDb?: DbState };
const state: DbState = (globalForDb.__garageDb ??= { promise: null, close: null });

export function getDb(): Promise<Database> {
  if (!state.promise) {
    state.promise = connect().catch((error) => {
      state.promise = null;
      throw error;
    });
  }
  return state.promise;
}

/** Closes the connection (used by CLI scripts). */
export async function closeDb(): Promise<void> {
  const close = state.close;
  state.promise = null;
  state.close = null;
  if (close) await close();
}

function isServerlessHost(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT,
  );
}

function resolvePgliteDir(): string | undefined {
  const configured = process.env.PGLITE_DATA_DIR?.trim();
  if (configured === "memory") return undefined;
  if (!configured && isServerlessHost()) return undefined; // read-only file system
  const dir = path.resolve(/*turbopackIgnore: true*/ configured || path.join(process.cwd(), ".data", "pglite"));
  try {
    mkdirSync(path.dirname(dir), { recursive: true });
    return dir;
  } catch {
    console.warn(`[db] Cannot write to ${dir}; demo data will be kept in memory only.`);
    return undefined;
  }
}

async function connect(): Promise<Database> {
  const url = getDatabaseUrl();
  let db: Database;

  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({
      connectionString: normalizeSslMode(url),
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    });
    pool.on("error", (err) => console.error("[db] Idle client error:", err.message));
    db = drizzle({ client: pool, schema }) as unknown as Database;
    state.close = () => pool.end();
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const dataDir = resolvePgliteDir();
    const client = dataDir ? new PGlite(dataDir) : new PGlite();
    await client.waitReady;
    db = drizzle({ client, schema }) as unknown as Database;
    state.close = () => client.close();
    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[db] Demo mode: using built-in PostgreSQL (PGlite) ${dataDir ? `at ${dataDir}` : "in memory"}. Set DATABASE_URL to use your own database.`,
      );
    }
  }

  const autoMigrate = !url || process.env.DB_AUTO_MIGRATE !== "false";
  if (autoMigrate) {
    await runMigrations(db);
    await seedDatabase(db, { mode: url ? "postgres" : "demo" });
  }
  return db;
}
