import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, Panel, Pagination, SampleTag, EmptyState } from "@/components/admin/ui";
import { BookingFilters } from "@/components/admin/bookings/filters";
import { BookingStatusSelect } from "@/components/admin/bookings/status-select";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { listBookings, parseBookingFilters } from "@/lib/data/bookings";
import { formatDate, formatTime, timeAgo } from "@/lib/dates";
import { vehicleLabel } from "@/lib/constants";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const user = await requirePageUser();
  if (!can(user.role, "bookings.view")) return <Forbidden />;
  const params = await searchParams;
  const filters = parseBookingFilters(params);
  const result = await listBookings(filters);
  const canUpdate = can(user.role, "bookings.update");

  const hrefFor = (page: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      const value = Array.isArray(v) ? v[0] : v;
      if (value && k !== "page") sp.set(k, value);
    }
    if (page > 1) sp.set("page", String(page));
    return `/admin/bookings${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Bookings" description="Search, filter and update service bookings from the website." />
      <Suspense>
        <BookingFilters canExport={can(user.role, "bookings.export")} />
      </Suspense>

      <Panel className="mt-5" bodyClassName="p-0">
        {result.rows.length === 0 ? (
          <EmptyState title="No bookings match these filters" text="Try clearing the filters or searching for something else." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[0.9rem]">
                <thead className="border-b border-line bg-paper text-[0.78rem] text-slate">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Booking</th>
                    <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                    <th scope="col" className="px-4 py-3 font-medium">Vehicle</th>
                    <th scope="col" className="px-4 py-3 font-medium">Service</th>
                    <th scope="col" className="px-4 py-3 font-medium">Appointment</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.rows.map((b) => (
                    <tr key={b.id} className="align-top hover:bg-paper/60">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/bookings/${b.id}`} className="font-semibold tabular-nums hover:underline">
                          {b.reference}
                        </Link>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.8rem] text-slate">
                          {timeAgo(b.createdAt)} {b.isSample && <SampleTag />}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium">{b.customerName}</span>
                        <span className="block text-[0.82rem] tabular-nums text-slate">{b.mobile}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span>{b.vehicleMake} {b.vehicleModel}</span>
                        <span className="block text-[0.82rem] text-slate">
                          {vehicleLabel(b.vehicleType)}, {b.registrationNumber}
                        </span>
                      </td>
                      <td className="max-w-[14rem] px-4 py-3.5">{b.serviceName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {formatDate(b.preferredDate, { year: false })}
                        <span className="block text-[0.82rem] text-slate">{formatTime(b.preferredTime)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <BookingStatusSelect id={b.id} status={b.status} reference={b.reference} disabled={!canUpdate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {result.rows.map((b) => (
                <li key={b.id} className="space-y-2 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/admin/bookings/${b.id}`} className="min-w-0">
                      <span className="block font-semibold">{b.customerName}</span>
                      <span className="block text-[0.8rem] tabular-nums text-slate">{b.reference}</span>
                    </Link>
                    <BookingStatusSelect id={b.id} status={b.status} reference={b.reference} disabled={!canUpdate} />
                  </div>
                  <p className="text-[0.88rem]">
                    {vehicleLabel(b.vehicleType)}: {b.vehicleMake} {b.vehicleModel} ({b.registrationNumber})
                  </p>
                  <p className="text-[0.88rem] text-slate">{b.serviceName}</p>
                  <p className="text-[0.88rem] font-medium">
                    {formatDate(b.preferredDate)}, {formatTime(b.preferredTime)}
                  </p>
                </li>
              ))}
            </ul>
            <Pagination page={result.page} pages={result.pages} total={result.total} hrefFor={hrefFor} label="bookings" />
          </>
        )}
      </Panel>
    </>
  );
}
