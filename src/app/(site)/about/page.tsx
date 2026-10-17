import type { Metadata } from "next";
import { CalendarCheck, UserRound } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SmartImage } from "@/components/ui/smart-image";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { getSettings } from "@/lib/data/settings";
import { getCatalog } from "@/lib/data/catalog";
import { businessInfo, fill } from "@/lib/site";
import { groupedHours } from "@/lib/dates";
import { initials } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "About us",
    description: fill(settings, settings.about.intro),
  };
}

export default async function AboutPage() {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const about = settings.about;
  const b = settings.business;
  const business = businessInfo(settings);
  const paragraphs = fill(settings, about.story).split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <PageHero title={fill(settings, about.title)} intro={fill(settings, about.intro)} image={about.image} imageAlt={about.imageAlt} />

      <section className="bg-white py-16 lg:py-24" aria-labelledby="story-title">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 id="story-title" className="display-2">
              About {b.name}
            </h2>
            <div className="prose-copy mt-6 text-[1.08rem] leading-[1.75] text-graphite">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-1 content-start gap-px self-start overflow-hidden rounded-[3px] bg-line ring-1 ring-line sm:grid-cols-2">
            <div className="bg-paper p-6">
              <dt className="text-[0.85rem] text-slate">Experience</dt>
              <dd className="numerals mt-1 text-[2.4rem] font-bold leading-none">{b.yearsExperience}+ years</dd>
            </div>
            <div className="bg-paper p-6">
              <dt className="text-[0.85rem] text-slate">What we work on</dt>
              <dd className="mt-2 font-medium leading-snug">
                <ul className="space-y-0.5">
                  {catalog.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="bg-paper p-6 sm:col-span-2">
              <dt className="text-[0.85rem] text-slate">Workshop address</dt>
              <dd className="mt-1 font-medium">{business.address}</dd>
            </div>
            <div className="bg-paper p-6 sm:col-span-2">
              <dt className="text-[0.85rem] text-slate">Working hours</dt>
              <dd className="mt-1">
                <ul className="space-y-0.5">
                  {groupedHours(b.hours).map((h) => (
                    <li key={h.label} className="flex justify-between gap-4">
                      <span className="text-slate">{h.label}</span>
                      <span className="font-medium">{h.value}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="on-dark bg-charcoal py-16 text-white lg:py-24" aria-labelledby="commitments-title">
        <div className="container-site">
          <h2 id="commitments-title" className="display-2 max-w-2xl">
            Our commitment to you
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
            {about.commitments.map((c) => (
              <li key={c.title} className="border-t border-white/12 py-7">
                <Icon name={c.icon} className="h-7 w-7 text-accent-bright" strokeWidth={1.7} />
                <h3 className="title-sm mt-4 text-[1.3rem]">{c.title}</h3>
                <p className="mt-2 text-[0.97rem] leading-relaxed text-fog">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24" aria-labelledby="owner-title">
        <div className="container-site grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          {about.ownerPhoto ? (
            <SmartImage src={about.ownerPhoto} alt={b.ownerName} sizes="(min-width: 1024px) 35vw, 100vw" className="aspect-[4/5] w-full rounded-[3px] object-cover" />
          ) : (
            <div
              className="flex aspect-[4/5] w-full items-center justify-center rounded-[3px] bg-charcoal font-display text-[6rem] font-bold text-white/90"
              style={{ fontStretch: "78%" }}
              aria-hidden="true"
            >
              {/^owner name$/i.test(b.ownerName.trim()) || !initials(b.ownerName) ? (
                <UserRound className="h-28 w-28 text-white/40" strokeWidth={1.2} />
              ) : (
                initials(b.ownerName)
              )}
            </div>
          )}
          <div>
            <h2 id="owner-title" className="sr-only">
              Meet the owner
            </h2>
            <blockquote className="font-display text-[clamp(1.5rem,3vw,2.3rem)] font-semibold leading-[1.2]" style={{ fontStretch: "86%" }}>
              “{fill(settings, about.ownerMessage)}”
            </blockquote>
            <p className="mt-6 text-[1.05rem]">
              <span className="font-semibold">{b.ownerName}</span>
              <span className="block text-slate">
                {b.ownerRole}, {b.name}
              </span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/book">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                Book a Service
              </ButtonLink>
              <ButtonLink href="/gallery" variant="outline-dark">
                See the workshop
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
