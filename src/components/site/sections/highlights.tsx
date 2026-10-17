export function Highlights({ items }: { items: { title: string; text: string }[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Highlights" className="on-dark border-t border-white/10 bg-ink text-white">
      <ul className="container-site grid grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <li
            key={item.title}
            className={`py-7 pr-4 lg:py-9 ${i % 2 === 1 ? "pl-5 sm:pl-8" : ""} ${i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""} ${
              i % 2 === 1 ? "border-l border-white/10" : ""
            } ${i >= 2 ? "border-t border-white/10 lg:border-t-0" : ""}`}
          >
            <p className="font-display text-[1.6rem] font-bold leading-none sm:text-[1.9rem]" style={{ fontStretch: "78%" }}>
              {item.title}
            </p>
            <p className="mt-2 text-[0.92rem] leading-snug text-fog">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
