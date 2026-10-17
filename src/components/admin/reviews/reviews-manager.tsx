"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { SampleTag } from "@/components/admin/ui";
import { Modal, Toggle, useConfirm } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/field";
import { apiRequest, type ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/format";

export type ReviewAdminView = {
  id: number;
  customerName: string;
  vehicle: string;
  rating: number;
  content: string;
  isSample: boolean;
  isPublished: boolean;
};
type Draft = Omit<ReviewAdminView, "id">;

export function ReviewsManager({ reviews }: { reviews: ReviewAdminView[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const samples = reviews.filter((r) => r.isSample);

  async function patch(id: number, body: Partial<Draft>, message: string) {
    try {
      await apiRequest(`/api/admin/testimonials/${id}`, { method: "PATCH", body });
      toast.success(message);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function move(index: number, delta: number) {
    const ids = reviews.map((r) => r.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await apiRequest("/api/admin/testimonials/reorder", { body: { ids } });
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setErrors({});
    try {
      if (editing.id) await apiRequest(`/api/admin/testimonials/${editing.id}`, { method: "PATCH", body: editing.draft });
      else await apiRequest("/api/admin/testimonials", { body: editing.draft });
      toast.success(editing.id ? "Review updated" : "Review added");
      setEditing(null);
      router.refresh();
    } catch (e) {
      const err = e as ApiClientError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          onClick={() => {
            setErrors({});
            setEditing({ id: null, draft: { customerName: "", vehicle: "", rating: 5, content: "", isSample: false, isPublished: true } });
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add a review
        </Button>
        {samples.length > 0 && (
          <Button
            variant="subtle"
            onClick={async () => {
              const ok = await confirm({
                title: `Delete ${samples.length} sample review${samples.length === 1 ? "" : "s"}?`,
                message: "Do this once you've added genuine customer reviews. Sample reviews are labelled on the website until then.",
                confirmLabel: "Delete sample reviews",
                danger: true,
              });
              if (!ok) return;
              try {
                for (const r of samples) await apiRequest(`/api/admin/testimonials/${r.id}`, { method: "DELETE" });
                toast.success("Sample reviews deleted");
                router.refresh();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete all sample reviews
          </Button>
        )}
      </div>

      {samples.length > 0 && (
        <p className="mb-5 rounded-lg border border-dashed border-charcoal/25 bg-white px-4 py-3 text-[0.9rem] text-slate">
          {samples.length} review{samples.length === 1 ? " is" : "s are"} sample content and labelled &ldquo;Sample review&rdquo; on the website.
          Only publish reviews from real customers, with their permission.
        </p>
      )}

      <ul className="space-y-3">
        {reviews.length === 0 && <li className="rounded-lg border border-dashed border-line bg-white px-5 py-12 text-center text-slate">No reviews yet.</li>}
        {reviews.map((r, i) => (
          <li key={r.id} className={cn("flex flex-col gap-4 rounded-lg bg-white p-5 ring-1 ring-line md:flex-row", !r.isPublished && "opacity-70")}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{r.customerName}</span>
                {r.vehicle && <span className="text-[0.85rem] text-slate">{r.vehicle}</span>}
                <span className="inline-flex" aria-label={`${r.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <Star key={k} className={cn("h-3.5 w-3.5", k < r.rating ? "fill-[#f5a524] text-[#f5a524]" : "text-mist")} aria-hidden="true" />
                  ))}
                </span>
                {r.isSample && <SampleTag />}
              </div>
              <p className="mt-2 text-[0.93rem] text-graphite">{r.content}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 md:flex-col md:items-end">
              <Toggle label="Published" checked={r.isPublished} onChange={(v) => patch(r.id, { isPublished: v }, v ? "Review published" : "Review hidden")} />
              <div className="flex">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-2 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move review by ${r.customerName} up`}>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === reviews.length - 1} className="rounded-md p-2 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move review by ${r.customerName} down`}>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setEditing({ id: r.id, draft: { customerName: r.customerName, vehicle: r.vehicle, rating: r.rating, content: r.content, isSample: r.isSample, isPublished: r.isPublished } });
                  }}
                  className="rounded-md p-2 text-slate hover:bg-paper hover:text-charcoal"
                  aria-label={`Edit review by ${r.customerName}`}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirm({ title: "Delete this review?", message: `The review by ${r.customerName} will be removed.`, confirmLabel: "Delete review", danger: true });
                    if (!ok) return;
                    try {
                      await apiRequest(`/api/admin/testimonials/${r.id}`, { method: "DELETE" });
                      toast.success("Review deleted");
                      router.refresh();
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                  className="rounded-md p-2 text-slate hover:bg-[#fdecec] hover:text-[#b42318]"
                  aria-label={`Delete review by ${r.customerName}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit review" : "Add a review"}
        description="Copy genuine reviews word for word, with the customer's permission."
        size="lg"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              {editing?.id ? "Save changes" : "Add review"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Customer name" htmlFor="r-name" required error={errors.customerName} hint="First name and initial is enough, e.g. Rohan M.">
              <Input id="r-name" data-autofocus value={editing.draft.customerName} onChange={(e) => set("customerName", e.target.value)} {...describedBy("r-name", errors.customerName, true)} />
            </Field>
            <Field label="Vehicle" htmlFor="r-vehicle" error={errors.vehicle} hint="e.g. Honda Activa">
              <Input id="r-vehicle" value={editing.draft.vehicle} onChange={(e) => set("vehicle", e.target.value)} />
            </Field>
            <fieldset className="sm:col-span-2">
              <legend className="text-[0.9rem] font-medium">Rating</legend>
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="relative cursor-pointer rounded-md p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
                    <input type="radio" name="rating" value={n} checked={editing.draft.rating === n} onChange={() => set("rating", n)} className="sr-only" aria-label={`${n} star${n === 1 ? "" : "s"}`} />
                    <Star className={cn("h-7 w-7", n <= editing.draft.rating ? "fill-[#f5a524] text-[#f5a524]" : "text-mist")} aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Review" htmlFor="r-content" required error={errors.content} className="sm:col-span-2">
              <Textarea id="r-content" rows={5} maxLength={800} value={editing.draft.content} onChange={(e) => set("content", e.target.value)} {...describedBy("r-content", errors.content)} />
            </Field>
            <Toggle label="Published" description="Show this review on the website" checked={editing.draft.isPublished} onChange={(v) => set("isPublished", v)} />
            <Toggle label="Sample review" description="Labelled 'Sample review' on the website" checked={editing.draft.isSample} onChange={(v) => set("isSample", v)} />
          </div>
        )}
      </Modal>
    </>
  );
}
