import { defineConfig } from "drizzle-kit";

/**
 * Used only by `npm run db:generate` to turn changes in src/lib/db/schema.ts
 * into SQL migration files (./drizzle). The app applies those migrations
 * itself on start-up (see src/lib/db/migrate.ts), so you never need to run
 * `drizzle-kit migrate` or `drizzle-kit push` against your database.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
});
