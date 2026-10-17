import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import type { TitledItem } from "@/content/settings-schema";

export function WhyChooseUs({ title, intro, items }: { title: string; intro: string; items: TitledItem[] }) {
  return (
    <section className="on-dark bg-charcoal py-20 text-white lg:py-28" aria-labelledby="why-title">
      <div className="container-site grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="why-title" className="display-1">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[1.08rem] leading-relaxed text-fog">{intro}</p>
          <ButtonLink href="/about" variant="outline-light" className="mt-8">
            About the workshop
          </ButtonLink>
        </div>
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.title} className="border-t border-white/12 py-7">
              <Icon name={item.icon} className="h-7 w-7 text-accent-bright" strokeWidth={1.7} />
              <h3 className="title-sm mt-4 text-[1.3rem]">{item.title}</h3>
              <p className="mt-2 text-[0.97rem] leading-relaxed text-fog">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
