import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { ChatIcon } from "@/components/icons";
import { NAV_LINKS } from "./nav-links";
import { groupedHours } from "@/lib/dates";
import type { BusinessInfo } from "@/lib/site";

export function Footer({
  business,
  categories,
  demoNotice,
}: {
  business: BusinessInfo;
  categories: { slug: string; name: string }[];
  demoNotice: string | null;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-ink pb-20 text-fog md:pb-0">
      <div className="container-site grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr] lg:gap-10">
        <div className="max-w-sm space-y-5">
          <Logo name={business.name} logoUrl={business.logoUrl} />
          <p className="text-[0.95rem] leading-relaxed">
            {business.tagline.replace(/[.!\s]+$/, "")} in {business.city}.
          </p>
          {business.social.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.92rem]">
              {business.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-white underline-offset-4 hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className="title-sm mb-4 text-white">Explore</h2>
          <ul className="space-y-2.5 text-[0.95rem]">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
            <li><Link href="/book" className="text-white hover:text-accent-bright">Book a service</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="title-sm mb-4 text-white">Services</h2>
          <ul className="space-y-2.5 text-[0.95rem]">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/services#${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
            <li><Link href="/packages" className="hover:text-white">Service packages & prices</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="title-sm mb-4 text-white">Visit the workshop</h2>
          <ul className="space-y-3 text-[0.95rem]">
            <li className="flex gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
              <address className="not-italic">{business.addressLines.map((l) => <span key={l} className="block">{l}</span>)}</address>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
              <a href={business.phoneHref} className="text-white hover:underline">{business.phone}</a>
            </li>
            <li className="flex gap-3">
              <ChatIcon className="mt-1 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
              <a href={business.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">WhatsApp us</a>
            </li>
            {business.email && (
              <li className="flex gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
                <a href={`mailto:${business.email}`} className="break-all text-white hover:underline">{business.email}</a>
              </li>
            )}
          </ul>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.9rem]">
            {groupedHours(business.hours).map((h) => (
              <div key={h.label} className="contents">
                <dt>{h.label}</dt>
                <dd className="text-white">{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-[0.84rem] md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {business.name}. All rights reserved.
            {demoNotice && <span className="mt-1 block text-steel md:ml-2 md:mt-0 md:inline">{demoNotice}</span>}
          </p>
          <ul className="flex gap-5">
            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link href="/admin/login" className="hover:text-white" rel="nofollow">Staff login</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
