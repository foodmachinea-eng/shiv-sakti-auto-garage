import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { getSettings } from "@/lib/data/settings";
import { businessInfo } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice", robots: { index: false } };

export default async function PrivacyPage() {
  const business = businessInfo(await getSettings());
  return (
    <>
      <PageHero title="Privacy notice" intro="How we use the details you share when you book a service or send us a message." />
      <section className="bg-white py-14 lg:py-20">
        <div className="container-site">
          <div className="prose-copy space-y-8 text-[1.02rem] leading-relaxed text-graphite">
            <div>
              <h2 className="display-3 mb-2 text-charcoal">What we collect</h2>
              <p>
                When you book a service or send an enquiry we collect your name, mobile number, optional email address,
                vehicle details (type, company, model and registration number) and the description of the problem.
              </p>
            </div>
            <div>
              <h2 className="display-3 mb-2 text-charcoal">How we use it</h2>
              <p>
                Only to confirm and carry out your booking, contact you about your vehicle and keep a service record. We
                don&apos;t sell your details or use them for unrelated marketing.
              </p>
            </div>
            <div>
              <h2 className="display-3 mb-2 text-charcoal">Your choices</h2>
              <p>
                You can ask us to correct or delete your details at any time. Contact {business.name} on {business.phone}
                {business.email ? ` or ${business.email}` : ""}.
              </p>
            </div>
            <p className="text-[0.9rem] text-slate">
              This is a template notice for the demo website. Have it reviewed for your business before going live.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
