"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, Clock } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { PACKAGE_CLASSES } from "@/lib/constants";
import { cn, formatINR } from "@/lib/format";

export type PackageView = {
  id: number;
  name: string;
  vehicleClass: string;
  tagline: string;
  price: number | null;
  duration: string;
  features: string[];
  isPopular: boolean;
};

const BOOKING_VEHICLE: Record<string, string> = { car: "car", bike: "bike", other: "other" };

export function PackagesBrowser({
  packages,
  priceLabel,
  compact = false,
}: {
  packages: PackageView[];
  priceLabel: string;
  compact?: boolean;
}) {
  const classes = PACKAGE_CLASSES.filter((c) => packages.some((p) => p.vehicleClass === c.value));
  const [active, setActive] = useState<string>(classes[0]?.value ?? "car");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + classes.length) % classes.length;
    setActive(classes[next].value);
    tabRefs.current[next]?.focus();
  };

  if (!classes.length) {
    return <p className="text-slate">Service packages will be listed here soon. Call us for a quote.</p>;
  }

  const visible = packages.filter((p) => p.vehicleClass === active);

  return (
    <div>
      {classes.length > 1 && (
        <div role="tablist" aria-label="Vehicle type" className="inline-flex rounded-[3px] border border-charcoal/15 bg-white p-1">
          {classes.map((c, i) => (
            <button
              key={c.value}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${c.value}`}
              aria-selected={active === c.value}
              aria-controls={`${baseId}-panel`}
              tabIndex={active === c.value ? 0 : -1}
              onClick={() => setActive(c.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "rounded-[2px] px-4 py-2 font-display text-[1rem] font-semibold transition-colors sm:px-5",
                active === c.value ? "bg-charcoal text-white" : "text-slate hover:text-charcoal",
              )}
              style={{ fontStretch: "88%" }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* Each card spans 4 rows of a shared subgrid so names, prices, lists and buttons line up. */}
        {visible.map((pkg) => {
          const dark = pkg.isPopular;
          const features = compact ? pkg.features.slice(0, 5) : pkg.features;
          const hidden = pkg.features.length - features.length;
          return (
            <article
              key={pkg.id}
              className={cn(
                "row-span-4 grid grid-rows-subgrid gap-y-0 rounded-[3px] p-6 animate-slide-up",
                dark ? "on-dark bg-charcoal text-white ring-2 ring-accent" : "bg-white text-charcoal ring-1 ring-line",
              )}
            >
              <div>
                {pkg.isPopular && (
                  <span className="mb-2 inline-block whitespace-nowrap rounded-full bg-accent px-2.5 py-0.5 text-[0.72rem] font-semibold text-white">
                    Most booked
                  </span>
                )}
                <h3 className="title-sm text-[1.3rem]">{pkg.name}</h3>
                {pkg.tagline && <p className={cn("mt-1 text-[0.92rem]", dark ? "text-fog" : "text-slate")}>{pkg.tagline}</p>}
              </div>

              <div className="mt-6">
                {pkg.price != null ? (
                  <p className="numerals text-[2.6rem] font-bold leading-none">{formatINR(pkg.price)}</p>
                ) : (
                  <p className="numerals text-[1.6rem] font-bold leading-tight">Price on inspection</p>
                )}
                <div className={cn("mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem]", dark ? "text-fog" : "text-slate")}>
                  <span
                    className={cn(
                      "rounded-[2px] border px-1.5 py-0.5 font-medium",
                      dark ? "border-white/25 text-white" : "border-charcoal/25 text-charcoal",
                    )}
                  >
                    {priceLabel}
                  </span>
                  {pkg.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {pkg.duration}
                    </span>
                  )}
                </div>
              </div>

              <ul className={cn("mt-6 space-y-2.5 self-start border-t pt-5 text-[0.93rem]", dark ? "border-white/12" : "border-line")}>
                {features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", dark ? "text-accent-bright" : "text-accent")} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
                {hidden > 0 && (
                  <li className={cn("pl-6.5 text-[0.88rem]", dark ? "text-fog" : "text-slate")}>+ {hidden} more included</li>
                )}
              </ul>

              <Link
                href={`/book?package=${pkg.id}&vehicle=${BOOKING_VEHICLE[pkg.vehicleClass] ?? "car"}`}
                className={buttonClasses(dark ? "primary" : "outline-dark", "md", "mt-7 w-full self-end")}
                style={{ fontStretch: "88%" }}
              >
                Book this package
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
