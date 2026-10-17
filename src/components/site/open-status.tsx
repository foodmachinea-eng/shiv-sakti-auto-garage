"use client";

import { useEffect, useState } from "react";
import type { DayHours } from "@/content/settings-schema";
import { formatTime, openStatus, weekdayName, type OpenStatus } from "@/lib/dates";
import { cn } from "@/lib/format";

function describe(status: OpenStatus): string {
  if (status.open) return `Open now, closes ${formatTime(status.closesAt)}`;
  if (status.nextOpensAt == null || status.nextOpenDay == null) return "Closed";
  if (status.isToday) return `Closed now, opens ${formatTime(status.nextOpensAt)}`;
  return `Closed now, opens ${weekdayName(status.nextOpenDay, true)} ${formatTime(status.nextOpensAt)}`;
}

/** Live "open / closed" indicator, calculated in India Standard Time in the visitor's browser. */
export function OpenStatusText({ hours, className }: { hours: DayHours[]; className?: string }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(openStatus(hours));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [hours]);

  if (!status) return <span className={cn("inline-block min-w-[12rem]", className)} aria-hidden="true" />;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          status.open ? "bg-[#2ecc71] shadow-[0_0_0_3px_rgba(46,204,113,0.18)]" : "bg-steel",
        )}
        aria-hidden="true"
      />
      {describe(status)}
    </span>
  );
}
