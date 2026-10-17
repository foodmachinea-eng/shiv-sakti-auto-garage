"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, Phone, Search, Trash2 } from "lucide-react";
import { EnquiryStatusBadge, SampleTag } from "@/components/admin/ui";
import { Modal, useConfirm } from "@/components/admin/ui-client";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { inputClasses } from "@/components/ui/field";
import { ENQUIRY_STATUSES, vehicleLabel } from "@/lib/constants";
import { formatDateTime, timeAgo } from "@/lib/dates";
import { apiRequest } from "@/lib/client-api";
import { cn, telHref, whatsappDigitsFromMobile, whatsappHref } from "@/lib/format";

export type EnquiryView = {
  id: number;
  name: string;
  mobile: string;
  email: string;
  vehicleType: string;
  subject: string;
  message: string;
  status: string;
  isSample: boolean;
  createdAt: string;
};

export function EnquiryList({
  enquiries,
  counts,
  canUpdate,
  canDelete,
  garageName,
}: {
  enquiries: EnquiryView[];
  counts: Record<string, number>;
  canUpdate: boolean;
  canDelete: boolean;
  garageName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [openId, setOpenId] = useState<number | null>(Number(params.get("open")) || null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const status = params.get("status") ?? "";
  const open = enquiries.find((e) => e.id === openId) ?? null;

  // Open an enquiry linked from the dashboard (?open=<id>).
  const urlOpen = Number(params.get("open")) || null;
  const [syncedOpen, setSyncedOpen] = useState(urlOpen);
  if (urlOpen !== syncedOpen) {
    setSyncedOpen(urlOpen);
    if (urlOpen) setOpenId(urlOpen);
  }

  const apply = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    next.delete("open");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  async function setEnquiryStatus(id: number, value: string) {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/enquiries/${id}`, { method: "PATCH", body: { status: value } });
      toast.success(`Marked as ${ENQUIRY_STATUSES.find((s) => s.value === value)?.label.toLowerCase()}`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [{ value: "", label: "All", count: total }, ...ENQUIRY_STATUSES.map((s) => ({ ...s, count: counts[s.value] ?? 0 }))];

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {tabs.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              aria-pressed={status === t.value}
              onClick={() => apply({ status: t.value || null })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[0.86rem] font-medium",
                status === t.value ? "border-charcoal bg-charcoal text-white" : "border-line bg-white hover:border-charcoal/40",
              )}
            >
              {t.label} <span className="ml-1 tabular-nums opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search enquiries</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            type="search"
            value={q}
            placeholder="Search name, mobile or message"
            onChange={(e) => {
              setQ(e.target.value);
              window.clearTimeout(timer.current);
              const value = e.target.value;
              timer.current = window.setTimeout(() => apply({ q: value.trim() || null }), 350);
            }}
            className={cn(inputClasses, "h-10 rounded-md pl-9 text-[0.9rem]")}
          />
        </label>
      </div>

      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-lg bg-white ring-1 ring-line">
        {enquiries.length === 0 && <li className="px-5 py-14 text-center text-slate">No enquiries found.</li>}
        {enquiries.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => setOpenId(e.id)} className="flex w-full flex-col gap-1 px-5 py-4 text-left hover:bg-paper sm:flex-row sm:items-center sm:gap-5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={cn("font-medium", e.status === "new" && "font-semibold")}>{e.name}</span>
                  <span className="text-[0.85rem] text-slate">{e.subject}</span>
                  {e.isSample && <SampleTag />}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[0.88rem] text-slate">{e.message}</p>
              </div>
              <div className="flex items-center gap-3 text-[0.82rem] text-slate">
                <span>{timeAgo(e.createdAt)}</span>
                <EnquiryStatusBadge status={e.status} />
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.subject ?? "Enquiry"}
        description={open ? `From ${open.name}, ${formatDateTime(open.createdAt)}` : undefined}
        footer={
          open && canDelete ? (
            <Button
              variant="subtle"
              size="sm"
              className="mr-auto text-[#b42318]"
              disabled={busy}
              onClick={async () => {
                const ok = await confirm({ title: "Delete this enquiry?", message: "It will be permanently removed.", confirmLabel: "Delete", danger: true });
                if (!ok) return;
                setBusy(true);
                try {
                  await apiRequest(`/api/admin/enquiries/${open.id}`, { method: "DELETE" });
                  toast.success("Enquiry deleted");
                  setOpenId(null);
                  router.refresh();
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
            </Button>
          ) : undefined
        }
      >
        {open && (
          <div className="space-y-5">
            <p className="whitespace-pre-line rounded-md bg-paper p-4 text-[0.97rem] leading-relaxed">{open.message}</p>
            <dl className="grid grid-cols-1 gap-3 text-[0.9rem] sm:grid-cols-2">
              <div>
                <dt className="text-[0.78rem] text-slate">Mobile</dt>
                <dd className="tabular-nums">{open.mobile}</dd>
              </div>
              <div>
                <dt className="text-[0.78rem] text-slate">Email</dt>
                <dd className="break-all">{open.email || "Not given"}</dd>
              </div>
              <div>
                <dt className="text-[0.78rem] text-slate">Vehicle</dt>
                <dd>{open.vehicleType ? vehicleLabel(open.vehicleType) : "Not given"}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={telHref(open.mobile)} variant="subtle" size="sm">
                <Phone className="h-4 w-4" aria-hidden="true" /> Call
              </ButtonLink>
              <ButtonLink
                href={whatsappHref(whatsappDigitsFromMobile(open.mobile), `Hi ${open.name.split(" ")[0]}, this is ${garageName} replying to your message.`)}
                variant="whatsapp"
                size="sm"
              >
                <ChatIcon className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </ButtonLink>
              {open.email && (
                <ButtonLink href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`} variant="subtle" size="sm">
                  <Mail className="h-4 w-4" aria-hidden="true" /> Email
                </ButtonLink>
              )}
            </div>
            <div>
              <p className="mb-2 text-[0.85rem] font-medium">Status</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Enquiry status">
                {ENQUIRY_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={!canUpdate || busy}
                    aria-pressed={open.status === s.value}
                    onClick={() => s.value !== open.status && setEnquiryStatus(open.id, s.value)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-[0.88rem] font-medium disabled:opacity-60",
                      open.status === s.value ? "border-charcoal bg-charcoal text-white" : "border-line hover:border-charcoal/40",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
