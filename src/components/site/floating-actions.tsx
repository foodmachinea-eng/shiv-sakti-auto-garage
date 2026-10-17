"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Phone } from "lucide-react";
import { ChatIcon } from "@/components/icons";
import type { BusinessInfo } from "@/lib/site";

/** Desktop: floating WhatsApp button. Mobile: bottom bar with Call / WhatsApp / Book. */
export function FloatingActions({ business }: { business: Pick<BusinessInfo, "phone" | "phoneHref" | "whatsappHref"> }) {
  const pathname = usePathname();
  const onBookingPage = pathname === "/book";

  return (
    <>
      <a
        href={business.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 right-6 z-40 hidden items-center gap-0 rounded-full bg-whatsapp p-4 text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-all duration-300 hover:gap-2.5 hover:pr-6 md:flex"
        aria-label="Chat with us on WhatsApp"
      >
        <ChatIcon className="h-6 w-6" aria-hidden="true" />
        <span
          className="max-w-0 overflow-hidden whitespace-nowrap font-display text-[1rem] font-semibold transition-[max-width] duration-300 group-hover:max-w-[12rem] group-focus-visible:max-w-[12rem]"
          style={{ fontStretch: "88%" }}
        >
          WhatsApp enquiry
        </span>
      </a>

      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className={`grid ${onBookingPage ? "grid-cols-2" : "grid-cols-3"}`}>
          <a href={business.phoneHref} className="flex h-16 flex-col items-center justify-center gap-1 text-[0.78rem] font-medium text-white">
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call
          </a>
          <a
            href={business.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-16 flex-col items-center justify-center gap-1 text-[0.78rem] font-medium text-white"
          >
            <ChatIcon className="h-5 w-5 text-[#3ddc84]" aria-hidden="true" />
            WhatsApp
          </a>
          {!onBookingPage && (
            <Link
              href="/book"
              className="flex h-16 flex-col items-center justify-center gap-1 bg-accent text-[0.78rem] font-semibold text-white"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Book service
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
