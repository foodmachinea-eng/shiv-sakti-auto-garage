import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Pagination } from "@/components/admin/ui";
import { EnquiryList } from "@/components/admin/enquiries/enquiry-list";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { listEnquiries } from "@/lib/data/bookings";
import { getSettings } from "@/lib/data/settings";
import { getDb } from "@/lib/db/client";
import { enquiries as enquiriesTable } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const user = await requirePageUser();
  if (!can(user.role, "enquiries.view")) return <Forbidden />;
  const params = await searchParams;
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const result = await listEnquiries({ q: one("q"), status: one("status"), page: Number(one("page")) || 1 });
  const db = await getDb();
  const countRows = await db.select({ status: enquiriesTable.status, n: count() }).from(enquiriesTable).groupBy(enquiriesTable.status);
  const counts = Object.fromEntries(countRows.map((r) => [r.status, Number(r.n)]));
  const settings = await getSettings();

  const hrefFor = (page: number) => {
    const sp = new URLSearchParams();
    for (const k of ["q", "status"]) if (one(k)) sp.set(k, one(k)!);
    if (page > 1) sp.set("page", String(page));
    return `/admin/enquiries${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Customer enquiries" description="Messages sent from the contact page. Reply by phone, WhatsApp or email, then mark them resolved." />
      <Suspense>
        <EnquiryList
          enquiries={result.rows.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }))}
          counts={counts}
          canUpdate={can(user.role, "enquiries.update")}
          canDelete={can(user.role, "enquiries.delete")}
          garageName={settings.business.name}
        />
      </Suspense>
      {result.pages > 1 && (
        <div className="mt-4 rounded-lg bg-white ring-1 ring-line">
          <Pagination page={result.page} pages={result.pages} total={result.total} hrefFor={hrefFor} label="enquiries" />
        </div>
      )}
    </>
  );
}
