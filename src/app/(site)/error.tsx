"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="on-dark flex min-h-[70vh] items-center bg-ink pt-24 text-white">
      <div className="container-site max-w-2xl">
        <h1 className="display-1">Something went wrong</h1>
        <p className="mt-4 text-[1.05rem] text-fog">
          This page couldn&apos;t load right now. Try again, or call us if you need help straight away.
        </p>
        <Button className="mt-8" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </section>
  );
}
