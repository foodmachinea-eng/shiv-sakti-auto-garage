import { Hero } from "@/components/site/sections/hero";
import { Highlights } from "@/components/site/sections/highlights";
import { Categories } from "@/components/site/sections/categories";
import { WhyChooseUs } from "@/components/site/sections/why";
import { Process } from "@/components/site/sections/process";
import { Workshop } from "@/components/site/sections/workshop";
import { Visit } from "@/components/site/sections/visit";
import { PackagesBrowser } from "@/components/site/packages-browser";
import { ReviewCard } from "@/components/site/review-card";
import { SectionHeading, TextLink } from "@/components/site/section-heading";
import { BusinessJsonLd } from "@/components/site/json-ld";
import { getSettings } from "@/lib/data/settings";
import { getCatalog, getPackages } from "@/lib/data/catalog";
import { getTestimonials } from "@/lib/data/gallery";
import { businessInfo, fill } from "@/lib/site";

export default async function HomePage() {
  const [settings, catalog, packages, reviews] = await Promise.all([
    getSettings(),
    getCatalog(),
    getPackages(),
    getTestimonials(),
  ]);
  const home = settings.home;
  const business = businessInfo(settings);
  const featuredReviews = reviews.slice(0, 3);

  return (
    <>
      <BusinessJsonLd settings={settings} />
      <Hero
        title={fill(settings, home.heroTitle)}
        subtitle={fill(settings, home.heroSubtitle)}
        image={home.heroImage}
        imageAlt={home.heroImageAlt}
        business={business}
      />
      <Highlights items={home.highlights.map((h) => ({ title: fill(settings, h.title), text: fill(settings, h.text) }))} />
      <Categories categories={catalog} />
      <WhyChooseUs title={fill(settings, home.whyTitle)} intro={fill(settings, home.whyIntro)} items={home.whyItems} />
      <Process title={home.processTitle} steps={home.processSteps} />

      <section className="bg-concrete py-20 lg:py-28" aria-labelledby="packages-title">
        <div className="container-site">
          <SectionHeading
            id="packages-title"
            title="Service packages"
            intro={settings.pricing.intro}
            action={<TextLink href="/packages">Compare all packages</TextLink>}
          />
          <div className="mt-10">
            <PackagesBrowser packages={packages} priceLabel={settings.pricing.priceLabel} compact />
          </div>
          <p className="mt-6 max-w-3xl text-[0.88rem] text-slate">{settings.pricing.disclaimer}</p>
        </div>
      </section>

      <Workshop
        title={home.workshopTitle}
        text={fill(settings, home.workshopText)}
        points={home.workshopPoints}
        images={home.workshopImages}
      />

      {featuredReviews.length > 0 && (
        <section className="bg-paper py-20 lg:py-28" aria-labelledby="reviews-title">
          <div className="container-site">
            <SectionHeading
              id="reviews-title"
              title="What customers say"
              intro={
                featuredReviews.some((r) => r.isSample)
                  ? "Reviews marked “Sample review” are placeholders for this demo and will be replaced with genuine customer reviews."
                  : undefined
              }
              action={<TextLink href="/reviews">Read all reviews</TextLink>}
            />
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {featuredReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Visit business={business} ctaTitle={fill(settings, home.ctaTitle)} ctaText={fill(settings, home.ctaText)} />
    </>
  );
}
