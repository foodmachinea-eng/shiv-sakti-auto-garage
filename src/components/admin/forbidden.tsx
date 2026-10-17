import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function Forbidden() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-8 text-center ring-1 ring-line">
      <ShieldAlert className="mx-auto h-10 w-10 text-slate" aria-hidden="true" />
      <h1 className="mt-4 text-[1.2rem] font-semibold">You don&apos;t have access to this page</h1>
      <p className="mt-2 text-[0.92rem] text-slate">Ask an admin to change your role if you need it.</p>
      <ButtonLink href="/admin" variant="subtle" size="sm" className="mt-6">
        Back to dashboard
      </ButtonLink>
    </div>
  );
}
