import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { OpenStatusText } from "./open-status";
import { groupedHours } from "@/lib/dates";
import type { BusinessInfo } from "@/lib/site";
import { cn } from "@/lib/format";

/** Address, phone, WhatsApp, email and opening hours, with action buttons. */
export function ContactDetails({ business, tone = "dark" }: { business: BusinessInfo; tone?: "dark" | "light" }) {
  const muted = tone === "dark" ? "text-fog" : "text-slate";
  const strong = tone === "dark" ? "text-white" : "text-charcoal";
  const rule = tone === "dark" ? "border-white/12" : "border-line";
  const icon = tone === "dark" ? "text-accent-bright" : "text-accent";
  return (
    <div>
      <dl className={cn("divide-y border-y", rule, tone === "dark" ? "divide-white/12" : "divide-line")}>
        <div className="flex gap-4 py-4">
          <MapPin className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
          <div>
            <dt className={cn("text-[0.85rem]", muted)}>Workshop address</dt>
            <dd className={cn("mt-0.5", strong)}>
              <address className="not-italic">
                <span className="font-semibold">{business.name}</span>
                {business.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </dd>
          </div>
        </div>
        <div className="flex gap-4 py-4">
          <Phone className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
          <div>
            <dt className={cn("text-[0.85rem]", muted)}>Phone</dt>
            <dd>
              <a href={business.phoneHref} className={cn("font-semibold hover:underline", strong)}>
                {business.phone}
              </a>
            </dd>
          </div>
        </div>
        <div className="flex gap-4 py-4">
          <ChatIcon className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
          <div>
            <dt className={cn("text-[0.85rem]", muted)}>WhatsApp</dt>
            <dd>
              <a href={business.whatsappHref} target="_blank" rel="noopener noreferrer" className={cn("font-semibold hover:underline", strong)}>
                Chat with us on WhatsApp
              </a>
            </dd>
          </div>
        </div>
        {business.email && (
          <div className="flex gap-4 py-4">
            <Mail className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
            <div className="min-w-0">
              <dt className={cn("text-[0.85rem]", muted)}>Email</dt>
              <dd>
                <a href={`mailto:${business.email}`} className={cn("break-all font-semibold hover:underline", strong)}>
                  {business.email}
                </a>
              </dd>
            </div>
          </div>
        )}
      </dl>

      <div className="mt-6">
        <h3 className={cn("title-sm", strong)}>Opening hours</h3>
        <OpenStatusText hours={business.hours} className={cn("mt-1 text-[0.9rem]", muted)} />
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[0.95rem]">
          {groupedHours(business.hours).map((h) => (
            <div key={h.label} className="contents">
              <dt className={muted}>{h.label}</dt>
              <dd className={cn("font-medium", strong)}>{h.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={business.directionsUrl} variant={tone === "dark" ? "white" : "outline-dark"}>
          <Navigation className="h-4 w-4" aria-hidden="true" />
          Get directions
        </ButtonLink>
        <ButtonLink href={business.phoneHref} variant={tone === "dark" ? "outline-light" : "outline-dark"}>
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call
        </ButtonLink>
        <ButtonLink href={business.whatsappHref} variant="whatsapp">
          <ChatIcon className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </ButtonLink>
      </div>
    </div>
  );
}
