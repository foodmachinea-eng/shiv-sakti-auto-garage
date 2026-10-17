"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BOOKING_STATUSES } from "@/lib/constants";
import { apiRequest } from "@/lib/client-api";
import { cn } from "@/lib/format";

const tone: Record<string, string> = {
  pending: "border-[#f3d38a] bg-[#fff6e0] text-[#8a5300]",
  confirmed: "border-[#bcd2fb] bg-[#ebf2ff] text-[#1d4ed8]",
  completed: "border-[#b4e2c5] bg-[#e9f7ef] text-[#146c3a]",
  cancelled: "border-[#d5d8dd] bg-[#f1f2f4] text-[#4b5059]",
};

/** Inline status changer used in the bookings table. */
export function BookingStatusSelect({ id, status, reference, disabled }: { id: number; status: string; reference: string; disabled?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  return (
    <select
      aria-label={`Status for ${reference}`}
      value={value}
      disabled={disabled || saving}
      onChange={async (e) => {
        const next = e.target.value;
        const previous = value;
        setValue(next);
        setSaving(true);
        try {
          await apiRequest(`/api/admin/bookings/${id}`, { method: "PATCH", body: { status: next } });
          toast.success(`${reference} marked ${BOOKING_STATUSES.find((s) => s.value === next)?.label.toLowerCase()}`);
          router.refresh();
        } catch (err) {
          setValue(previous);
          toast.error((err as Error).message);
        } finally {
          setSaving(false);
        }
      }}
      className={cn(
        "h-8 cursor-pointer rounded-full border pl-3 pr-7 text-[0.8rem] font-semibold disabled:cursor-wait disabled:opacity-60",
        tone[value] ?? tone.pending,
      )}
    >
      {BOOKING_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
