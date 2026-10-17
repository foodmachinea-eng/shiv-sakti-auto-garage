import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { GalleryManager } from "@/components/admin/gallery/gallery-manager";
import { Forbidden } from "@/components/admin/forbidden";
import { requirePageUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { getGallery } from "@/lib/data/gallery";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const user = await requirePageUser();
  if (!can(user.role, "gallery.manage")) return <Forbidden />;
  const items = await getGallery(true);
  return (
    <>
      <PageHeader title="Gallery" description="Upload photos of the garage, the team and the work. Use the arrows to change the order on the website." />
      <GalleryManager
        items={items.map((i) => ({
          id: i.id,
          title: i.title,
          caption: i.caption,
          category: i.category,
          imageUrl: i.imageUrl,
          alt: i.alt,
          isPublished: i.isPublished,
        }))}
      />
    </>
  );
}
