import type { ReactNode } from "react";
import { SmartImage } from "@/components/ui/smart-image";

export function PageHero({
  title,
  intro,
  image,
  imageAlt = "",
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-white">
      {image && (
        <div className="absolute inset-0 -z-10">
          <SmartImage src={image} alt={imageAlt} priority sizes="100vw" className="photo-tone h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        </div>
      )}
      <div className="container-site pb-14 pt-32 lg:pb-20 lg:pt-44">
        <h1 className="display-1 max-w-3xl animate-rise">{title}</h1>
        {intro && (
          <p className="mt-5 max-w-2xl animate-rise text-[1.1rem] leading-relaxed text-mist" style={{ animationDelay: "120ms" }}>
            {intro}
          </p>
        )}
        {children && (
          <div className="mt-8 animate-rise" style={{ animationDelay: "220ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
