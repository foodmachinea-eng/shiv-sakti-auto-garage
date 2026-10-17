import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[1.9rem] font-bold leading-tight" style={{ fontStretch: "82%" }}>
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-[0.95rem] text-slate">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg bg-white ring-1 ring-line", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-[1.02rem] font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.85rem] text-slate">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <p className="text-[1.05rem] font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-[0.92rem] text-slate">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badges                                                       */
/* ------------------------------------------------------------------ */

const BOOKING_STATUS_STYLE: Record<string, { label: string; className: string; dot: string }> = {
  pending: { label: "Pending", className: "bg-[#fff6e0] text-[#8a5300] ring-[#f3d38a]", dot: "bg-[#e19a00]" },
  confirmed: { label: "Confirmed", className: "bg-[#ebf2ff] text-[#1d4ed8] ring-[#bcd2fb]", dot: "bg-[#2563eb]" },
  completed: { label: "Completed", className: "bg-[#e9f7ef] text-[#146c3a] ring-[#b4e2c5]", dot: "bg-[#16a34a]" },
  cancelled: { label: "Cancelled", className: "bg-[#f1f2f4] text-[#4b5059] ring-[#d5d8dd]", dot: "bg-[#8a909a]" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const s = BOOKING_STATUS_STYLE[status] ?? BOOKING_STATUS_STYLE.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.76rem] font-semibold ring-1 ring-inset", s.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function statusDotClass(status: string) {
  return (BOOKING_STATUS_STYLE[status] ?? BOOKING_STATUS_STYLE.pending).dot;
}

const ENQUIRY_STATUS_STYLE: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-[#fdecec] text-[#a4161a] ring-[#f5bcbc]" },
  in_progress: { label: "In progress", className: "bg-[#ebf2ff] text-[#1d4ed8] ring-[#bcd2fb]" },
  resolved: { label: "Resolved", className: "bg-[#e9f7ef] text-[#146c3a] ring-[#b4e2c5]" },
};

export function EnquiryStatusBadge({ status }: { status: string }) {
  const s = ENQUIRY_STATUS_STYLE[status] ?? ENQUIRY_STATUS_STYLE.new;
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.76rem] font-semibold ring-1 ring-inset", s.className)}>
      {s.label}
    </span>
  );
}

export function SampleTag() {
  return (
    <span className="rounded border border-dashed border-slate/50 px-1.5 py-px text-[0.68rem] font-semibold text-slate" title="Demo data">
      Sample
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export function Pagination({
  page,
  pages,
  total,
  hrefFor,
  label = "results",
}: {
  page: number;
  pages: number;
  total: number;
  hrefFor: (page: number) => string;
  label?: string;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-[0.88rem]">
      <p className="text-slate">
        Page {page} of {pages} ({total} {label})
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 hover:bg-paper">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={hrefFor(page + 1)} className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 hover:bg-paper">
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
