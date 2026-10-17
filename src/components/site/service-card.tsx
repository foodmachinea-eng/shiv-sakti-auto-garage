import Link from "next/link";
import { Clock } from "lucide-react";
import { Icon } from "@/components/icons";
import { formatINR } from "@/lib/format";
import type { Service } from "@/lib/db/schema";

export function ServiceCard({
  service,
  bookVehicle,
  priceLabel,
}: {
  service: Service;
  bookVehicle: string;
  priceLabel: string;
}) {
  return (
    <article className="group flex flex-col border-t-2 border-charcoal bg-white p-6 ring-1 ring-inset ring-line transition-colors hover:border-accent">
      <Icon name={service.icon} className="h-8 w-8 text-accent" strokeWidth={1.6} />
      <h3 className="title-sm mt-4 text-[1.22rem]">{service.name}</h3>
      <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-slate">{service.description}</p>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          {service.priceFrom != null ? (
            <>
              <p className="numerals text-[1.35rem] font-bold leading-none">
                <span className="mr-1 font-sans text-[0.8rem] font-medium text-slate">From</span>
                {formatINR(service.priceFrom)}
                {service.priceNote && <span className="ml-1 font-sans text-[0.8rem] font-medium text-slate">{service.priceNote}</span>}
              </p>
              <p className="mt-1.5 text-[0.75rem] text-slate">{priceLabel}</p>
            </>
          ) : (
            <p className="text-[0.95rem] font-semibold">{service.priceNote || "Price after inspection"}</p>
          )}
          {service.duration && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-[0.8rem] text-slate">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {service.duration}
            </p>
          )}
        </div>
        <Link
          href={`/book?service=${service.id}&vehicle=${bookVehicle}`}
          className="shrink-0 rounded-[3px] border border-charcoal/25 px-3.5 py-2 font-display text-[0.92rem] font-semibold transition-colors hover:border-accent hover:bg-accent hover:text-white"
          style={{ fontStretch: "88%" }}
          aria-label={`Book ${service.name}`}
        >
          Book
        </Link>
      </div>
    </article>
  );
}
