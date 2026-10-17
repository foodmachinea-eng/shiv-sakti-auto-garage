import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ChevronRight, Phone } from "lucide-react";
import { BookingStatusBadge, EnquiryStatusBadge, PageHeader, Panel, SampleTag, EmptyState, statusDotClass } from "@/components/admin/ui";
import { DailyBookingsChart } from "@/components/admin/charts";
import { ClearSampleDataButton } from "@/components/admin/dashboard/clear-sample";
import { ButtonLink } from "@/components/ui/button";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getDashboardData } from "@/lib/data/bookings";
import { formatDate, formatTime, timeAgo, todayIST } from "@/lib/dates";
import { vehicleLabel } from "@/lib/constants";
import { telHref } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requirePageUser();
  const data = await getDashboardData();
  const maxVehicle = Math.max(1, ...data.byVehicle.map((v) => v.count));
  const firstName = user.name.split(" ")[0];

  const tiles = [
    { label: "Total bookings", value: data.total, href: "/admin/bookings", status: null },
    { label: "Pending", value: data.byStatus.pending, href: "/admin/bookings?status=pending", status: "pending" },
    { label: "Confirmed", value: data.byStatus.confirmed, href: "/admin/bookings?status=confirmed", status: "confirmed" },
    { label: "Completed", value: data.byStatus.completed, href: "/admin/bookings?status=completed", status: "completed" },
    { label: "Cancelled", value: data.byStatus.cancelled, href: "/admin/bookings?status=cancelled", status: "cancelled" },
    { label: "New enquiries", value: data.enquiryCounts.new ?? 0, href: "/admin/enquiries?status=new", status: null },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description={`${formatDate(todayIST())}. Here's what's happening at the workshop.`}
        actions={
          <ButtonLink href="/admin/bookings?status=pending" size="sm">
            Review pending bookings
          </ButtonLink>
        }
      />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="block h-full rounded-lg bg-white p-4 ring-1 ring-line transition-shadow hover:ring-charcoal/30">
              <span className="flex items-center gap-2 text-[0.85rem] text-slate">
                {t.status && <span className={`h-2 w-2 rounded-full ${statusDotClass(t.status)}`} aria-hidden="true" />}
                {t.label}
              </span>
              <span className="mt-2 block text-[2rem] font-semibold leading-none">{t.value.toLocaleString("en-IN")}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Bookings received" description="Last 14 days, by the day the booking was made">
          <DailyBookingsChart data={data.daily} />
        </Panel>
        <Panel title="Bookings by vehicle" description="All bookings">
          <ul className="space-y-3.5">
            {data.byVehicle.map((v) => (
              <li key={v.type}>
                <div className="flex justify-between text-[0.88rem]">
                  <span>{v.label}</span>
                  <span className="font-semibold tabular-nums">{v.count}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-paper">
                  <div className="h-full rounded-full bg-graphite" style={{ width: `${(v.count / maxVehicle) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Recent bookings"
          actions={
            <Link href="/admin/bookings" className="inline-flex items-center gap-1 text-[0.88rem] font-medium hover:underline">
              All bookings <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {data.recent.length === 0 ? (
            <EmptyState title="No bookings yet" text="New bookings from the website will appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {data.recent.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-paper sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {b.customerName} {b.isSample && <SampleTag />}
                      </p>
                      <p className="truncate text-[0.85rem] text-slate">
                        {vehicleLabel(b.vehicleType)}, {b.vehicleMake} {b.vehicleModel}: {b.serviceName}
                      </p>
                      <p className="text-[0.82rem] text-slate sm:hidden">
                        {formatDate(b.preferredDate, { year: false })}, {formatTime(b.preferredTime)}
                      </p>
                    </div>
                    <div className="hidden text-right text-[0.85rem] sm:block">
                      <p>{formatDate(b.preferredDate, { year: false })}, {formatTime(b.preferredTime)}</p>
                      <p className="text-slate">{timeAgo(b.createdAt)}</p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Today's appointments" description="Pending and confirmed" bodyClassName="p-0">
            {data.todays.length === 0 ? (
              <p className="px-5 py-6 text-[0.92rem] text-slate">No appointments booked for today.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.todays.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-5 py-3">
                    <CalendarClock className="h-5 w-5 shrink-0 text-slate" aria-hidden="true" />
                    <Link href={`/admin/bookings/${b.id}`} className="min-w-0 flex-1 hover:underline">
                      <span className="block font-medium tabular-nums">{formatTime(b.preferredTime)}</span>
                      <span className="block truncate text-[0.85rem] text-slate">
                        {b.customerName}, {b.registrationNumber}
                      </span>
                    </Link>
                    <a href={telHref(b.mobile)} className="rounded-md p-2 text-slate hover:bg-paper hover:text-charcoal" aria-label={`Call ${b.customerName}`}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {can(user.role, "enquiries.view") && (
            <Panel
              title="Recent enquiries"
              actions={
                <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-[0.88rem] font-medium hover:underline">
                  All <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
              bodyClassName="p-0"
            >
              {data.recentEnquiries.length === 0 ? (
                <p className="px-5 py-6 text-[0.92rem] text-slate">No enquiries yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recentEnquiries.map((e) => (
                    <li key={e.id}>
                      <Link href={`/admin/enquiries?open=${e.id}`} className="block px-5 py-3 hover:bg-paper">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-medium">{e.name}</p>
                          <EnquiryStatusBadge status={e.status} />
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[0.85rem] text-slate">{e.message}</p>
                        <p className="mt-0.5 text-[0.78rem] text-slate">{timeAgo(e.createdAt)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>
      </div>

      {data.sampleCount > 0 && can(user.role, "content.manage") && (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-dashed border-charcoal/25 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Sample data</p>
            <p className="text-[0.9rem] text-slate">
              {data.sampleCount} sample bookings and enquiries are shown for the demo. Remove them before going live.
            </p>
          </div>
          <ClearSampleDataButton count={data.sampleCount} />
        </div>
      )}
    </>
  );
}
