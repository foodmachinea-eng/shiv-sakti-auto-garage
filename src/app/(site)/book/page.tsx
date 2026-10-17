import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { BookingForm, type BookingCatalog } from "@/components/site/booking-form";
import { ButtonLink } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { OpenStatusText } from "@/components/site/open-status";
import { getCatalog, getPackages } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { businessInfo } from "@/lib/site";
import { groupedHours } from "@/lib/dates";
import { VEHICLE_TYPE_VALUES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Book a service",
  description: "Book a car, bike, scooter or auto-rickshaw service online. Choose a date and time and we'll call to confirm.",
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const [catalog, packages, settings, params] = await Promise.all([getCatalog(), getPackages(), getSettings(), searchParams]);
  const business = businessInfo(settings);
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };

  // Pre-select from links like /book?vehicle=bike, /book?service=12, /book?package=3
  let vehicleType = (VEHICLE_TYPE_VALUES as readonly string[]).includes(one("vehicle") ?? "") ? one("vehicle") : undefined;
  let service: string | undefined;
  const serviceParam = one("service");
  const packageParam = one("package");
  if (serviceParam === "inspection") service = "inspection";
  else if (serviceParam && /^\d+$/.test(serviceParam)) {
    const cat = catalog.find((c) => c.services.some((s) => s.id === Number(serviceParam)));
    if (cat) {
      if (!vehicleType || !cat.vehicleTypes.includes(vehicleType)) vehicleType = cat.vehicleTypes[0];
      service = `service:${serviceParam}`;
    }
  } else if (packageParam && /^\d+$/.test(packageParam)) {
    const pkg = packages.find((p) => p.id === Number(packageParam));
    if (pkg) {
      const fallbackVehicle = pkg.vehicleClass === "bike" ? "bike" : pkg.vehicleClass === "other" ? "other" : "car";
      if (!vehicleType) vehicleType = fallbackVehicle;
      service = `package:${pkg.id}`;
    }
  }

  const bookingCatalog: BookingCatalog = {
    categories: catalog.map((c) => ({
      id: c.id,
      name: c.name,
      vehicleTypes: c.vehicleTypes,
      services: c.services.map((s) => ({
        id: s.id,
        name: s.name,
        priceFrom: s.priceFrom,
        priceNote: s.priceNote,
        duration: s.duration,
      })),
    })),
    packages: packages.map((p) => ({ id: p.id, name: p.name, vehicleClass: p.vehicleClass, price: p.price, duration: p.duration })),
  };

  return (
    <>
      <section className="on-dark bg-ink text-white">
        <div className="container-site pb-28 pt-32 lg:pb-36 lg:pt-44">
          <h1 className="display-1 animate-rise">Book a service</h1>
          <p className="mt-4 max-w-xl animate-rise text-[1.1rem] text-mist" style={{ animationDelay: "120ms" }}>
            Takes about a minute. Pick a slot and we&apos;ll call you to confirm before your visit.
          </p>
        </div>
      </section>

      <section className="bg-concrete pb-20">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
          <div className="-mt-20 lg:-mt-24">
            <BookingForm
              catalog={bookingCatalog}
              hours={business.hours}
              slotMinutes={business.slotMinutes}
              bookingWindowDays={business.bookingWindowDays}
              priceLabel={settings.pricing.priceLabel}
              garage={{
                name: business.name,
                address: business.address,
                phone: business.phone,
                phoneHref: business.phoneHref,
                whatsapp: business.whatsapp,
              }}
              initial={{ vehicleType, service }}
            />
          </div>

          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start lg:pt-10" aria-label="Booking information">
            <div>
              <h2 className="title-sm text-[1.25rem]">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {[
                  ["We call to confirm", "Usually within working hours on the same day."],
                  ["Bring your vehicle in", "We inspect it and share a written estimate."],
                  ["Approve the work", "Nothing extra is done without your OK."],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="numerals flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-charcoal text-[0.95rem] font-bold" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-[0.92rem] text-slate">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[3px] bg-white p-5 ring-1 ring-line">
              <h2 className="title-sm">Prefer to talk?</h2>
              <p className="mt-1 text-[0.92rem] text-slate">Call or WhatsApp and we&apos;ll book it for you.</p>
              <div className="mt-4 grid gap-2">
                <ButtonLink href={business.phoneHref} variant="outline-dark">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {business.phone}
                </ButtonLink>
                <ButtonLink href={business.whatsappHref} variant="whatsapp">
                  <ChatIcon className="h-4 w-4" aria-hidden="true" /> WhatsApp us
                </ButtonLink>
              </div>
            </div>

            <div>
              <h2 className="title-sm">Opening hours</h2>
              <OpenStatusText hours={business.hours} className="mt-1 text-[0.9rem] text-slate" />
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-[0.93rem]">
                {groupedHours(business.hours).map((h) => (
                  <div key={h.label} className="contents">
                    <dt className="text-slate">{h.label}</dt>
                    <dd className="font-medium">{h.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.92rem] text-slate">{business.address}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
