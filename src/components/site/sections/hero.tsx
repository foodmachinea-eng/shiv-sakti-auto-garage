import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import type { BusinessInfo } from "@/lib/site";

const QUICK_PICKS = [
  { vehicle: "car", label: "Car", icon: "car" },
  { vehicle: "bike", label: "Bike", icon: "motorbike" },
  { vehicle: "scooter", label: "Scooter", icon: "scooter" },
  { vehicle: "auto_rickshaw", label: "Auto-rickshaw", icon: "auto" },
  { vehicle: "other", label: "Commercial", icon: "truck" },
] as const;

/** Splits the headline into words so they can rise in one after another. */
function RevealWords({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className="inline-block animate-rise" style={{ animationDelay: `${startDelay + i * 70}ms` }}>
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

export function Hero({
  title,
  subtitle,
  image,
  imageAlt,
  business,
}: {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  business: BusinessInfo;
}) {
  const wordCount = title.split(/\s+/).length;
  const after = 200 + wordCount * 70;
  return (
    <section className="on-dark relative isolate flex min-h-[640px] flex-col overflow-hidden bg-ink text-white lg:min-h-[min(100svh,980px)]">
      <div className="absolute inset-0 -z-10">
        <SmartImage
          src={image}
          alt={imageAlt}
          priority
          sizes="100vw"
          className="photo-tone h-full w-full animate-settle object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="container-site flex flex-1 flex-col justify-end pb-10 pt-36 lg:pb-14 lg:pt-44">
        <div className="max-w-[46rem]">
          <h1 className="display-hero">
            <RevealWords text={title} startDelay={120} />
          </h1>
          <p
            className="mt-6 max-w-xl animate-rise text-[1.12rem] leading-relaxed text-mist sm:text-[1.2rem]"
            style={{ animationDelay: `${after}ms` }}
          >
            {subtitle}
          </p>
          <div className="mt-8 flex animate-rise flex-wrap gap-3" style={{ animationDelay: `${after + 120}ms` }}>
            <ButtonLink href="/book" size="lg">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Book a Service
            </ButtonLink>
            <ButtonLink href={business.phoneHref} variant="outline-light" size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call Now
            </ButtonLink>
            <ButtonLink href="/services" variant="ghost-light" size="lg" className="underline decoration-accent-bright decoration-2 underline-offset-[6px] max-sm:px-0">
              Explore Services
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 animate-rise lg:mt-16" style={{ animationDelay: `${after + 260}ms` }}>
          <p className="mb-3 font-display text-[1.05rem] font-semibold text-white" style={{ fontStretch: "88%" }}>
            What are you bringing in?
          </p>
          <ul className="scrollbar-none -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
            {QUICK_PICKS.map((pick) => (
              <li key={pick.vehicle} className="min-w-[8.5rem] snap-start sm:min-w-0">
                <Link
                  href={`/book?vehicle=${pick.vehicle}`}
                  className="group flex h-full items-center gap-3 rounded-[3px] border border-white/15 bg-white/[0.06] px-4 py-3.5 backdrop-blur-sm transition-colors hover:border-accent-bright hover:bg-white/[0.1]"
                >
                  <Icon name={pick.icon} className="h-7 w-7 shrink-0 text-white transition-colors group-hover:text-accent-bright" strokeWidth={1.75} />
                  <span className="font-display text-[1.02rem] font-semibold leading-tight" style={{ fontStretch: "86%" }}>
                    {pick.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
