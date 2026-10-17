import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/format";

export const inputClasses =
  "block w-full rounded-[3px] border border-line bg-white px-3.5 text-[1rem] text-charcoal placeholder:text-slate/70 shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:border-graphite/40 focus:border-charcoal focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent aria-[invalid=true]:border-[#b42318] aria-[invalid=true]:bg-[#fff8f7] disabled:bg-paper disabled:text-slate";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
  optionalText = "Optional",
}: {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  optionalText?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-[0.9rem] font-medium text-charcoal">
        <span>
          {label}
          {required && (
            <span className="text-accent-strong" aria-hidden="true">
              {" "}*
            </span>
          )}
        </span>
        {!required && optionalText && <span className="text-[0.78rem] font-normal text-slate">{optionalText}</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[0.84rem] font-medium text-[#b42318]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[0.82rem] text-slate">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputClasses, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(inputClasses, "py-2.5 leading-relaxed", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(inputClasses, "h-11 appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

/** Props that connect an input to its error/hint text for screen readers. */
export function describedBy(id: string, error?: string, hint?: boolean) {
  return {
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };
}
