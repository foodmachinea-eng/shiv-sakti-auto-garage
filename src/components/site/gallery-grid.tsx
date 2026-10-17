"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/format";

export type GalleryView = { id: number; title: string; caption: string; category: string; imageUrl: string; alt: string };

export function GalleryGrid({ items }: { items: GalleryView[] }) {
  const categories = GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c.value));
  const [filter, setFilter] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);

  const count = visible.length;
  const close = () => {
    setOpenIndex(null);
    lastTrigger.current?.focus();
  };
  const step = (delta: number) => setOpenIndex((i) => (i == null ? i : (i + delta + count) % count));
  const isOpen = openIndex != null;

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenIndex(null);
        lastTrigger.current?.focus();
      }
      if (e.key === "ArrowRight") setOpenIndex((i) => (i == null ? i : (i + 1) % count));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i == null ? i : (i - 1 + count) % count));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, count]);

  const current = openIndex != null ? visible[openIndex] : null;
  const label = (value: string) => GALLERY_CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter photos">
        {[{ value: "all", label: "All photos" }, ...categories].map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={filter === c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 font-display text-[0.98rem] font-semibold transition-colors",
              filter === c.value ? "border-charcoal bg-charcoal text-white" : "border-line bg-white text-charcoal hover:border-charcoal",
            )}
            style={{ fontStretch: "88%" }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[0.9rem] text-slate" aria-live="polite">
        {visible.length} photo{visible.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((item, i) => (
          <li key={item.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpenIndex(i);
              }}
              className="group relative block w-full overflow-hidden rounded-[3px] bg-gunmetal text-left"
              aria-label={`Open photo: ${item.title}`}
            >
              <SmartImage
                src={item.imageUrl}
                alt={item.alt || item.title}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                maxWidth={1440}
                className={cn(
                  "photo-tone w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                  i % 5 === 0 ? "aspect-[4/5]" : i % 3 === 0 ? "aspect-square" : "aspect-[4/3]",
                )}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-10 text-white">
                <span className="block font-display text-[1.05rem] font-semibold" style={{ fontStretch: "88%" }}>
                  {item.title}
                </span>
                <span className="text-[0.8rem] text-mist">{label(item.category)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          tabIndex={-1}
          className="fixed inset-0 z-[70] flex flex-col bg-ink/95 text-white outline-none animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart.current == null) return;
            const dx = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-[0.9rem] text-fog">
              {openIndex! + 1} / {visible.length}
            </p>
            <button type="button" onClick={close} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close">
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <SmartImage
              key={current.id}
              src={current.imageUrl}
              alt={current.alt || current.title}
              sizes="100vw"
              className="max-h-full max-w-full rounded-[3px] object-contain animate-fade-in"
            />
            {visible.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:left-5"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:right-5"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          <div className="px-4 py-5 text-center sm:px-6">
            <p className="font-display text-[1.25rem] font-semibold" style={{ fontStretch: "88%" }}>
              {current.title}
            </p>
            <p className="mt-1 text-[0.9rem] text-fog">{current.caption || label(current.category)}</p>
          </div>
        </div>
      )}
    </>
  );
}
