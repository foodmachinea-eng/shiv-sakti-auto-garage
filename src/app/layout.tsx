import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

// Page titles and descriptions come from the editable settings (see app/(site)/layout.tsx).
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Garage",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preload" href="/fonts/saira-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/plex-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
