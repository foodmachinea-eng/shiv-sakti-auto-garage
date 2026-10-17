"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal, Toggle, useConfirm } from "@/components/admin/ui-client";
import { ImageField } from "@/components/admin/image-field";
import { IconSelect } from "@/components/admin/icon-select";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { Icon } from "@/components/icons";
import { apiRequest, type ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/format";

export type ServiceView = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  icon: string;
  priceFrom: number | null;
  priceNote: string;
  duration: string;
  isFeatured: boolean;
  isActive: boolean;
  bookings: number;
};
export type CategoryView = {
  id: number;
  name: string;
  shortName: string;
  description: string;
  imageUrl: string;
  services: ServiceView[];
};

type ServiceDraft = Omit<ServiceView, "id" | "bookings" | "priceFrom"> & { priceFrom: string };

const emptyDraft = (categoryId: number): ServiceDraft => ({
  categoryId,
  name: "",
  description: "",
  icon: "wrench",
  priceFrom: "",
  priceNote: "",
  duration: "",
  isFeatured: false,
  isActive: true,
});

function PriceCell({ service }: { service: ServiceView }) {
  const router = useRouter();
  const initial = service.priceFrom == null ? "" : String(service.priceFrom);
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    const cleaned = value.replace(/[₹,\s]/g, "");
    if (cleaned === initial) return;
    if (cleaned !== "" && !/^\d+$/.test(cleaned)) {
      setState("error");
      toast.error("Enter the price as a whole number of rupees, or leave it empty.");
      return;
    }
    setState("saving");
    try {
      await apiRequest(`/api/admin/services/${service.id}`, { method: "PATCH", body: { priceFrom: cleaned === "" ? null : Number(cleaned) } });
      setState("saved");
      toast.success(`Price updated for ${service.name}`);
      router.refresh();
      window.setTimeout(() => setState("idle"), 1500);
    } catch (e) {
      setState("error");
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("flex h-9 items-center rounded-md border bg-white pl-2 focus-within:border-charcoal", state === "error" ? "border-[#b42318]" : "border-line")}>
        <span className="text-[0.85rem] text-slate">₹</span>
        <input
          aria-label={`Starting price for ${service.name}`}
          inputMode="numeric"
          value={value}
          placeholder="On inspection"
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="h-full w-[6.5rem] bg-transparent px-1.5 text-[0.9rem] tabular-nums focus:outline-none"
        />
      </div>
      <span className="w-12 text-[0.75rem] text-slate" aria-live="polite">
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : ""}
      </span>
    </div>
  );
}

