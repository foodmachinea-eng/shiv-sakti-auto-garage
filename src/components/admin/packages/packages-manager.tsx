"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal, Toggle, useConfirm } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { PACKAGE_CLASSES } from "@/lib/constants";
import { apiRequest, type ApiClientError } from "@/lib/client-api";
import { cn, formatINR } from "@/lib/format";

export type PackageAdminView = {
  id: number;
  name: string;
  vehicleClass: string;
  tagline: string;
  price: number | null;
  duration: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
};

type Draft = Omit<PackageAdminView, "id" | "price" | "features"> & { price: string; features: string };

export function PackagesManager({ packages, priceLabel }: { packages: PackageAdminView[]; priceLabel: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const open = (pkg?: PackageAdminView, vehicleClass = "car") => {
    setErrors({});
    setEditing({
      id: pkg?.id ?? null,
      draft: pkg
        ? { ...pkg, price: pkg.price == null ? "" : String(pkg.price), features: pkg.features.join("\n") }
        : { name: "", vehicleClass, tagline: "", price: "", duration: "", features: "", isPopular: false, isActive: true },
    });
  };

  async function patch(id: number, body: Record<string, unknown>, message: string) {
    try {
      await apiRequest(`/api/admin/packages/${id}`, { method: "PATCH", body });
      toast.success(message);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setErrors({});
    const d = editing.draft;
    const body = {
      ...d,
      price: d.price.trim() === "" ? null : d.price,
      features: d.features.split("\n").map((f) => f.trim()).filter(Boolean),
    };
    try {
      if (editing.id) await apiRequest(`/api/admin/packages/${editing.id}`, { method: "PATCH", body });
      else await apiRequest("/api/admin/packages", { body });
      toast.success(editing.id ? "Package updated" : "Package added");
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

  async function move(group: PackageAdminView[], index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= group.length) return;
    const ordered = [...packages];
    const a = ordered.findIndex((p) => p.id === group[index].id);
    const b = ordered.findIndex((p) => p.id === group[target].id);
    [ordered[a], ordered[b]] = [ordered[b], ordered[a]];
    try {
      await apiRequest("/api/admin/packages/reorder", { body: { ids: ordered.map((p) => p.id) } });
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e));

  return (
    <div className="space-y-8">
      {PACKAGE_CLASSES.map((cls) => {
        const group = packages.filter((p) => p.vehicleClass === cls.value);
        return (
          <section key={cls.value} aria-labelledby={`pk-${cls.value}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id={`pk-${cls.value}`} className="text-[1.1rem] font-semibold">
                {cls.label} <span className="text-[0.9rem] font-normal text-slate">({group.length})</span>
              </h2>
              <Button size="sm" variant="subtle" onClick={() => open(undefined, cls.value)}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add package
              </Button>
            </div>
            {group.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line bg-white px-5 py-6 text-[0.9rem] text-slate">
                No packages for {cls.label.toLowerCase()}. They won&apos;t appear on the pricing page until you add one.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {group.map((p, i) => (
                  <li key={p.id} className={cn("flex flex-col rounded-lg bg-white p-4 ring-1 ring-line", !p.isActive && "opacity-70")}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-[0.82rem] text-slate">{p.tagline}</p>
                      </div>
                      <div className="flex shrink-0">
                        <button type="button" onClick={() => move(group, i, -1)} disabled={i === 0} className="rounded p-1 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move ${p.name} earlier`}>
                          <ArrowUp className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => move(group, i, 1)} disabled={i === group.length - 1} className="rounded p-1 text-slate hover:bg-paper disabled:opacity-30" aria-label={`Move ${p.name} later`}>
                          <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-[1.5rem] font-semibold">{p.price != null ? formatINR(p.price) : "On inspection"}</p>
                    <p className="text-[0.78rem] text-slate">
                      {priceLabel}
                      {p.duration ? `, ${p.duration}` : ""}
                    </p>
                    <p className="mt-2 text-[0.85rem] text-slate">{p.features.length} items included</p>
                    <div className="mt-4 space-y-2.5 border-t border-line pt-3">
                      <Toggle label="Most booked badge" checked={p.isPopular} onChange={(v) => patch(p.id, { isPopular: v }, v ? "Marked as most booked" : "Badge removed")} />
                      <Toggle label="Visible on website" checked={p.isActive} onChange={(v) => patch(p.id, { isActive: v }, v ? "Package visible" : "Package hidden")} />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="subtle" className="flex-1" onClick={() => open(p)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="subtle"
                        aria-label={`Delete ${p.name}`}
                        onClick={async () => {
                          const ok = await confirm({ title: `Delete "${p.name}"?`, message: "The package will be removed from the pricing page. Existing bookings keep its name.", confirmLabel: "Delete package", danger: true });
                          if (!ok) return;
                          try {
                            await apiRequest(`/api/admin/packages/${p.id}`, { method: "DELETE" });
                            toast.success("Package deleted");
                            router.refresh();
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit package" : "Add a package"}
        size="lg"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              {editing?.id ? "Save changes" : "Add package"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Package name" htmlFor="pk-name" required error={errors.name}>
              <Input id="pk-name" data-autofocus value={editing.draft.name} onChange={(e) => set("name", e.target.value)} {...describedBy("pk-name", errors.name)} />
            </Field>
            <Field label="For" htmlFor="pk-class" required error={errors.vehicleClass}>
              <Select id="pk-class" value={editing.draft.vehicleClass} onChange={(e) => set("vehicleClass", e.target.value)}>
                {PACKAGE_CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Short tagline" htmlFor="pk-tag" error={errors.tagline} className="sm:col-span-2" hint="e.g. Recommended every 10,000 km">
              <Input id="pk-tag" value={editing.draft.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
            <Field label="Price (₹)" htmlFor="pk-price" error={errors.price} hint="Leave empty to show 'Price on inspection'">
              <Input id="pk-price" inputMode="numeric" value={editing.draft.price} onChange={(e) => set("price", e.target.value)} {...describedBy("pk-price", errors.price, true)} />
            </Field>
            <Field label="Duration" htmlFor="pk-dur" error={errors.duration} hint="e.g. 3–4 hrs">
              <Input id="pk-dur" value={editing.draft.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
            <Field label="What's included" htmlFor="pk-features" error={errors.features} className="sm:col-span-2" hint="One item per line">
              <Textarea id="pk-features" rows={8} value={editing.draft.features} onChange={(e) => set("features", e.target.value)} />
            </Field>
            <Toggle label="Most booked badge" checked={editing.draft.isPopular} onChange={(v) => set("isPopular", v)} />
            <Toggle label="Visible on website" checked={editing.draft.isActive} onChange={(v) => set("isActive", v)} />
          </div>
        )}
      </Modal>
    </div>
  );
}
