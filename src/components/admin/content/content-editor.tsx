"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { Toggle } from "@/components/admin/ui-client";
import { ImageField } from "@/components/admin/image-field";
import { ListEditor } from "./list-editor";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { Icon, ICON_LABELS } from "@/components/icons";
import { ACCENTS, ICON_KEYS, type IconKey, type SettingsKey, type SiteSettings } from "@/content/settings-schema";
import { weekdayName } from "@/lib/dates";
import { apiRequest, type ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/format";

const TABS = [
  { id: "business", label: "Business & contact", section: "business" },
  { id: "hours", label: "Hours & booking", section: "business" },
  { id: "home", label: "Homepage", section: "home" },
  { id: "about", label: "About page", section: "about" },
  { id: "pricing", label: "Pricing & FAQs", section: "pricing" },
  { id: "branding", label: "Branding & SEO", section: "branding" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function IconPicker({ value, onChange, id }: { value: IconKey; onChange: (v: IconKey) => void; id: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-line bg-white">
        <Icon name={value} className="h-5 w-5" />
      </span>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value as IconKey)} aria-label="Icon">
        {ICON_KEYS.map((k) => (
          <option key={k} value={k}>
            {ICON_LABELS[k]}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function ContentEditor({ initial, initialTab }: { initial: SiteSettings; initialTab?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>((TABS.find((t) => t.id === initialTab)?.id ?? "business") as TabId);
  const [data, setData] = useState<SiteSettings>(initial);
  const [saved, setSaved] = useState<SiteSettings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const section = TABS.find((t) => t.id === tab)!.section as SettingsKey;
  const dirty = useMemo(() => JSON.stringify(data[section]) !== JSON.stringify(saved[section]), [data, saved, section]);
  const anyDirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(saved), [data, saved]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (anyDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [anyDirty]);

  const b = data.business;
  const h = data.home;
  const a = data.about;
  const p = data.pricing;
  const br = data.branding;
  const setB = (patch: Partial<SiteSettings["business"]>) => setData((d) => ({ ...d, business: { ...d.business, ...patch } }));
  const setH = (patch: Partial<SiteSettings["home"]>) => setData((d) => ({ ...d, home: { ...d.home, ...patch } }));
  const setA = (patch: Partial<SiteSettings["about"]>) => setData((d) => ({ ...d, about: { ...d.about, ...patch } }));
  const setP = (patch: Partial<SiteSettings["pricing"]>) => setData((d) => ({ ...d, pricing: { ...d.pricing, ...patch } }));
  const setBr = (patch: Partial<SiteSettings["branding"]>) => setData((d) => ({ ...d, branding: { ...d.branding, ...patch } }));

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const res = await apiRequest<{ value: SiteSettings[typeof section] }>(`/api/admin/settings/${section}`, { method: "PUT", body: data[section] });
      setSaved((s) => ({ ...s, [section]: res.value }));
      setData((d) => ({ ...d, [section]: res.value }));
      toast.success("Changes saved. They're live on the website now.");
      router.refresh();
    } catch (e) {
      const err = e as ApiClientError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const err = (key: string) => errors[key];
  const text = (key: string, label: string, value: string, onChange: (v: string) => void, opts: { required?: boolean; hint?: ReactNode; className?: string; type?: string; placeholder?: string } = {}) => (
    <Field label={label} htmlFor={`f-${key}`} required={opts.required} error={err(key)} hint={opts.hint} className={opts.className} optionalText="">
      <Input id={`f-${key}`} type={opts.type ?? "text"} value={value} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} {...describedBy(`f-${key}`, err(key), !!opts.hint)} />
    </Field>
  );
  const area = (key: string, label: string, value: string, onChange: (v: string) => void, opts: { required?: boolean; hint?: ReactNode; rows?: number; className?: string } = {}) => (
    <Field label={label} htmlFor={`f-${key}`} required={opts.required} error={err(key)} hint={opts.hint} className={opts.className} optionalText="">
      <Textarea id={`f-${key}`} rows={opts.rows ?? 3} value={value} onChange={(e) => onChange(e.target.value)} {...describedBy(`f-${key}`, err(key), !!opts.hint)} />
    </Field>
  );
  const tokensHint = (
    <>
      You can use <code>{"{name}"}</code> and <code>{"{years}"}</code>.
    </>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Settings sections" className="lg:sticky lg:top-6 lg:self-start">
        <ul className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setErrors({});
                  window.history.replaceState(null, "", `?tab=${t.id}`);
                }}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-[0.92rem] transition-colors",
                  tab === t.id ? "bg-charcoal font-semibold text-white" : "text-graphite hover:bg-white",
                )}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        noValidate
        className="min-w-0 space-y-6"
      >
        {tab === "business" && (
          <>
            <Panel title="Garage details" description="Shown in the header, footer, about page and search results.">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {text("name", "Garage name", b.name, (v) => setB({ name: v }), { required: true })}
                {text("tagline", "Tagline", b.tagline, (v) => setB({ tagline: v }), { hint: "One line, e.g. Multi-vehicle repair & service workshop" })}
                {text("ownerName", "Owner name", b.ownerName, (v) => setB({ ownerName: v }))}
                {text("ownerRole", "Owner's role", b.ownerRole, (v) => setB({ ownerRole: v }))}
                <Field label="Years of experience" htmlFor="f-yearsExperience" error={err("yearsExperience")}>
                  <Input id="f-yearsExperience" type="number" min={0} max={100} value={b.yearsExperience} onChange={(e) => setB({ yearsExperience: Number(e.target.value) })} />
                </Field>
              </div>
            </Panel>
            <Panel title="Contact" description="Used for the Call and WhatsApp buttons across the site.">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {text("phone", "Phone number", b.phone, (v) => setB({ phone: v }), { required: true, hint: "As it should appear, e.g. +91 98765 43210" })}
                {text("whatsapp", "WhatsApp number", b.whatsapp, (v) => setB({ whatsapp: v.replace(/\D/g, "") }), { required: true, hint: "Digits with country code, no spaces, e.g. 919876543210" })}
                {text("email", "Email address", b.email, (v) => setB({ email: v }), { type: "email" })}
              </div>
            </Panel>
            <Panel title="Workshop address & map">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {text("addressLine1", "Address line 1", b.addressLine1, (v) => setB({ addressLine1: v }), { required: true, className: "sm:col-span-2" })}
                {text("addressLine2", "Address line 2", b.addressLine2, (v) => setB({ addressLine2: v }), { className: "sm:col-span-2" })}
                {text("city", "City", b.city, (v) => setB({ city: v }), { required: true })}
                {text("state", "State", b.state, (v) => setB({ state: v }))}
                {text("pincode", "PIN code", b.pincode, (v) => setB({ pincode: v }))}
                {text("mapQuery", "Map search text", b.mapQuery, (v) => setB({ mapQuery: v }), { hint: "What Google Maps should search for, e.g. the garage name and area", className: "sm:col-span-2" })}
                {text("mapEmbedUrl", "Google Maps embed link", b.mapEmbedUrl, (v) => setB({ mapEmbedUrl: v.trim() }), {
                  className: "sm:col-span-2",
                  hint: "Optional. In Google Maps: Share → Embed a map → copy only the https://… link from the code.",
                })}
                {text("googleReviewUrl", "Google review link", b.googleReviewUrl, (v) => setB({ googleReviewUrl: v.trim() }), { className: "sm:col-span-2", hint: "Optional. Adds a 'Write a Google review' button on the reviews page." })}
              </div>
            </Panel>
            <Panel title="Social media" description="Optional. Leave empty to hide.">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {text("instagramUrl", "Instagram", b.instagramUrl, (v) => setB({ instagramUrl: v.trim() }), { placeholder: "https://instagram.com/…" })}
                {text("facebookUrl", "Facebook", b.facebookUrl, (v) => setB({ facebookUrl: v.trim() }), { placeholder: "https://facebook.com/…" })}
                {text("youtubeUrl", "YouTube", b.youtubeUrl, (v) => setB({ youtubeUrl: v.trim() }), { placeholder: "https://youtube.com/…" })}
              </div>
            </Panel>
          </>
        )}

        {tab === "hours" && (
          <>
            <Panel title="Opening hours" description="India Standard Time. Used for the open/closed status and for booking slots.">
              <ul className="divide-y divide-line">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                  const idx = b.hours.findIndex((x) => x.day === day);
                  const row = b.hours[idx];
                  if (!row) return null;
                  const update = (patch: Partial<typeof row>) => setB({ hours: b.hours.map((x, k) => (k === idx ? { ...x, ...patch } : x)) });
                  return (
                    <li key={day} className="flex flex-wrap items-center gap-4 py-3">
                      <span className="w-28 font-medium">{weekdayName(day)}</span>
                      <Toggle label={row.closed ? "Closed" : "Open"} checked={!row.closed} onChange={(v) => update({ closed: !v })} />
                      {!row.closed && (
                        <div className="flex items-center gap-2 text-[0.9rem]">
                          <input type="time" aria-label={`${weekdayName(day)} opening time`} value={row.open} onChange={(e) => update({ open: e.target.value })} className="h-10 rounded-md border border-line px-2" />
                          <span className="text-slate">to</span>
                          <input type="time" aria-label={`${weekdayName(day)} closing time`} value={row.close} onChange={(e) => update({ close: e.target.value })} className="h-10 rounded-md border border-line px-2" />
                        </div>
                      )}
                      {err(`hours.${idx}.close`) && <span className="text-[0.82rem] font-medium text-[#b42318]">{err(`hours.${idx}.close`)}</span>}
                    </li>
                  );
                })}
              </ul>
            </Panel>
            <Panel title="Online booking">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Time slot length" htmlFor="f-slot" error={err("slotMinutes")} hint="Customers choose a start time in these steps">
                  <Select id="f-slot" value={b.slotMinutes} onChange={(e) => setB({ slotMinutes: Number(e.target.value) })}>
                    {[30, 60, 90, 120].map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="How far ahead customers can book" htmlFor="f-window" error={err("bookingWindowDays")}>
                  <Select id="f-window" value={b.bookingWindowDays} onChange={(e) => setB({ bookingWindowDays: Number(e.target.value) })}>
                    {[7, 14, 21, 30, 45, 60, 90].map((d) => (
                      <option key={d} value={d}>
                        {d} days
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Panel>
          </>
        )}

        {tab === "home" && (
          <>
            <Panel title="Hero (top of the homepage)">
              <div className="grid gap-5">
                {text("heroTitle", "Headline", h.heroTitle, (v) => setH({ heroTitle: v }), { required: true })}
                {area("heroSubtitle", "Description", h.heroSubtitle, (v) => setH({ heroSubtitle: v }), { required: true, rows: 2 })}
                <ImageField label="Background photo" value={h.heroImage} onChange={(url) => setH({ heroImage: url })} hint="A wide, darker photo of the workshop works best. Text sits on the left." />
                {text("heroImageAlt", "Photo description", h.heroImageAlt, (v) => setH({ heroImageAlt: v }), { hint: "For screen readers and search engines" })}
              </div>
            </Panel>
            <Panel title="Highlights strip" description="The four short facts under the hero.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {h.highlights.map((item, i) => (
                  <div key={i} className="grid gap-3 rounded-md border border-line p-4">
                    {text(`highlights.${i}.title`, `Highlight ${i + 1}`, item.title, (v) => setH({ highlights: h.highlights.map((x, k) => (k === i ? { ...x, title: v } : x)) }), { hint: i === 0 ? tokensHint : undefined })}
                    {text(`highlights.${i}.text`, "Supporting text", item.text, (v) => setH({ highlights: h.highlights.map((x, k) => (k === i ? { ...x, text: v } : x)) }))}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Why choose us">
              <div className="grid gap-5">
                {text("whyTitle", "Section title", h.whyTitle, (v) => setH({ whyTitle: v }), { required: true })}
                {area("whyIntro", "Introduction", h.whyIntro, (v) => setH({ whyIntro: v }), { rows: 2 })}
                <ListEditor
                  label="Reasons"
                  items={h.whyItems}
                  onChange={(items) => setH({ whyItems: items })}
                  create={() => ({ icon: "wrench" as IconKey, title: "", text: "" })}
                  max={8}
                  min={1}
                  addLabel="Add a reason"
                  itemLabel={(item, i) => item.title || `Reason ${i + 1}`}
                  render={(item, update, i) => (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr]">
                      <IconPicker id={`why-icon-${i}`} value={item.icon} onChange={(v) => update({ ...item, icon: v })} />
                      {text(`whyItems.${i}.title`, "Title", item.title, (v) => update({ ...item, title: v }), { required: true })}
                      {area(`whyItems.${i}.text`, "Text", item.text, (v) => update({ ...item, text: v }), { rows: 2, className: "sm:col-span-2" })}
                    </div>
                  )}
                />
              </div>
            </Panel>
            <Panel title="How a service works">
              <div className="grid gap-5">
                {text("processTitle", "Section title", h.processTitle, (v) => setH({ processTitle: v }), { required: true })}
                <ListEditor
                  label="Steps"
                  items={h.processSteps}
                  onChange={(items) => setH({ processSteps: items })}
                  create={() => ({ title: "", text: "" })}
                  max={6}
                  min={2}
                  addLabel="Add a step"
                  itemLabel={(item, i) => `Step ${i + 1}`}
                  render={(item, update, i) => (
                    <div className="grid gap-3">
                      {text(`processSteps.${i}.title`, "Title", item.title, (v) => update({ ...item, title: v }), { required: true })}
                      {area(`processSteps.${i}.text`, "Text", item.text, (v) => update({ ...item, text: v }), { rows: 2 })}
                    </div>
                  )}
                />
              </div>
            </Panel>
            <Panel title="Our workshop">
              <div className="grid gap-5">
                {text("workshopTitle", "Section title", h.workshopTitle, (v) => setH({ workshopTitle: v }), { required: true })}
                {area("workshopText", "Text", h.workshopText, (v) => setH({ workshopText: v }), { rows: 3, hint: tokensHint })}
                <ListEditor
                  label="Facility points"
                  items={h.workshopPoints}
                  onChange={(items) => setH({ workshopPoints: items })}
                  create={() => ""}
                  max={6}
                  addLabel="Add a point"
                  itemLabel={(_, i) => `Point ${i + 1}`}
                  render={(item, update, i) => text(`workshopPoints.${i}`, "Text", item, update)}
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {h.workshopImages.map((img, i) => (
                    <div key={i} className="space-y-3 rounded-md border border-line p-4">
                      <ImageField
                        label={`Photo ${i + 1}${i === 0 ? " (large)" : ""}`}
                        value={img.url}
                        onChange={(url) => setH({ workshopImages: h.workshopImages.map((x, k) => (k === i ? { ...x, url } : x)) })}
                      />
                      {text(`workshopImages.${i}.alt`, "Photo description", img.alt, (v) => setH({ workshopImages: h.workshopImages.map((x, k) => (k === i ? { ...x, alt: v } : x)) }))}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel title="Booking call-to-action" description="Shown above the contact details at the bottom of the homepage.">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {text("ctaTitle", "Title", h.ctaTitle, (v) => setH({ ctaTitle: v }), { required: true })}
                {text("ctaText", "Text", h.ctaText, (v) => setH({ ctaText: v }))}
              </div>
            </Panel>
          </>
        )}

        {tab === "about" && (
          <>
            <Panel title="About page">
              <div className="grid gap-5">
                {text("title", "Page headline", a.title, (v) => setA({ title: v }), { required: true, hint: tokensHint })}
                {area("intro", "Introduction", a.intro, (v) => setA({ intro: v }), { rows: 2, hint: tokensHint })}
                {area("story", "Our story", a.story, (v) => setA({ story: v }), { rows: 10, hint: <>Leave an empty line between paragraphs. You can use <code>{"{name}"}</code> and <code>{"{years}"}</code>.</> })}
                <ImageField label="Header photo" value={a.image} onChange={(url) => setA({ image: url })} />
                {text("imageAlt", "Photo description", a.imageAlt, (v) => setA({ imageAlt: v }))}
              </div>
            </Panel>
            <Panel title="Our commitments">
              <ListEditor
                label="Commitments"
                items={a.commitments}
                onChange={(items) => setA({ commitments: items })}
                create={() => ({ icon: "shield" as IconKey, title: "", text: "" })}
                max={8}
                min={1}
                addLabel="Add a commitment"
                itemLabel={(item, i) => item.title || `Commitment ${i + 1}`}
                render={(item, update, i) => (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr]">
                    <IconPicker id={`com-icon-${i}`} value={item.icon} onChange={(v) => update({ ...item, icon: v })} />
                    {text(`commitments.${i}.title`, "Title", item.title, (v) => update({ ...item, title: v }), { required: true })}
                    {area(`commitments.${i}.text`, "Text", item.text, (v) => update({ ...item, text: v }), { rows: 2, className: "sm:col-span-2" })}
                  </div>
                )}
              />
            </Panel>
            <Panel title="Message from the owner" description="The owner's name and role are set under Business & contact.">
              <div className="grid gap-5">
                {area("ownerMessage", "Message", a.ownerMessage, (v) => setA({ ownerMessage: v }), { rows: 3, hint: tokensHint })}
                <ImageField label="Owner photo" value={a.ownerPhoto} onChange={(url) => setA({ ownerPhoto: url })} aspect="aspect-[4/5]" hint="Portrait photo. Leave empty to show initials." />
              </div>
            </Panel>
          </>
        )}

        {tab === "pricing" && (
          <>
            <Panel title="Pricing page">
              <div className="grid gap-5">
                {area("intro", "Introduction", p.intro, (v) => setP({ intro: v }), { rows: 2 })}
                {text("priceLabel", "Price label", p.priceLabel, (v) => setP({ priceLabel: v }), {
                  required: true,
                  hint: "Shown next to every price, e.g. 'Demo estimate' or 'Indicative price'",
                })}
                {area("disclaimer", "Price disclaimer", p.disclaimer, (v) => setP({ disclaimer: v }), { required: true, rows: 3 })}
              </div>
            </Panel>
            <Panel title="Frequently asked questions">
              <ListEditor
                label="Questions"
                items={p.faqs}
                onChange={(items) => setP({ faqs: items })}
                create={() => ({ q: "", a: "" })}
                max={10}
                addLabel="Add a question"
                itemLabel={(item, i) => item.q || `Question ${i + 1}`}
                render={(item, update, i) => (
                  <div className="grid gap-3">
                    {text(`faqs.${i}.q`, "Question", item.q, (v) => update({ ...item, q: v }), { required: true })}
                    {area(`faqs.${i}.a`, "Answer", item.a, (v) => update({ ...item, a: v }), { required: true, rows: 3 })}
                  </div>
                )}
              />
            </Panel>
          </>
        )}

        {tab === "branding" && (
          <>
            <Panel title="Brand colour">
              <fieldset>
                <legend className="sr-only">Accent colour</legend>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((key) => (
                    <label
                      key={key}
                      className={cn(
                        "relative flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                        br.accent === key ? "border-charcoal ring-1 ring-charcoal" : "border-line hover:border-charcoal/40",
                      )}
                    >
                      <input type="radio" name="accent" value={key} checked={br.accent === key} onChange={() => setBr({ accent: key })} className="sr-only" />
                      <span className="h-8 w-8 rounded-full" style={{ background: ACCENTS[key].base }} aria-hidden="true" />
                      <span className="font-medium">{ACCENTS[key].label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-[0.82rem] text-slate">Used for buttons and highlights. Both options meet accessibility contrast guidelines.</p>
              </fieldset>
            </Panel>
            <Panel title="Logo">
              <ImageField label="Logo image" value={br.logoUrl} onChange={(url) => setBr({ logoUrl: url })} aspect="aspect-[3/1]" hint="Optional. A PNG or SVG with a transparent background, light enough to show on black. Leave empty to use the gear-and-wrench logo with the garage name." />
            </Panel>
            <Panel title="Demo notice">
              <div className="grid gap-5">
                <Toggle label="Show the demo notice in the footer" description="Turn this off once the real details, prices and reviews are in." checked={br.showDemoNotice} onChange={(v) => setBr({ showDemoNotice: v })} />
                {text("demoNoticeText", "Notice text", br.demoNoticeText, (v) => setBr({ demoNoticeText: v }))}
              </div>
            </Panel>
            <Panel title="Search engines" description="Leave empty to use automatic titles based on the garage name and city.">
              <div className="grid gap-5">
                {text("seoTitle", "Homepage title", br.seoTitle, (v) => setBr({ seoTitle: v }), { hint: `${br.seoTitle.length}/70 characters` })}
                {area("seoDescription", "Homepage description", br.seoDescription, (v) => setBr({ seoDescription: v }), { rows: 2, hint: `${br.seoDescription.length}/170 characters` })}
              </div>
            </Panel>
          </>
        )}

        <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between gap-3 rounded-lg border border-line bg-white/95 px-4 py-3 shadow-[0_-6px_20px_-12px_rgba(0,0,0,0.25)] backdrop-blur">
          <p className="text-[0.88rem] text-slate" aria-live="polite">
            {dirty ? "You have unsaved changes in this section." : "All changes saved."}
          </p>
          <Button type="submit" loading={saving} disabled={!dirty}>
            <Save className="h-4 w-4" aria-hidden="true" /> Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