export function ServicesManager({ categories }: { categories: CategoryView[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ id: number | null; draft: ServiceDraft } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [catEditing, setCatEditing] = useState<CategoryView | null>(null);

  async function patchService(id: number, body: Record<string, unknown>, message: string) {
    try {
      await apiRequest(`/api/admin/services/${id}`, { method: "PATCH", body });
      toast.success(message);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function move(cat: CategoryView, index: number, delta: number) {
    const ids = cat.services.map((s) => s.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await apiRequest("/api/admin/services/reorder", { body: { ids } });
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function saveService() {
    if (!editing) return;
    setSaving(true);
    setErrors({});
    const { draft, id } = editing;
    const body = { ...draft, priceFrom: draft.priceFrom.trim() === "" ? null : draft.priceFrom };
    try {
      if (id) await apiRequest(`/api/admin/services/${id}`, { method: "PATCH", body });
      else await apiRequest("/api/admin/services", { body });
      toast.success(id ? "Service updated" : "Service added");
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

  async function saveCategory() {
    if (!catEditing) return;
    setSaving(true);
    try {
      await apiRequest(`/api/admin/categories/${catEditing.id}`, {
        method: "PATCH",
        body: { name: catEditing.name, shortName: catEditing.shortName, description: catEditing.description, imageUrl: catEditing.imageUrl },
      });
      toast.success("Category updated");
      setCatEditing(null);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e));

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <section key={cat.id} className="overflow-hidden rounded-lg bg-white ring-1 ring-line" aria-labelledby={`cat-${cat.id}`}>
          <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
            <SmartImage src={cat.imageUrl} alt="" sizes="120px" maxWidth={480} className="h-16 w-24 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <h2 id={`cat-${cat.id}`} className="text-[1.1rem] font-semibold">
                {cat.name}
              </h2>
              <p className="line-clamp-2 text-[0.88rem] text-slate">{cat.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm" onClick={() => setCatEditing({ ...cat })}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit category
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setErrors({});
                  setEditing({ id: null, draft: emptyDraft(cat.id) });
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Add service
              </Button>
            </div>
          </div>

          {cat.services.length === 0 ? (
            <p className="px-5 py-8 text-center text-[0.92rem] text-slate">No services in this category yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[0.9rem]">
                <thead className="border-b border-line bg-paper text-[0.78rem] text-slate">
                  <tr>
                    <th scope="col" className="w-20 px-4 py-2.5 font-medium">Order</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Service</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Starting price</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">On homepage</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Visible</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {cat.services.map((s, i) => (
                    <tr key={s.id} className={cn(!s.isActive && "bg-paper/70")}>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => move(cat, i, -1)} disabled={i === 0} className="rounded p-1 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move ${s.name} up`}>
                            <ArrowUp className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => move(cat, i, 1)} disabled={i === cat.services.length - 1} className="rounded p-1 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move ${s.name} down`}>
                            <ArrowDown className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2.5">
                          <Icon name={s.icon} className="mt-0.5 h-5 w-5 shrink-0 text-slate" />
                          <div>
                            <p className={cn("font-medium", !s.isActive && "text-slate")}>{s.name}</p>
                            <p className="text-[0.8rem] text-slate">
                              {[s.duration, s.priceNote, s.bookings ? `${s.bookings} booking${s.bookings === 1 ? "" : "s"}` : ""].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <PriceCell key={`${s.id}-${s.priceFrom}`} service={s} />
                      </td>
                      <td className="px-3 py-3">
                        <Toggle hideLabel label={`Show ${s.name} on the homepage`} checked={s.isFeatured} onChange={(v) => patchService(s.id, { isFeatured: v }, v ? "Shown on the homepage" : "Removed from the homepage")} />
                      </td>
                      <td className="px-3 py-3">
                        <Toggle hideLabel label={`${s.name} visible on the website`} checked={s.isActive} onChange={(v) => patchService(s.id, { isActive: v }, v ? "Service visible" : "Service hidden")} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setErrors({});
                              setEditing({
                                id: s.id,
                                draft: {
                                  categoryId: s.categoryId,
                                  name: s.name,
                                  description: s.description,
                                  icon: s.icon,
                                  priceFrom: s.priceFrom == null ? "" : String(s.priceFrom),
                                  priceNote: s.priceNote,
                                  duration: s.duration,
                                  isFeatured: s.isFeatured,
                                  isActive: s.isActive,
                                },
                              });
                            }}
                            className="rounded-md p-2 text-slate hover:bg-paper hover:text-charcoal"
                            aria-label={`Edit ${s.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await confirm({
                                title: `Delete "${s.name}"?`,
                                message: s.bookings
                                  ? `It will be removed from the website. The ${s.bookings} existing booking${s.bookings === 1 ? "" : "s"} keep the service name. To hide it temporarily, turn off "Visible" instead.`
                                  : 'It will be removed from the website. To hide it temporarily, turn off "Visible" instead.',
                                confirmLabel: "Delete service",
                                danger: true,
                              });
                              if (!ok) return;
                              try {
                                await apiRequest(`/api/admin/services/${s.id}`, { method: "DELETE" });
                                toast.success("Service deleted");
                                router.refresh();
                              } catch (e) {
                                toast.error((e as Error).message);
                              }
                            }}
                            className="rounded-md p-2 text-slate hover:bg-[#fdecec] hover:text-[#b42318]"
                            aria-label={`Delete ${s.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit service" : "Add a service"}
        description="Only list services the garage actually offers."
        size="lg"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={saveService}>
              {editing?.id ? "Save changes" : "Add service"}
            </Button>
          </>
        }
      >
        {editing && (
          <form
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveService();
            }}
          >
            <Field label="Service name" htmlFor="svc-name" required error={errors.name} className="sm:col-span-2">
              <Input id="svc-name" data-autofocus value={editing.draft.name} onChange={(e) => set("name", e.target.value)} {...describedBy("svc-name", errors.name)} />
            </Field>
            <Field label="Category" htmlFor="svc-cat" required error={errors.categoryId}>
              <Select id="svc-cat" value={editing.draft.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Typical duration" htmlFor="svc-duration" error={errors.duration} hint="e.g. 2–3 hrs">
              <Input id="svc-duration" value={editing.draft.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
            <Field label="Description" htmlFor="svc-desc" error={errors.description} className="sm:col-span-2">
              <Textarea id="svc-desc" rows={3} maxLength={400} value={editing.draft.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Starting price (₹)" htmlFor="svc-price" error={errors.priceFrom} hint="Leave empty to show 'Price after inspection'">
              <Input id="svc-price" inputMode="numeric" value={editing.draft.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} {...describedBy("svc-price", errors.priceFrom, true)} />
            </Field>
            <Field label="Price note" htmlFor="svc-note" error={errors.priceNote} hint="e.g. + parts, Free health check">
              <Input id="svc-note" value={editing.draft.priceNote} onChange={(e) => set("priceNote", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <IconSelect value={editing.draft.icon} onChange={(v) => set("icon", v)} />
            </div>
            <Toggle label="Show on the homepage" description="Featured services are listed on the homepage category panels." checked={editing.draft.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <Toggle label="Visible on the website" description="Hidden services can't be booked." checked={editing.draft.isActive} onChange={(v) => set("isActive", v)} />
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <Modal
        open={!!catEditing}
        onClose={() => setCatEditing(null)}
        title="Edit category"
        size="lg"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setCatEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={saveCategory}>
              Save category
            </Button>
          </>
        }
      >
        {catEditing && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Category name" htmlFor="cat-name" required>
              <Input id="cat-name" data-autofocus value={catEditing.name} onChange={(e) => setCatEditing({ ...catEditing, name: e.target.value })} />
            </Field>
            <Field label="Short name" htmlFor="cat-short" hint="Used in the services menu, e.g. Cars">
              <Input id="cat-short" value={catEditing.shortName} onChange={(e) => setCatEditing({ ...catEditing, shortName: e.target.value })} />
            </Field>
            <Field label="Description" htmlFor="cat-desc" className="sm:col-span-2">
              <Textarea id="cat-desc" rows={3} value={catEditing.description} onChange={(e) => setCatEditing({ ...catEditing, description: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <ImageField label="Category photo" value={catEditing.imageUrl} onChange={(url) => setCatEditing({ ...catEditing, imageUrl: url })} allowEmpty={false} hint="Landscape photos work best." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
