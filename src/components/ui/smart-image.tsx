"use client";

import { useState, type CSSProperties } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/format";

const WIDTHS = [480, 768, 1080, 1440, 1920];

function isUnsplash(src: string) {
  return src.startsWith("https://images.unsplash.com/");
}

function unsplashUrl(src: string, width: number, quality: number) {
  return `${src.split("?")[0]}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/**
 * Responsive image for both stock photos (Unsplash CDN, resized on the fly)
 * and uploaded images (/media/...). Shows a neutral placeholder if an image
 * fails to load, so a broken link never looks broken.
 */
export function SmartImage({
  src,
  alt,
  sizes = "100vw",
  className,
  priority = false,
  quality = 72,
  maxWidth = 1920,
  style,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  maxWidth?: number;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={cn("flex items-center justify-center bg-gunmetal text-steel", className)}
        style={style}
      >
        <ImageOff className="h-8 w-8 opacity-60" aria-hidden="true" />
      </div>
    );
  }

  const unsplash = isUnsplash(src);
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- stock photos are resized by the Unsplash CDN; uploads are served from /media
    <img
      src={unsplash ? unsplashUrl(src, Math.min(1440, maxWidth), quality) : src}
      srcSet={unsplash ? widths.map((w) => `${unsplashUrl(src, w, quality)} ${w}w`).join(", ") : undefined}
      sizes={unsplash ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
      className={cn("bg-gunmetal", className)}
      style={style}
    />
  );
}
