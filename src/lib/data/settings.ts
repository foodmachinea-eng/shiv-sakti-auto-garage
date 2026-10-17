import "server-only";
import { cache } from "react";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { DEFAULT_SETTINGS } from "@/content/defaults";
import {
  settingsSchemas,
  type SettingsKey,
  type SiteSettings,
} from "@/content/settings-schema";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merges stored values over defaults (arrays are replaced, not merged). */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = key in base ? deepMerge((base as Record<string, unknown>)[key], value) : value;
  }
  return out as T;
}

/** All editable site content. Falls back to the defaults if the database is unavailable. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const settings = structuredClone(DEFAULT_SETTINGS);
  try {
    const db = await getDb();
    const rows = await db.select().from(siteSettings);
    for (const row of rows) {
      if (!(row.key in settingsSchemas)) continue;
      const key = row.key as SettingsKey;
      const merged = deepMerge(DEFAULT_SETTINGS[key], row.value);
      const parsed = settingsSchemas[key].safeParse(merged);
      if (parsed.success) {
        (settings as Record<SettingsKey, unknown>)[key] = parsed.data;
      } else {
        console.warn(`[settings] Stored "${key}" settings are invalid; using defaults.`);
      }
    }
  } catch (error) {
    console.error("[settings] Could not load settings from the database:", error);
  }
  return settings;
});

export async function saveSettingsSection<K extends SettingsKey>(key: K, value: SiteSettings[K]) {
  const db = await getDb();
  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: sql`now()` } });
}
