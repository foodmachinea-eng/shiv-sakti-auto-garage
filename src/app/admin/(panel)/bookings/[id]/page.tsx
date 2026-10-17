import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { BookingStatusBadge, SampleTag } from "@/components/admin/ui";
import { BookingActions } from "@/components/admin/bookings/booking-actions";
import { Forbidden } from "@/components/admin/forbidden";
import { ButtonLink } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getBooking } from "@/lib/data/bookings";
import { getSettings } from "@/lib/data/settings";
import { formatDate, formatDateTime, formatTime } from "@/lib/dates";
import { vehicleLabel } from "@/lib/constants";
import { telHref, whatsappDigitsFromMobile, whatsappHref } from "@/lib/format";

export const metadata: Metadata = { title: "Booking" };

export default async function BookingDetailPage({ params }: PageProps<"/admin/bookings/[id]">) {
  const user = await requirePageUser();
  if (!can(user.role, "bookings.view")) return <Forbidden />;
  const { id } = await params;
  const booking = /^\d+$/.test(id) ? await getBooking(Number(id)) : null;
  if (!booking) notFound();
  const settings = await getSettings();

  const greeting = `Hi ${booking.customerName.split(" ")[0]}, this is ${settings.business.name} about your booking ${booking.reference} for ${formatDate(booking.preferredDate)} at ${formatTime(booking.preferredTime)}.`;

  return (
    <>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-[0.9rem] text-slate hover:text-charcoal">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All bookings
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[1.9rem] font-bold tabular-nums" style={{ fontStretch: "82%" }}>
          {booking.reference}
        </h1>
        <BookingStatusBadge status={booking.status} />
        {booking.isSample && <SampleTag />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-5 ring-1 ring-line">
            <h2 className="text-[1.02rem] font-semibold">Customer</h2>
            <p className="mt-3 text-[1.15rem] font-semibold">{booking.customerName}</p>
            <p className="tabular-nums text-slate">{booking.mobile}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={telHref(booking.mobile)} variant="subtle" size="sm">
                <Phone className="h-4 w-4" aria-hidden="true" /> Call
              </ButtonLink>
              <ButtonLink href={whatsappHref(whatsappDigitsFromMobile(booking.mobile), greeting)} variant="whatsapp" size="sm">
                <ChatIcon className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </ButtonLink>
              <ButtonLink href={`sms:${booking.mobile.replace(/\s/g, "")}?body=${encodeURIComponent(greeting)}`} variant="subtle" size="sm">
                <Mail className="h-4 w-4" aria-hidden="true" /> SMS
              </ButtonLink>
            </div>
          </section>

          <section className="rounded-lg bg-white p-5 ring-1 ring-line">
            <h2 className="text-[1.02rem] font-semibold">Vehicle & work</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-[0.8rem] text-slate">Vehicle</dt>
                <dd className="font-medium">
                  {vehicleLabel(booking.vehicleType)}: {booking.vehicleMake} {booking.vehicleModel}
                </dd>
              </div>
              <div>
                <dt className="text-[0.8rem] text-slate">Registration</dt>
                <dd className="mt-1">
                  <span className="plate inline-flex">
                    <span className="plate-ind">IND</span>
                    <span className="plate-text px-2.5 py-1 text-[1.05rem]">{booking.registrationNumber}</span>
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[0.8rem] text-slate">Service requested</dt>
                <dd className="font-medium">{booking.serviceName}</dd>
              </div>
              <div>
                <dt className="text-[0.8rem] text-slate">Preferred appointment</dt>
                <dd className="font-medium">
                  {formatDate(booking.preferredDate)}, {formatTime(booking.preferredTime)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[0.8rem] text-slate">Problem described by customer</dt>
                <dd className="mt-1 whitespace-pre-line rounded-md bg-paper p-3 text-[0.95rem]">
                  {booking.problemDescription || <span className="text-slate">No description given.</span>}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg bg-white p-5 ring-1 ring-line">
            <h2 className="text-[1.02rem] font-semibold">History</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-[0.9rem] sm:grid-cols-3">
              <div>
                <dt className="text-[0.8rem] text-slate">Booked on</dt>
                <dd>{formatDateTime(booking.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[0.8rem] text-slate">Status last changed</dt>
                <dd>{formatDateTime(booking.statusChangedAt)}</dd>
              </div>
              <div>
                <dt className="text-[0.8rem] text-slate">Source</dt>
                <dd className="capitalize">{booking.isSample ? "Sample data" : booking.source}</dd>
              </div>
            </dl>
          </section>
        </div>

        <BookingActions
          booking={{
            id: booking.id,
            reference: booking.reference,
            status: booking.status,
            adminNotes: booking.adminNotes,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime,
          }}
          canUpdate={can(user.role, "bookings.update")}
          canDelete={can(user.role, "bookings.delete")}
        />
      </div>
    </>
  );
}
