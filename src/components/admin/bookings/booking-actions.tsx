"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, inputClasses } from "@/components/ui/field";
import { useConfirm } from "@/components/admin/ui-client";
import { BOOKING_STATUSES } from "@/lib/constants";
import { apiRequest } from "@/lib/client-api";
import { cn } from "@/lib/format";

export function BookingActions({
  booking,
  canUpdate,
  canDelete,
}: {
  booking: { id: number; reference: string; status: string; adminNotes: string; preferredDate: string; preferredTime: string };
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.adminNotes);
  const [date, setDate] = useState(booking.preferredDate);
  const [time, setTime] = useState(booking.preferredTime);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(body: Record<string, string>, label: string, key: string) {
    setBusy(key);
    try {
      await apiRequest(`/api/admin/bookings/${booking.id}`, { method: "PATCH", body });
      toast.success(label);
      router.refresh();
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-5 ring-1 ring-line">
        <h2 className="text-[1.02rem] font-semibold">Status</h2>
        <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Booking status">
          {BOOKING_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={!canUpdate || busy !== null}
              aria-pressed={status === s.value}
              onClick={async () => {
                if (s.value === status) return;
                const previous = status;
                setStatus(s.value);
                const ok = await patch({ status: s.value }, `Marked as ${s.label.toLowerCase()}`, `status-${s.value}`);
                if (!ok) setStatus(previous);
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-[0.9rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                status === s.value ? "border-charcoal bg-charcoal text-white" : "border-line bg-white hover:border-charcoal/40",
              )}
            >
              {status === s.value && <Check className="h-4 w-4" aria-hidden="true" />}
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 ring-1 ring-line">
        <h2 className="text-[1.02rem] font-semibold">Reschedule</h2>
        <p className="mt-0.5 text-[0.84rem] text-slate">Change the appointment after speaking to the customer.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-[0.8rem] text-slate">
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(inputClasses, "mt-1 h-10 rounded-md text-[0.9rem]")} disabled={!canUpdate} />
          </label>
          <label className="text-[0.8rem] text-slate">
            Time
            <input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} className={cn(inputClasses, "mt-1 h-10 rounded-md text-[0.9rem]")} disabled={!canUpdate} />
          </label>
        </div>
        <Button
          variant="subtle"
          size="sm"
          className="mt-3"
          disabled={!canUpdate || (date === booking.preferredDate && time === booking.preferredTime) || !date || !time}
          loading={busy === "reschedule"}
          onClick={() => patch({ preferredDate: date, preferredTime: time }, "Appointment updated", "reschedule")}
        >
          Save new time
        </Button>
      </section>

      <section className="rounded-lg bg-white p-5 ring-1 ring-line">
        <label htmlFor="admin-notes" className="text-[1.02rem] font-semibold">
          Workshop notes
        </label>
        <p className="mt-0.5 text-[0.84rem] text-slate">Only visible to staff. Estimates, parts ordered, call notes…</p>
        <Textarea id="admin-notes" rows={5} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-3 rounded-md text-[0.92rem]" disabled={!canUpdate} />
        <Button
          variant="subtle"
          size="sm"
          className="mt-3"
          disabled={!canUpdate || notes === booking.adminNotes}
          loading={busy === "notes"}
          onClick={() => patch({ adminNotes: notes }, "Notes saved", "notes")}
        >
          Save notes
        </Button>
      </section>

      {canDelete && (
        <section className="rounded-lg border border-[#f5bcbc] bg-white p-5">
          <h2 className="text-[1.02rem] font-semibold">Delete booking</h2>
          <p className="mt-0.5 text-[0.84rem] text-slate">Removes it permanently. Usually it&apos;s better to mark it cancelled.</p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            loading={busy === "delete"}
            onClick={async () => {
              const ok = await confirm({
                title: `Delete ${booking.reference}?`,
                message: "This booking will be permanently deleted. This can't be undone.",
                confirmLabel: "Delete booking",
                danger: true,
              });
              if (!ok) return;
              setBusy("delete");
              try {
                await apiRequest(`/api/admin/bookings/${booking.id}`, { method: "DELETE" });
                toast.success(`${booking.reference} deleted`);
                router.replace("/admin/bookings");
                router.refresh();
              } catch (e) {
                toast.error((e as Error).message);
                setBusy(null);
              }
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
          </Button>
        </section>
      )}
    </div>
  );
}
