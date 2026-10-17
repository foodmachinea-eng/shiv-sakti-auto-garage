"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { ChatIcon } from "@/components/icons";
import { OpenStatusText } from "./open-status";
import { NAV_LINKS } from "./nav-links";
import type { BusinessInfo } from "@/lib/site";
import { cn } from "@/lib/format";

export function Header({ business }: { business: BusinessInfo }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="on-dark fixed inset-x-0 top-0 z-50">
      {/* Utility bar */}
      <div
        className={cn(
          "hidden border-b border-white/10 bg-ink/80 text-[0.82rem] text-fog backdrop-blur transition-[margin] duration-300 lg:block",
          scrolled && "-mt-9",
        )}
      >
        <div className="container-site flex h-9 items-center justify-between gap-6">
          <OpenStatusText hours={business.hours} />
          <div className="flex items-center gap-6">
            <span className="truncate">{business.address}</span>
            <a href={business.phoneHref} className="inline-flex items-center gap-1.5 text-white hover:text-accent-bright">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {business.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "transition-[background-color,box-shadow] duration-300",
          scrolled || open ? "bg-ink shadow-[0_1px_0_rgba(255,255,255,0.08)]" : "bg-gradient-to-b from-ink/70 to-transparent",
        )}
      >
        <div className="container-site flex h-[4.25rem] items-center justify-between gap-6">
          <Link href="/" className="shrink-0 rounded-sm" aria-label={`${business.name} home`}>
            <Logo name={business.name} logoUrl={business.logoUrl} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-sm px-3 py-2 font-display text-[1.02rem] font-medium text-white/85 transition-colors hover:text-white",
                      "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300",
                      "hover:after:scale-x-100 aria-[current=page]:text-white aria-[current=page]:after:scale-x-100",
                    )}
                    style={{ fontStretch: "88%" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={business.phoneHref}
              className="hidden h-11 w-11 items-center justify-center rounded-[3px] border border-white/25 text-white transition-colors hover:border-white sm:inline-flex lg:hidden"
              aria-label={`Call ${business.phone}`}
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <ButtonLink href="/book" className="hidden sm:inline-flex">
              Book a service
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] text-white hover:bg-white/10 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.25rem] overflow-y-auto bg-ink lg:hidden"
      >
        <div className="container-site flex min-h-full flex-col gap-8 py-6 animate-fade-in">
          <nav aria-label="Mobile">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/book", label: "Book a service" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={(link.href === "/" ? pathname === "/" : isActive(link.href)) ? "page" : undefined}
                    className="flex items-center justify-between py-3.5 font-display text-[1.6rem] font-bold text-white aria-[current=page]:text-accent-bright"
                    style={{ fontStretch: "80%" }}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ButtonLink href={business.phoneHref} variant="outline-light" size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" /> Call {business.phone}
            </ButtonLink>
            <ButtonLink href={business.whatsappHref} variant="whatsapp" size="lg">
              <ChatIcon className="h-5 w-5" aria-hidden="true" /> WhatsApp us
            </ButtonLink>
          </div>
          <div className="mt-auto space-y-1 pb-24 text-[0.92rem] text-fog">
            <OpenStatusText hours={business.hours} className="text-white" />
            <p>{business.address}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
