import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="on-dark flex min-h-screen flex-col items-center justify-center bg-ink px-6 py-20 text-center text-white">
      <LogoMark className="h-16 w-16" wrenchColor="#ffffff" />
      <p className="numerals mt-8 text-[1rem] font-semibold text-accent-bright">Error 404</p>
      <h1 className="display-1 mt-2">This page took a wrong turn</h1>
      <p className="mt-4 max-w-md text-[1.05rem] text-fog">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Head back to the homepage or book a service.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("white")} style={{ fontStretch: "88%" }}>
          Go to homepage
        </Link>
        <Link href="/book" className={buttonClasses("primary")} style={{ fontStretch: "88%" }}>
          Book a service
        </Link>
      </div>
    </main>
  );
}
