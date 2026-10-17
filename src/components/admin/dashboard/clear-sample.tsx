"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/admin/ui-client";
import { apiRequest } from "@/lib/client-api";

export function ClearSampleDataButton({ count }: { count: number }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="subtle"
      size="sm"
      loading={busy}
      onClick={async () => {
        const ok = await confirm({
          title: "Remove sample data?",
          message: `This permanently deletes the ${count} sample bookings and enquiries created for the demo. Bookings from real customers are kept.`,
          confirmLabel: "Remove sample data",
          danger: true,
        });
        if (!ok) return;
        setBusy(true);
        try {
          const res = await apiRequest<{ removed: { bookings: number; enquiries: number } }>("/api/admin/sample-data", { method: "DELETE" });
          toast.success(`Removed ${res.removed.bookings} bookings and ${res.removed.enquiries} enquiries`);
          router.refresh();
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      Remove sample data
    </Button>
  );
}
