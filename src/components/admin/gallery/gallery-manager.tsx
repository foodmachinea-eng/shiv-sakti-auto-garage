"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, EyeOff, ImagePlus, Link2, Pencil, Trash2 } from "lucide-react";
import { Modal, Toggle, useConfirm } from "@/components/admin/ui-client";
import { ImageField } from "@/components/admin/image-field";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, inputClasses, describedBy } from "@/components/ui/field";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { uploadImage } from "@/lib/image-upload";
import { apiRequest, type ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/format";

export type GalleryAdminView = {
  id: number;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  alt: string;
  isPublished: boolean;
};

type Draft = Omit<GalleryAdminView, "id">;

const titleFromFile = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
    .slice(0, 80) || "Workshop photo";

export function GalleryManager({ items }: { items: GalleryAdminView[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<string>(GALLERY_CATEGORIES[0].value);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const label = (v: string) => GALLERY_CATEGORIES.find((c) => c.value === v)?.label ?? v;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 20);
    setProgress({ done: 0, total: list.length });
    let ok = 0;
    for (const [i, file] of list.entries()) {
      try {
        const { url } = await uploadImage(file);
        await apiRequest("/api/admin/gallery", {
          body: { title: titleFromFile(file.name), caption: "", category: uploadCategory, imageUrl: url, alt: "", isPublished: true },
        });
        ok++;
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
      setProgress({ done: i + 1, total: list.length });
    }
    setProgress(null);
    if (ok) toast.success(`${ok} photo${ok === 1 ? "" : "s"} added. Edit titles and descriptions for better search results.`);
    router.refresh();
  }

  async function patch(id: number, body: Partial<Draft>, message: string) {
    try {
      await apiRequest(`/api/admin/gallery/${id}`, { method: "PATCH", body });
      toast.success(message);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function move(id: number, delta: number) {
    const ids = items.map((i) => i.id);
    const index = ids.indexOf(id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await apiRequest("/api/admin/gallery/reorder", { body: { ids } });
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
      if (editing.id) await apiRequest(`/api/admin/gallery/${editing.id}`, { method: "PATCH", body: editing.draft });
      else await apiRequest("/api/admin/gallery", { body: editing.draft });
      toast.success(editing.id ? "Photo updated" : "Photo added");
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
      <div className="flex flex-col gap-4 rounded-lg bg-white p-5 ring-1 ring-line lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <label className="w-56">
            <span className="mb-1 block text-[0.8rem] text-slate">Add new photos to</span>
            <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className={cn(inputClasses, "h-10 rounded-md text-[0.9rem]")}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <Button size="md" onClick={() => fileRef.current?.click()} loading={!!progress}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {progress ? `Uploading ${progress.done} of ${progress.total}…` : "Upload photos"}
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              setErrors({});
              setEditing({ id: null, draft: { title: "", caption: "", category: uploadCategory, imageUrl: "", alt: "", isPublished: true } });
            }}
          >
            <Link2 className="h-4 w-4" aria-hidden="true" /> Add from a link
          </Button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" aria-label="Choose photos to upload" onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }} />
        </div>
        <p className="max-w-sm text-[0.82rem] text-slate">Photos are resized in your browser before upload, so large phone photos are fine. Up to 20 at a time.</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        {[{ value: "all", label: "All" }, ...GALLERY_CATEGORIES].map((c) => {
          const n = c.value === "all" ? items.length : items.filter((i) => i.category === c.value).length;
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={filter === c.value}
              onClick={() => setFilter(c.value)}
              className={cn("rounded-full border px-3 py-1.5 text-[0.84rem] font-medium", filter === c.value ? "border-charcoal bg-charcoal text-white" : "border-line bg-white hover:border-charcoal/40")}
            >
              {c.label} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-line bg-white px-5 py-12 text-center text-slate">No photos here yet. Upload some above.</p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => {
            const index = items.findIndex((i) => i.id === item.id);
            return (
              <li key={item.id} className={cn("overflow-hidden rounded-lg bg-white ring-1 ring-line", !item.isPublished && "opacity-75")}>
                <div className="relative aspect-[4/3] bg-paper">
                  <SmartImage src={item.imageUrl} alt={item.alt || item.title} sizes="300px" maxWidth={768} className="h-full w-full object-cover" />
                  {!item.isPublished && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-charcoal/85 px-2 py-0.5 text-[0.72rem] font-semibold text-white">
                      <EyeOff className="h-3 w-3" aria-hidden="true" /> Hidden
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-[0.8rem] text-slate">{label(item.category)}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Toggle hideLabel label={`Show "${item.title}" on the website`} checked={item.isPublished} onChange={(v) => patch(item.id, { isPublished: v }, v ? "Photo visible" : "Photo hidden")} />
                    <div className="flex">
                      <button type="button" onClick={() => move(item.id, -1)} disabled={index === 0} className="rounded-md p-2 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move "${item.title}" earlier`}>
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => move(item.id, 1)} disabled={index === items.length - 1} className="rounded-md p-2 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move "${item.title}" later`}>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setEditing({ id: item.id, draft: { title: item.title, caption: item.caption, category: item.category, imageUrl: item.imageUrl, alt: item.alt, isPublished: item.isPublished } });
                        }}
                        className="rounded-md p-2 text-slate hover:bg-paper hover:text-charcoal"
                        aria-label={`Edit "${item.title}"`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({ title: "Delete this photo?", message: `"${item.title}" will be removed from the gallery.`, confirmLabel: "Delete photo", danger: true });
                          if (!ok) return;
                          try {
                            await apiRequest(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
                            toast.success("Photo deleted");
                            router.refresh();
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }}
                        className="rounded-md p-2 text-slate hover:bg-[#fdecec] hover:text-[#b42318]"
                        aria-label={`Delete "${item.title}"`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit photo" : "Add a photo"}
        size="lg"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              {editing?.id ? "Save changes" : "Add photo"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImageField label="Photo" value={editing.draft.imageUrl} onChange={(url) => set("imageUrl", url)} error={errors.imageUrl} allowEmpty={false} aspect="aspect-[4/3]" />
            </div>
            <Field label="Title" htmlFor="g-title" required error={errors.title}>
              <Input id="g-title" data-autofocus value={editing.draft.title} onChange={(e) => set("title", e.target.value)} {...describedBy("g-title", errors.title)} />
            </Field>
            <Field label="Category" htmlFor="g-cat" required>
              <Select id="g-cat" value={editing.draft.category} onChange={(e) => set("category", e.target.value)}>
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Caption" htmlFor="g-caption" error={errors.caption} className="sm:col-span-2" hint="Shown under the photo when it's opened">
              <Input id="g-caption" value={editing.draft.caption} onChange={(e) => set("caption", e.target.value)} />
            </Field>
            <Field label="Description for screen readers" htmlFor="g-alt" error={errors.alt} className="sm:col-span-2" hint="Describe what's in the photo, e.g. Mechanic replacing brake pads on a hatchback">
              <Input id="g-alt" value={editing.draft.alt} onChange={(e) => set("alt", e.target.value)} />
            </Field>
            <Toggle label="Visible on website" checked={editing.draft.isPublished} onChange={(v) => set("isPublished", v)} />
          </div>
        )}
      </Modal>
    </>
  );
}
