import { ApiError, assertSameOrigin, handle, ok, readJson } from "@/lib/api";
import { requireApiUser } from "@/lib/auth/dal";
import { saveSettingsSection } from "@/lib/data/settings";
import { settingsSchemas, type SettingsKey, type SiteSettings } from "@/content/settings-schema";

export const dynamic = "force-dynamic";

/** Saves one section of the editable website content (business, home, about, pricing, branding). */
export const PUT = handle(async (request: Request, ctx: RouteContext<"/api/admin/settings/[section]">) => {
  assertSameOrigin(request);
  await requireApiUser("content.manage");
  const { section } = await ctx.params;
  if (!(section in settingsSchemas)) throw new ApiError(404, "Unknown settings section.");
  const key = section as SettingsKey;
  const value = (await readJson(request, settingsSchemas[key], 100_000)) as SiteSettings[typeof key];
  await saveSettingsSection(key, value);
  return ok({ ok: true, value });
});
