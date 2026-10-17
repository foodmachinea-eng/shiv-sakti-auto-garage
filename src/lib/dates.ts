import { TIMEZONE } from "./constants";
import type { DayHours } from "@/content/settings-schema";

/** All business dates/times are handled in India Standard Time, whatever the server's timezone. */

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const hmFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** YYYY-MM-DD for a moment, in IST. */
export function toISTDate(d: Date = new Date()): string {
  return ymdFormatter.format(d);
}

export function todayIST(): string {
  return toISTDate(new Date());
}

/** Minutes since midnight in IST. */
export function nowMinutesIST(d: Date = new Date()): number {
  const [h, m] = hmFormatter.format(d).split(":").map(Number);
  return h * 60 + m;
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(ymd: string): number {
  return new Date(`${ymd}T00:00:00Z`).getUTCDay();
}

export function isValidYmd(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = new Date(`${ymd}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === ymd;
}

export function toMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "14:30" → "2:30 PM" */
export function formatTime(hm: string): string {
  if (!/^\d{2}:\d{2}$/.test(hm)) return hm;
  const [h, m] = hm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function weekdayName(day: number, short = false): string {
  return (short ? WEEKDAYS_SHORT : WEEKDAYS)[day] ?? "";
}

/** "2026-10-14" → "Wed, 14 Oct 2026" */
export function formatDate(ymd: string, opts: { weekday?: boolean; year?: boolean } = {}): string {
  if (!isValidYmd(ymd)) return ymd;
  const { weekday = true, year = true } = opts;
  const d = new Date(`${ymd}T00:00:00Z`);
  const parts = [
    weekday ? `${WEEKDAYS_SHORT[d.getUTCDay()]},` : "",
    String(d.getUTCDate()),
    MONTHS_SHORT[d.getUTCMonth()],
    year ? String(d.getUTCFullYear()) : "",
  ].filter(Boolean);
  return parts.join(" ");
}

/** Timestamp → "14 Oct 2026, 3:05 PM" in IST */
export function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return `${formatDate(toISTDate(d), { weekday: false })}, ${formatTime(
    hmFormatter.format(d),
  )}`;
}

/** "3 hours ago", "2 days ago" … */
export function timeAgo(value: Date | string, now: Date = new Date()): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const secs = Math.max(0, Math.round((now.getTime() - d.getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(toISTDate(d), { weekday: false });
}

/* ------------------------------------------------------------------ */
/* Opening hours & booking slots                                       */
/* ------------------------------------------------------------------ */

export function hoursForDay(hours: DayHours[], day: number): DayHours | undefined {
  return hours.find((h) => h.day === day);
}

export function isOpenOn(hours: DayHours[], ymd: string): boolean {
  const h = hoursForDay(hours, weekdayOf(ymd));
  return !!h && !h.closed;
}

/** Slot start times ("HH:MM") for a date. The last slot starts one slot before closing. */
export function slotsForDate(hours: DayHours[], ymd: string, slotMinutes: number): string[] {
  const h = hoursForDay(hours, weekdayOf(ymd));
  if (!h || h.closed) return [];
  const open = toMinutes(h.open);
  const close = toMinutes(h.close);
  const slots: string[] = [];
  for (let t = open; t + slotMinutes <= close; t += slotMinutes) slots.push(fromMinutes(t));
  if (slots.length === 0 && close > open) slots.push(fromMinutes(open));
  return slots;
}

/** Slots that are still bookable (future slots only for today). */
export function availableSlots(
  hours: DayHours[],
  ymd: string,
  slotMinutes: number,
  now: Date = new Date(),
): string[] {
  const slots = slotsForDate(hours, ymd, slotMinutes);
  if (ymd !== toISTDate(now)) return slots;
  const current = nowMinutesIST(now);
  return slots.filter((s) => toMinutes(s) > current + 30);
}

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; nextOpenDay: number | null; nextOpensAt: string | null; isToday: boolean };

export function openStatus(hours: DayHours[], now: Date = new Date()): OpenStatus {
  const today = toISTDate(now);
  const day = weekdayOf(today);
  const mins = nowMinutesIST(now);
  const h = hoursForDay(hours, day);
  if (h && !h.closed && mins >= toMinutes(h.open) && mins < toMinutes(h.close)) {
    return { open: true, closesAt: h.close };
  }
  if (h && !h.closed && mins < toMinutes(h.open)) {
    return { open: false, nextOpenDay: day, nextOpensAt: h.open, isToday: true };
  }
  for (let i = 1; i <= 7; i++) {
    const next = hoursForDay(hours, (day + i) % 7);
    if (next && !next.closed) {
      return { open: false, nextOpenDay: next.day, nextOpensAt: next.open, isToday: false };
    }
  }
  return { open: false, nextOpenDay: null, nextOpensAt: null, isToday: false };
}

/** Groups consecutive days with identical hours: [{ label: "Mon – Sat", value: "9:00 AM – 8:00 PM" }, …] */
export function groupedHours(hours: DayHours[]): { label: string; value: string }[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const rows: { days: number[]; value: string }[] = [];
  for (const day of order) {
    const h = hoursForDay(hours, day);
    const value = !h || h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`;
    const last = rows[rows.length - 1];
    if (last && last.value === value) last.days.push(day);
    else rows.push({ days: [day], value });
  }
  return rows.map((r) => ({
    label:
      r.days.length === 1
        ? weekdayName(r.days[0])
        : `${weekdayName(r.days[0], true)} – ${weekdayName(r.days[r.days.length - 1], true)}`,
    value: r.value,
  }));
}
