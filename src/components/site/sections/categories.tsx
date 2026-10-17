import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";
import { Icon } from "@/components/icons";
import { SectionHeading, TextLink } from "@/components/site/section-heading";
import type { CategoryWithServices } from "@/lib/data/catalog";
import { cn } from "@/lib/format";

function topServices(cat: CategoryWithServices, n: number) {
  return [...cat.services].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder).slice(0, n);
}

export function Categories({ categories }: { categories: CategoryWithServices[] }) {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="categories-title">
      <div className="container-site">
        <SectionHeading
          id="categories-title"
          title="Repairs and servicing for every vehicle"
          intro="Pick your vehicle to see the work we do and what it typically costs. Everything is handled in one workshop."
          action={<TextLink href="/services">See all services</TextLink>}
        />

        <div className={cn("mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12", categories.length >= 3 && "lg:grid-rows-2")}>
          {categories.map((cat, i) => {
            // With one or two categories every card gets the large treatment.
            const lead = categories.length <= 2 || i === 0;
            const span =
              categories.length === 1
                ? "lg:col-span-12 lg:min-h-[480px]"
                : categories.length === 2
                  ? "lg:col-span-6 lg:min-h-[520px]"
                  : lead
                    ? "lg:col-span-7 lg:row-span-2 lg:min-h-[640px]"
                    : "lg:col-span-5";
            return (
              <article
                key={cat.id}
                className={cn(
                  "on-dark group relative isolate flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[3px] bg-ink text-white",
                  span,
                )}
              >
                <SmartImage
                  src={cat.imageUrl}
                  alt=""
                  sizes={lead ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
                  className="photo-tone absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/10" />
                <div className="p-6 sm:p-8">
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[3px] bg-accent text-white">
                    <Icon name={cat.icon} className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <h3 className={lead ? "display-2" : "display-3"}>
                    <Link href={`/services#${cat.slug}`} className="after:absolute after:inset-0 after:content-['']">
                      {cat.name}
                    </Link>
                  </h3>
                  <p className={cn("mt-3 max-w-xl text-mist", lead ? "text-[1.05rem]" : "text-[0.95rem]")}>{cat.description}</p>
                  <ul className={cn("mt-5 flex flex-wrap gap-2", !lead && "hidden sm:flex")}>
                    {topServices(cat, lead ? 6 : 3).map((s) => (
                      <li
                        key={s.id}
                        className="rounded-full border border-white/20 bg-ink/40 px-3 py-1 text-[0.82rem] text-white backdrop-blur-sm"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[0.9rem] font-medium text-white/80">
                    {cat.services.length} services
                    <span className="ml-2 inline-block text-accent-bright transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                      ›
                    </span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
