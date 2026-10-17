"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Download, Search, X } from "lucide-react";
import { BOOKING_STATUSES, VEHICLE_TYPES } from "@/lib/constants";
import { inputClasses } from "@/components/ui/field";
import { addDays, todayIST } from "@/lib/dates";
import { cn } from "@/lib/format";

export function BookingFilters({ canExport }: { canExport: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<number | undefined>(undefined);

  const apply = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  // Keep the search box in sync when the URL changes (e.g. "Clear filters" or back/forward).
  const urlQ = params.get("q") ?? "";
  const [syncedQ, setSyncedQ] = useState(urlQ);
  if (urlQ !== syncedQ) {
    setSyncedQ(urlQ);
    setQ(urlQ);
  }

  const onSearch = (value: string) => {
    setQ(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => apply({ q: value.trim() || null }), 350);
  };

  const today = todayIST();
  const presets = [
    { label: "Today", from: today, to: today },
    { label: "Next 7 days", from: today, to: addDays(today, 7) },
    { label: "Last 30 days", from: addDays(today, -30), to: today },
  ];
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const hasFilters = ["q", "status", "vehicle", "from", "to"].some((k) => params.get(k));
  const exportHref = `/api/admin/bookings/export${params.size ? `?${params}` : ""}`;

  const control = cn(inputClasses, "h-10 rounded-md text-[0.9rem]");

  return (
    <div className={cn("space-y-3 transition-opacity", pending && "opacity-60")}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="relative min-w-[16rem] flex-1">
          <span className="sr-only">Search bookings</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name, mobile, registration or job no."
            className={cn(control, "pl-9")}
          />
        </label>
        <label className="w-40">
          <span className="mb-1 block text-[0.78rem] text-slate">Status</span>
          <select className={control} value={params.get("status") ?? ""} onChange={(e) => apply({ status: e.target.value || null })}>
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="w-40">
          <span className="mb-1 block text-[0.78rem] text-slate">Vehicle</span>
          <select className={control} value={params.get("vehicle") ?? ""} onChange={(e) => apply({ vehicle: e.target.value || null })}>
            <option value="">All vehicles</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="w-44">
          <span className="mb-1 block text-[0.78rem] text-slate">Sort by</span>
          <select className={control} value={params.get("sort") ?? "newest"} onChange={(e) => apply({ sort: e.target.value === "newest" ? null : e.target.value })}>
            <option value="newest">Newest bookings</option>
            <option value="oldest">Oldest bookings</option>
            <option value="appointment">Appointment (soonest)</option>
            <option value="appointment_desc">Appointment (latest)</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Appointment date presets">
          {presets.map((p) => {
            const active = from === p.from && to === p.to;
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                onClick={() => apply(active ? { from: null, to: null } : { from: p.from, to: p.to })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.84rem] font-medium",
                  active ? "border-charcoal bg-charcoal text-white" : "border-line bg-white hover:border-charcoal/40",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <label>
          <span className="mb-1 block text-[0.78rem] text-slate">Appointment from</span>
          <input type="date" className={cn(control, "w-40")} value={from} onChange={(e) => apply({ from: e.target.value || null })} />
        </label>
        <label>
          <span className="mb-1 block text-[0.78rem] text-slate">to</span>
          <input type="date" className={cn(control, "w-40")} value={to} min={from || undefined} onChange={(e) => apply({ to: e.target.value || null })} />
        </label>
        <div className="ml-auto flex gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                startTransition(() => router.replace(pathname, { scroll: false }));
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-[0.88rem] font-medium text-slate hover:bg-white hover:text-charcoal"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          )}
          {canExport && (
            <a href={exportHref} className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[0.88rem] font-medium hover:bg-paper">
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
