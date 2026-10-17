import { CalendarCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ContactDetails } from "@/components/site/contact-details";
import { MapEmbed } from "@/components/site/map-embed";
import type { BusinessInfo } from "@/lib/site";

export function Visit({ business, ctaTitle, ctaText }: { business: BusinessInfo; ctaTitle: string; ctaText: string }) {
  return (
    <section className="on-dark bg-charcoal text-white" aria-labelledby="visit-title">
      <div className="border-b border-white/10">
        <div className="container-site flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between lg:py-14">
          <div>
            <h2 className="display-2">{ctaTitle}</h2>
            <p className="mt-3 text-[1.06rem] text-fog">{ctaText}</p>
          </div>
          <ButtonLink href="/book" size="lg" className="self-start md:self-auto">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            Book a Service
          </ButtonLink>
        </div>
      </div>
      <div className="container-site grid grid-cols-1 gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-20">
        <div>
          <h2 id="visit-title" className="display-3 mb-6 text-[1.75rem]">
            Visit the workshop
          </h2>
          <ContactDetails business={business} />
        </div>
        <MapEmbed
          src={business.mapEmbedUrl}
          title={`Map showing ${business.name}`}
          openUrl={business.directionsUrl}
          className="min-h-[360px] lg:min-h-full"
        />
      </div>
    </section>
  );
}
