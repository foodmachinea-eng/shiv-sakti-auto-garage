import { Check } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { TextLink } from "@/components/site/section-heading";

export function Workshop({
  title,
  text,
  points,
  images,
}: {
  title: string;
  text: string;
  points: string[];
  images: { url: string; alt: string }[];
}) {
  const [a, b, c, d] = images;
  return (
    <section className="on-dark bg-ink py-20 text-white lg:py-28" aria-labelledby="workshop-title">
      <div className="container-site grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
        <div className="grid grid-cols-6 grid-rows-[repeat(4,minmax(0,1fr))] gap-3 sm:gap-4" style={{ aspectRatio: "6 / 5" }}>
          {a && (
            <SmartImage src={a.url} alt={a.alt} sizes="(min-width: 1024px) 40vw, 66vw" className="photo-tone col-span-4 row-span-4 h-full w-full rounded-[3px] object-cover" />
          )}
          {b && (
            <SmartImage src={b.url} alt={b.alt} sizes="(min-width: 1024px) 20vw, 33vw" className="photo-tone col-span-2 row-span-2 h-full w-full rounded-[3px] object-cover" />
          )}
          {c && (
            <SmartImage src={c.url} alt={c.alt} sizes="(min-width: 1024px) 10vw, 16vw" className="photo-tone col-span-1 row-span-2 h-full w-full rounded-[3px] object-cover" />
          )}
          {d && (
            <SmartImage src={d.url} alt={d.alt} sizes="(min-width: 1024px) 10vw, 16vw" className="photo-tone col-span-1 row-span-2 h-full w-full rounded-[3px] object-cover" />
          )}
        </div>
        <div>
          <h2 id="workshop-title" className="display-1">
            {title}
          </h2>
          <p className="mt-5 text-[1.06rem] leading-relaxed text-fog">{text}</p>
          {points.length > 0 && (
            <ul className="mt-7 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-[1rem]">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-9">
            <TextLink href="/gallery" tone="dark">
              Look around the workshop
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
