/**
 * Prepares the database: applies migrations, adds the starting website
 * content (only into empty tables) and creates the first admin account from
 * ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists yet.
 *
 *   npm run db:setup
 *
 * Safe to run any number of times. Deploy builds run it automatically
 * (`npm run build:deploy`, used by netlify.toml and vercel.json).
 * Without DATABASE_URL it prepares the local demo database instead.
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
process.env.DB_AUTO_MIGRATE = "true";

async function main() {
  const { getDb, closeDb, getDbMode } = await import("../src/lib/db/client");
  const { sql } = await import("drizzle-orm");
  const { rowsOf } = await import("../src/lib/db/migrate");

  const mode = getDbMode();
  if (mode === "demo" && process.env.REQUIRE_DATABASE_URL === "true") {
    throw new Error("DATABASE_URL is not set (REQUIRE_DATABASE_URL=true).");
  }
  if (mode === "demo" && (process.env.NETLIFY || process.env.VERCEL)) {
    console.log("No DATABASE_URL set for this deploy: the site will run in demo mode (temporary in-memory data).");
    return;
  }

  console.log(mode === "postgres" ? "Connecting to PostgreSQL…" : "Preparing the local demo database (PGlite)…");
  const db = await getDb();
  const counts = rowsOf<Record<string, number>>(
    await db.execute(sql`select
      (select count(*)::int from services) as services,
      (select count(*)::int from service_packages) as packages,
      (select count(*)::int from gallery_items) as gallery,
      (select count(*)::int from testimonials) as reviews,
      (select count(*)::int from bookings) as bookings,
      (select count(*)::int from enquiries) as enquiries,
      (select count(*)::int from admin_users) as admins`),
  )[0];
  console.log("Database ready:", counts);
  if (!counts?.admins) {
    console.log("\n⚠ No admin account yet. Run `npm run admin:create` or set ADMIN_EMAIL and ADMIN_PASSWORD.");
  }
  await closeDb();
}

main().catch((error) => {
  console.error("\nDatabase setup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
