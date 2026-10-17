import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/smart-image";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/site/page-hero";
import { ServiceCard } from "@/components/site/service-card";
import { getCatalog } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { IMG } from "@/content/images";

export const metadata: Metadata = {
  title: "Services",
  description: "Car, bike, scooter, auto-rickshaw and commercial vehicle servicing and repairs, with indicative prices.",
};

export default async function ServicesPage() {
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  const priceLabel = settings.pricing.priceLabel;

  return (
    <>
      <PageHero
        title="Services for cars, bikes and more"
        intro="Servicing, repairs and diagnostics for every vehicle on the road. Prices are starting estimates; we confirm the final price after inspecting your vehicle."
        image={IMG.engineRepair}
      />

      <nav aria-label="Service categories" className="sticky top-[4.25rem] z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-site scrollbar-none flex gap-2 overflow-x-auto py-3">
          {catalog.map((cat) => (
            <a
              key={cat.slug}
              href={`#${cat.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 font-display text-[0.98rem] font-semibold text-charcoal transition-colors hover:border-charcoal"
              style={{ fontStretch: "88%" }}
            >
              <Icon name={cat.icon} className="h-4 w-4 text-accent" />
              {cat.shortName || cat.name}
              <span className="text-[0.82rem] font-medium text-slate">{cat.services.length}</span>
            </a>
          ))}
        </div>
      </nav>

      {catalog.map((cat, index) => {
        const bookVehicle = cat.vehicleTypes[0] ?? "car";
        return (
          <section
            key={cat.id}
            id={cat.slug}
            aria-labelledby={`${cat.slug}-title`}
            className={index % 2 === 0 ? "bg-paper py-16 lg:py-24" : "bg-white py-16 lg:py-24"}
          >
            <div className="container-site">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
                <div>
                  <h2 id={`${cat.slug}-title`} className="display-2">
                    {cat.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-[1.06rem] leading-relaxed text-slate">{cat.description}</p>
                  <ButtonLink href={`/book?vehicle=${bookVehicle}`} className="mt-7">
                    Book a service for {(cat.shortName || cat.name).toLowerCase()}
                  </ButtonLink>
                </div>
                <SmartImage
                  src={cat.imageUrl}
                  alt=""
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="photo-tone aspect-[16/9] w-full rounded-[3px] object-cover"
                />
              </div>
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.services.map((s) => (
                  <ServiceCard key={s.id} service={s} bookVehicle={bookVehicle} priceLabel={priceLabel} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="on-dark bg-charcoal py-16 text-white">
        <div className="container-site flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="display-2">Not sure what your vehicle needs?</h2>
            <p className="mt-3 text-[1.05rem] text-fog">
              Book an inspection. We&apos;ll find the problem and give you a written estimate before any work starts.
            </p>
          </div>
          <ButtonLink href="/book?service=inspection" size="lg">
            Book an inspection
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
