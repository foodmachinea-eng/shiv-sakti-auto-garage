import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";
import { Spinner } from "./spinner";

export type ButtonVariant =
  | "primary"
  | "outline-light"
  | "outline-dark"
  | "ghost-light"
  | "ghost-dark"
  | "whatsapp"
  | "white"
  | "subtle"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-display font-semibold tracking-[0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-200 select-none disabled:pointer-events-none disabled:opacity-55 active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong shadow-[0_1px_0_rgba(0,0,0,0.25)]",
  "outline-light": "border border-white/55 text-white hover:border-white hover:bg-white/10",
  "outline-dark": "border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/[0.04]",
  "ghost-light": "text-white hover:bg-white/10",
  "ghost-dark": "text-charcoal hover:bg-charcoal/[0.06]",
  whatsapp: "bg-whatsapp text-white hover:brightness-110",
  white: "bg-white text-charcoal hover:bg-concrete",
  subtle: "border border-line bg-white text-charcoal hover:bg-paper",
  danger: "bg-[#b42318] text-white hover:bg-[#912018]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[0.9rem]",
  md: "h-11 px-5 text-[1rem]",
  lg: "h-[3.25rem] px-6 text-[1.075rem]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

const stretch = { fontStretch: "88%" } as const;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={stretch}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  if (external) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={buttonClasses(variant, size, className)}
        style={stretch}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(props as ComponentProps<"a">)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} style={stretch} {...props}>
      {children}
    </Link>
  );
}
