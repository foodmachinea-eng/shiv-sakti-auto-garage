import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 249999 → "₹2,49,999" (Indian digit grouping) */
export function formatINR(amount: number): string {
  return `₹${inr.format(amount)}`;
}

/** Replaces {name} and {years} tokens in editable copy. */
export function fillTokens(text: string, tokens: { name: string; years: number | string }): string {
  return text.replaceAll("{name}", tokens.name).replaceAll("{years}", String(tokens.years));
}

/* ------------------------------------------------------------------ */
/* Phone numbers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Accepts "9876543210", "+91 98765-43210", "09876543210" …
 * Returns the canonical "+91 98765 43210" or null if it isn't a valid Indian mobile.
 */
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** "tel:" link from any formatted number. */
export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

/** wa.me click-to-chat link. `number` = digits with country code, e.g. 919876543210. */
export function whatsappHref(number: string, text?: string): string {
  const digits = number.replace(/\D/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** WhatsApp number (digits) for a customer's stored mobile like "+91 98765 43210". */
export function whatsappDigitsFromMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/* ------------------------------------------------------------------ */
/* Vehicle registration numbers                                        */
/* ------------------------------------------------------------------ */

/** Uppercases and removes spaces/dashes: "mh-12 ab 1234" → "MH12AB1234" */
export function compactRegistration(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Pretty-prints common Indian formats: "MH12AB1234" → "MH 12 AB 1234", "22BH1234AA" → "22 BH 1234 AA" */
export function formatRegistration(input: string): string {
  const c = compactRegistration(input);
  const bh = c.match(/^(\d{2})(BH)(\d{4})([A-Z]{1,2})$/);
  if (bh) return `${bh[1]} ${bh[2]} ${bh[3]} ${bh[4]}`;
  const std = c.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (std) return [std[1], std[2], std[3], std[4]].filter(Boolean).join(" ");
  return c;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
