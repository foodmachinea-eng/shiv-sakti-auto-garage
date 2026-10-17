export function Process({ title, steps }: { title: string; steps: { title: string; text: string }[] }) {
  return (
    <section className="bg-paper py-20 lg:py-24" aria-labelledby="process-title">
      <div className="container-site">
        <h2 id="process-title" className="display-2 max-w-2xl">
          {title}
        </h2>
        <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, i) => (
            <li key={step.title} className="relative lg:pr-10">
              <div className="flex items-center gap-4">
                <span
                  className="numerals flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-charcoal text-[1.6rem] font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="hidden h-0.5 flex-1 bg-charcoal/15 lg:block" aria-hidden="true" />}
              </div>
              <h3 className="title-sm mt-5 text-[1.25rem]">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-[0.97rem] leading-relaxed text-slate">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
