"use client";

import { Icon, ICON_LABELS } from "@/components/icons";
import { ICON_KEYS } from "@/content/settings-schema";
import { cn } from "@/lib/format";

/** Grid of icon choices (radio buttons). */
export function IconSelect({ value, onChange, label = "Icon" }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <fieldset>
      <legend className="text-[0.88rem] font-medium">{label}</legend>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5 sm:grid-cols-10">
        {ICON_KEYS.map((key) => (
          <label
            key={key}
            title={ICON_LABELS[key]}
            className={cn(
              "relative flex h-10 cursor-pointer items-center justify-center rounded-md border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
              value === key ? "border-charcoal bg-charcoal text-white" : "border-line hover:border-charcoal/40",
            )}
          >
            <input type="radio" name="icon" value={key} checked={value === key} onChange={() => onChange(key)} className="sr-only" aria-label={ICON_LABELS[key]} />
            <Icon name={key} className="h-5 w-5" strokeWidth={1.8} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
