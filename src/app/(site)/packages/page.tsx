import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { PackagesBrowser } from "@/components/site/packages-browser";
import { ButtonLink } from "@/components/ui/button";
import { getPackages } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { IMG } from "@/content/images";

export const metadata: Metadata = {
  title: "Service packages & prices",
  description: "Basic, standard, complete checkup and premium maintenance packages for cars and two-wheelers, with indicative prices in rupees.",
};

export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSettings()]);
  const pricing = settings.pricing;

  return (
    <>
      <PageHero title="Service packages & prices" intro={pricing.intro} image={IMG.oilTopUp} />

      <section className="bg-concrete py-16 lg:py-24" aria-label="Packages">
        <div className="container-site">
          <PackagesBrowser packages={packages} priceLabel={pricing.priceLabel} />

          <div className="mt-10 flex gap-4 rounded-[3px] border border-charcoal/15 bg-white p-5 sm:p-6">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="title-sm">About these prices</h2>
              <p className="mt-1.5 max-w-3xl text-[0.95rem] leading-relaxed text-slate">{pricing.disclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      {pricing.faqs.length > 0 && (
        <section className="bg-white py-16 lg:py-24" aria-labelledby="faq-title">
          <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 id="faq-title" className="display-2">
                Questions about pricing
              </h2>
              <p className="mt-4 text-[1.05rem] text-slate">Can&apos;t find an answer? Call or WhatsApp us and we&apos;ll help.</p>
              <ButtonLink href="/contact" variant="outline-dark" className="mt-6">
                Contact us
              </ButtonLink>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {pricing.faqs.map((faq) => (
                <details key={faq.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[1.2rem] font-semibold" style={{ fontStretch: "88%" }}>
                    {faq.q}
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-[1.2rem] leading-none transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-slate">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
