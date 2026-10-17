import type { ReactNode } from "react";
import { cn } from "@/lib/format";

const tones = {
  neutral: "bg-paper text-graphite ring-line",
  amber: "bg-[#fff6e0] text-[#8a5300] ring-[#f3d38a]",
  blue: "bg-[#ebf2ff] text-[#1d4ed8] ring-[#bcd2fb]",
  green: "bg-[#e9f7ef] text-[#146c3a] ring-[#b4e2c5]",
  red: "bg-[#fdecec] text-[#a4161a] ring-[#f5bcbc]",
  dark: "bg-charcoal text-white ring-charcoal",
  outline: "bg-transparent text-current ring-current/30",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
