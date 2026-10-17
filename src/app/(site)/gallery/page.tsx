import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { getGallery } from "@/lib/data/gallery";
import { IMG } from "@/content/images";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of the workshop, our mechanics at work, engine repairs, car and bike maintenance and workshop equipment.",
};

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <>
      <PageHero
        title="Inside the workshop"
        intro="The garage, the equipment and the team at work on cars, bikes and everything in between."
        image={IMG.workshopFloor}
      />
      <section className="bg-paper py-12 lg:py-16" aria-label="Photo gallery">
        <div className="container-site">
          {items.length ? (
            <GalleryGrid
              items={items.map((i) => ({
                id: i.id,
                title: i.title,
                caption: i.caption,
                category: i.category,
                imageUrl: i.imageUrl,
                alt: i.alt,
              }))}
            />
          ) : (
            <p className="py-16 text-center text-slate">Photos of the workshop will appear here soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
