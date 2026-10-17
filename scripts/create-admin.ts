/**
 * Creates an admin (or staff) account, or resets the password of an existing one.
 *
 *   npm run admin:create
 *   npm run admin:create -- --email owner@garage.in --name "Ramesh" --role admin
 *
 * Works against DATABASE_URL (production) or the local demo database.
 */
import { loadEnvConfig } from "@next/env";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

loadEnvConfig(process.cwd());

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function askHidden(question: string): Promise<string> {
  if (!stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(question);
    rl.close();
    return answer;
  }
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();
  let value = "";
  return new Promise((resolve) => {
    const onData = (buf: Buffer) => {
      const ch = buf.toString("utf8");
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off("data", onData);
        stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(130);
      } else if (ch === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const { getDb, closeDb, getDbMode } = await import("../src/lib/db/client");
  const { adminUsers } = await import("../src/lib/db/schema");
  const { hashPassword, checkPasswordStrength } = await import("../src/lib/auth/password");
  const { eq, sql } = await import("drizzle-orm");

  const rl = createInterface({ input: stdin, output: stdout });
  const email = (arg("email") ?? (await rl.question("Email: "))).trim().toLowerCase();
  const name = (arg("name") ?? (await rl.question("Name: "))).trim() || "Garage Owner";
  const role = (arg("role") ?? "admin").trim();
  rl.close();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!["admin", "staff"].includes(role)) throw new Error('Role must be "admin" or "staff".');

  const password = process.env.NEW_ADMIN_PASSWORD ?? (await askHidden("Password (min 8 chars, letters + numbers): "));
  const problem = checkPasswordStrength(password);
  if (problem) throw new Error(problem);

  console.log(`Using the ${getDbMode() === "postgres" ? "PostgreSQL database (DATABASE_URL)" : "local demo database"}…`);
  const db = await getDb();
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const passwordHash = await hashPassword(password);
  if (existing) {
    await db
      .update(adminUsers)
      .set({ name, role, passwordHash, isActive: true, sessionVersion: sql`${adminUsers.sessionVersion} + 1`, updatedAt: new Date() })
      .where(eq(adminUsers.id, existing.id));
    console.log(`Updated ${email}: password reset, role "${role}", account active.`);
  } else {
    await db.insert(adminUsers).values({ name, email, role, passwordHash });
    console.log(`Created ${role} account for ${email}.`);
  }
  await closeDb();
}

main().catch((error) => {
  console.error("\nCould not create the account:", error instanceof Error ? error.message : error);
  process.exit(1);
});
