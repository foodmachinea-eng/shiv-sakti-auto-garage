import { Star } from "lucide-react";
import { cn } from "@/lib/format";

export type ReviewView = {
  id: number;
  customerName: string;
  vehicle: string;
  rating: number;
  content: string;
  isSample: boolean;
};

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < rating ? "fill-[#f5a524] text-[#f5a524]" : "fill-transparent text-mist")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ReviewCard({ review }: { review: ReviewView }) {
  return (
    <figure className="flex h-full flex-col rounded-[3px] bg-white p-6 ring-1 ring-line sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        {review.isSample && (
          <span
            className="rounded-[2px] border border-dashed border-charcoal/35 px-1.5 py-0.5 text-[0.72rem] font-semibold text-slate"
            title="Sample review for the demo website"
          >
            Sample review
          </span>
        )}
      </div>
      <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-charcoal">
        <p>“{review.content}”</p>
      </blockquote>
      <figcaption className="mt-6 border-t border-line pt-4">
        <span className="block font-display text-[1.05rem] font-semibold" style={{ fontStretch: "88%" }}>
          {review.customerName}
        </span>
        {review.vehicle && <span className="text-[0.88rem] text-slate">{review.vehicle}</span>}
      </figcaption>
    </figure>
  );
}
