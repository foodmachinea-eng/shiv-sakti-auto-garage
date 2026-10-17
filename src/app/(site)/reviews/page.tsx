import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ReviewCard, Stars } from "@/components/site/review-card";
import { ButtonLink } from "@/components/ui/button";
import { getTestimonials } from "@/lib/data/gallery";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "What customers say about our car, bike and auto-rickshaw servicing and repairs.",
};

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([getTestimonials(), getSettings()]);
  const hasSamples = reviews.some((r) => r.isSample);
  const genuine = reviews.filter((r) => !r.isSample);
  const average = genuine.length ? genuine.reduce((sum, r) => sum + r.rating, 0) / genuine.length : null;
  const reviewUrl = settings.business.googleReviewUrl;

  return (
    <>
      <PageHero title="Customer reviews" intro="Feedback from people who've had their vehicles serviced and repaired with us." />
      <section className="bg-paper py-14 lg:py-20">
        <div className="container-site">
          <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              {average != null ? (
                <div className="flex items-center gap-3">
                  <span className="numerals text-[2.4rem] font-bold leading-none">{average.toFixed(1)}</span>
                  <div>
                    <Stars rating={Math.round(average)} />
                    <p className="text-[0.88rem] text-slate">
                      Average of {genuine.length} review{genuine.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="font-display text-[1.3rem] font-semibold" style={{ fontStretch: "88%" }}>
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </p>
              )}
              {hasSamples && (
                <p className="mt-3 max-w-2xl text-[0.92rem] text-slate">
                  Reviews marked “Sample review” are placeholders for this demo website. They&apos;ll be replaced with genuine
                  customer reviews.
                </p>
              )}
            </div>
            <ButtonLink href={reviewUrl || "/contact"} variant="outline-dark">
              {reviewUrl ? "Write a Google review" : "Share your experience"}
            </ButtonLink>
          </div>

          {reviews.length ? (
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-slate">Customer reviews will appear here soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
