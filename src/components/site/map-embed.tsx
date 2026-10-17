import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/format";

export function MapEmbed({
  src,
  title,
  openUrl,
  className,
}: {
  src: string;
  title: string;
  openUrl?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[3px] bg-gunmetal", className)}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
      {openUrl && (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-[3px] bg-white px-3 py-2 text-[0.85rem] font-semibold text-charcoal shadow-md hover:bg-concrete"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open in Google Maps
        </a>
      )}
    </div>
  );
}
