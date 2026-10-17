import { count, eq, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { Database, DbMode } from "./client";
import {
  adminUsers,
  appMeta,
  bookings,
  enquiries,
  galleryItems,
  serviceCategories,
  servicePackages,
  services,
  siteSettings,
  testimonials,
} from "./schema";
import { DEFAULT_SETTINGS } from "@/content/defaults";
import {
  SAMPLE_ENQUIRIES,
  SEED_CATEGORIES,
  SEED_GALLERY,
  SEED_PACKAGES,
  SEED_SERVICES,
  SEED_TESTIMONIALS,
  buildSampleBookings,
} from "@/content/seed-data";
import { SETTINGS_KEYS } from "@/content/settings-schema";
import { addDays, todayIST } from "@/lib/dates";
import { checkPasswordStrength, hashPassword } from "@/lib/auth/password";

const SEED_LOCK_ID = 727190442;

/** Demo-mode logins (only ever created when no DATABASE_URL is configured). */
export const DEMO_ACCOUNTS = [
  { name: "Demo Owner", email: "admin@example.com", password: "Demo@1234", role: "admin" },
  { name: "Demo Staff", email: "staff@example.com", password: "Staff@1234", role: "staff" },
] as const;

type SeedOptions = { mode: DbMode; sampleData?: boolean };

/**
 * Fills an empty database with the starting website content and, if needed,
 * the first admin account. Safe to run on every start-up: it only inserts
 * into empty tables and is serialised with an advisory lock.
 */
export async function seedDatabase(db: Database, opts: SeedOptions): Promise<void> {
  const sampleData = opts.sampleData ?? process.env.SEED_SAMPLE_DATA !== "false";

  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_ID})`);

    const seeded = await tx.select().from(appMeta).where(eq(appMeta.key, "content_seeded")).limit(1);
    if (seeded.length === 0) {
      for (const key of SETTINGS_KEYS) {
        await tx.insert(siteSettings).values({ key, value: DEFAULT_SETTINGS[key] }).onConflictDoNothing();
      }

      const isEmpty = async (table: PgTable) => {
        const [row] = await tx.select({ n: count() }).from(table);
        return Number(row?.n ?? 0) === 0;
      };

      if (await isEmpty(serviceCategories)) {
        await tx.insert(serviceCategories).values(
          SEED_CATEGORIES.map((c) => ({ ...c, vehicleTypes: [...c.vehicleTypes] })),
        );
      }
      const cats = await tx.select({ id: serviceCategories.id, slug: serviceCategories.slug }).from(serviceCategories);
      const catId = (slug: string) => cats.find((c) => c.slug === slug)?.id;

      if (await isEmpty(services)) {
        const rows = SEED_SERVICES.map((s, i) => ({
          categoryId: catId(s.category)!,
          slug: s.slug,
          name: s.name,
          description: s.description,
          icon: s.icon,
          priceFrom: s.priceFrom,
          priceNote: s.priceNote ?? "",
          duration: s.duration ?? "",
          isFeatured: !!s.featured,
          sortOrder: i + 1,
        })).filter((r) => r.categoryId);
        await tx.insert(services).values(rows);
      }

      if (await isEmpty(servicePackages)) {
        await tx.insert(servicePackages).values(
          SEED_PACKAGES.map((p, i) => ({ ...p, features: [...p.features], sortOrder: i + 1 })),
        );
      }

      if (await isEmpty(galleryItems)) {
        await tx.insert(galleryItems).values(
          SEED_GALLERY.map((g, i) => ({ ...g, caption: "", sortOrder: i + 1 })),
        );
      }

      if (await isEmpty(testimonials)) {
        await tx.insert(testimonials).values(
          SEED_TESTIMONIALS.map((t, i) => ({ ...t, isSample: true, isPublished: true, sortOrder: i + 1 })),
        );
      }

      if (sampleData) {
        if (await isEmpty(bookings)) {
          const svcRows = await tx
            .select({ id: services.id, name: services.name, categoryId: services.categoryId })
            .from(services);
          const byCat = (slug: string) =>
            svcRows.filter((s) => s.categoryId === catId(slug)).map(({ id, name }) => ({ id, name }));
          const sample = buildSampleBookings(
            todayIST(),
            { car: byCat("car"), bike: byCat("bike"), other: byCat("other") },
            addDays,
          );
          if (sample.length) await tx.insert(bookings).values(sample);
        }
        if (await isEmpty(enquiries)) {
          const now = Date.now();
          await tx.insert(enquiries).values(
            SAMPLE_ENQUIRIES.map(({ hoursAgo, ...e }) => {
              const at = new Date(now - hoursAgo * 3600_000);
              return { ...e, isSample: true, createdAt: at, updatedAt: at };
            }),
          );
        }
      }

      await tx
        .insert(appMeta)
        .values({ key: "content_seeded", value: new Date().toISOString() })
        .onConflictDoNothing();
      console.info("[db] Seeded starting website content.");
    }

    // ── First admin account ──────────────────────────────────────────
    const [{ n: adminCount }] = await tx.select({ n: count() }).from(adminUsers);
    if (Number(adminCount) > 0) return;

    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD ?? "";
    if (envEmail && envPassword) {
      const problem = checkPasswordStrength(envPassword);
      if (problem) {
        console.error(`[db] ADMIN_PASSWORD rejected: ${problem} No admin account was created.`);
        return;
      }
      await tx.insert(adminUsers).values({
        name: process.env.ADMIN_NAME?.trim() || "Garage Owner",
        email: envEmail,
        passwordHash: await hashPassword(envPassword),
        role: "admin",
      });
      console.info(`[db] Created admin account for ${envEmail} (from ADMIN_EMAIL / ADMIN_PASSWORD).`);
      return;
    }

    if (opts.mode === "demo") {
      for (const account of DEMO_ACCOUNTS) {
        await tx.insert(adminUsers).values({
          name: account.name,
          email: account.email,
          passwordHash: await hashPassword(account.password),
          role: account.role,
        });
      }
      console.info("[db] Created demo admin accounts (demo mode only).");
    } else {
      console.warn(
        "[db] No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart/redeploy, or run `npm run admin:create`.",
      );
    }
  });
}
