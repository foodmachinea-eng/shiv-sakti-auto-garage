import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ReviewsManager } from "@/components/admin/reviews/reviews-manager";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getTestimonials } from "@/lib/data/gallery";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const user = await requirePageUser();
  if (!can(user.role, "reviews.manage")) return <Forbidden />;
  const reviews = await getTestimonials(true);
  return (
    <>
      <PageHeader title="Customer reviews" description="Reviews shown on the homepage (first three) and the reviews page." />
      <ReviewsManager
        reviews={reviews.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          vehicle: r.vehicle,
          rating: r.rating,
          content: r.content,
          isSample: r.isSample,
          isPublished: r.isPublished,
        }))}
      />
    </>
  );
}
