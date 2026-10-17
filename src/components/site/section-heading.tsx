import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function SectionHeading({
  title,
  intro,
  action,
  tone = "light",
  className,
  id,
}: {
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <h2 id={id} className={cn("display-2", tone === "dark" ? "text-white" : "text-charcoal")}>
          {title}
        </h2>
        {intro && (
          <p className={cn("mt-4 text-[1.06rem] leading-relaxed", tone === "dark" ? "text-fog" : "text-slate")}>{intro}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function TextLink({
  href,
  children,
  tone = "light",
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 pb-0.5 font-display text-[1.02rem] font-semibold transition-colors",
        tone === "dark"
          ? "border-accent-bright text-white hover:text-accent-bright"
          : "border-accent text-charcoal hover:text-accent-strong",
      )}
      style={{ fontStretch: "88%" }}
    >
      {children}
    </a>
  );
}
