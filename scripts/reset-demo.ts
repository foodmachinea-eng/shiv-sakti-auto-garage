/**
 * Deletes the local demo database (./.data/pglite) so the next start re-creates
 * it with fresh demo content. Never touches a DATABASE_URL database.
 * Stop `npm run dev` / `npm start` first.
 *
 *   npm run db:reset-demo
 */
import { loadEnvConfig } from "@next/env";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

const configured = process.env.PGLITE_DATA_DIR?.trim();
if (configured === "memory") {
  console.log("PGLITE_DATA_DIR is set to memory: the demo database resets on every restart, so there is nothing to delete.");
  process.exit(0);
}

const dir = path.resolve(configured || path.join(process.cwd(), ".data", "pglite"));
if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`Deleted the demo database at ${dir}. Fresh demo content is created on the next start.`);
} else {
  console.log("No local demo database found; nothing to reset.");
}
