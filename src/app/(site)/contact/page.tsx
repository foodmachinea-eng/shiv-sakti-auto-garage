import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ContactDetails } from "@/components/site/contact-details";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { MapEmbed } from "@/components/site/map-embed";
import { BusinessJsonLd } from "@/components/site/json-ld";
import { getSettings } from "@/lib/data/settings";
import { businessInfo } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const b = businessInfo(settings);
  return { title: "Contact", description: `Call, WhatsApp or visit ${b.name} at ${b.address}.` };
}

export default async function ContactPage() {
  const settings = await getSettings();
  const business = businessInfo(settings);
  return (
    <>
      <BusinessJsonLd settings={settings} />
      <PageHero
        title="Contact the workshop"
        intro={`Call, WhatsApp or drop in at ${business.addressLines[0]}. For bookings, the online form is the quickest way to get a slot.`}
      />
      <section className="bg-paper py-14 lg:py-20">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <h2 className="display-3 mb-6 text-[1.75rem]">{business.name}</h2>
            <ContactDetails business={business} tone="light" />
          </div>
          <EnquiryForm phoneHref={business.phoneHref} whatsappHref={business.whatsappHref} />
        </div>
      </section>
      <section aria-label="Map" className="bg-paper pb-16 lg:pb-24">
        <div className="container-site">
          <MapEmbed
            src={business.mapEmbedUrl}
            title={`Map showing ${business.name}`}
            openUrl={business.directionsUrl}
            className="h-[420px] ring-1 ring-line"
          />
        </div>
      </section>
    </>
  );
}
