"use client";

import { useState } from "react";
import { formatDate } from "@/lib/dates";

function niceMax(value: number): { max: number; step: number } {
  if (value <= 4) return { max: 4, step: 1 };
  const rawStep = value / 4;
  const pow = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rawStep) ?? rawStep;
  return { max: Math.ceil(value / step) * step, step };
}

/** Column chart: bookings received per day (single series, so no legend). */
export function DailyBookingsChart({ data }: { data: { day: string; count: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const { max, step } = niceMax(Math.max(1, ...data.map((d) => d.count)));
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <figure>
      <figcaption className="sr-only">Bookings received per day over the last 14 days, {total} in total.</figcaption>
      <div className="relative h-56 pl-8">
        {/* gridlines + y ticks */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center" style={{ bottom: `calc(${(t / max) * 100}% - 0.5px)` }} aria-hidden="true">
            <span className="w-7 pr-2 text-right text-[0.72rem] tabular-nums text-slate">{t}</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        ))}
        <ol className="absolute inset-y-0 left-8 right-0 flex items-end gap-0.5">
          {data.map((d, i) => {
            const isToday = i === data.length - 1;
            const label = `${formatDate(d.day, { year: false })}: ${d.count} booking${d.count === 1 ? "" : "s"}`;
            return (
              <li key={d.day} className="relative flex h-full flex-1 items-end justify-center">
                <button
                  type="button"
                  className="group relative flex h-full w-full items-end justify-center focus:outline-none"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={label}
                >
                  <span
                    className={`block w-[min(24px,70%)] rounded-t-[4px] transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent ${
                      active === i ? "bg-charcoal" : isToday ? "bg-graphite" : "bg-[#7b818b]"
                    }`}
                    style={{ height: d.count ? `${(d.count / max) * 100}%` : "2px", opacity: d.count ? 1 : 0.4 }}
                  />
                </button>
                {active === i && (
                  <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-2.5 py-1.5 text-white shadow-lg" role="tooltip">
                    <span className="block text-[0.95rem] font-semibold tabular-nums">{d.count}</span>
                    <span className="block text-[0.72rem] text-mist">{formatDate(d.day, { year: false })}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="mt-2 flex gap-0.5 pl-8" aria-hidden="true">
        {data.map((d, i) => {
          return (
            <span key={d.day} className="flex-1 text-center text-[0.68rem] leading-tight text-slate">
              {i === data.length - 1 ? "Today" : i % 2 === (data.length - 1) % 2 ? formatDate(d.day, { weekday: false, year: false }) : ""}
            </span>
          );
        })}
      </div>
      <div className="sr-only">
      <table>
        <caption>Bookings per day</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Bookings</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{formatDate(d.day)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
