import { ACCENTS, type AccentKey } from "@/content/settings-schema";

/** Applies the brand accent colour chosen in Admin → Content & settings → Branding. */
export function BrandStyle({ accent }: { accent: AccentKey }) {
  const a = ACCENTS[accent] ?? ACCENTS.red;
  return <style>{`:root{--accent:${a.base};--accent-strong:${a.strong};--accent-bright:${a.bright}}`}</style>;
}
