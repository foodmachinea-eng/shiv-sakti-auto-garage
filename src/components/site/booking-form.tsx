"use client";

import { useRef, useState, type FormEvent } from "react";
import { CalendarPlus, CheckCircle2, Phone, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { ChatIcon, Icon } from "@/components/icons";
import { MAKE_SUGGESTIONS, VEHICLE_TYPES, vehicleLabel } from "@/lib/constants";
import {
  addDays,
  availableSlots,
  formatDate,
  formatTime,
  isOpenOn,
  isValidYmd,
  todayIST,
  weekdayName,
  weekdayOf,
} from "@/lib/dates";
import type { DayHours } from "@/content/settings-schema";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { cn, compactRegistration, formatINR, formatRegistration, whatsappHref } from "@/lib/format";
import { ApiClientError, apiRequest } from "@/lib/client-api";

export type BookingCatalog = {
  categories: {
    id: number;
    name: string;
    vehicleTypes: string[];
    services: { id: number; name: string; priceFrom: number | null; priceNote: string; duration: string }[];
  }[];
  packages: { id: number; name: string; vehicleClass: string; price: number | null; duration: string }[];
};

type Values = {
  customerName: string;
  mobile: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNumber: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  problemDescription: string;
  website: string;
};

type Confirmation = {
  reference: string;
  customerName: string;
  mobile: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNumber: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
};

const FIELD_ORDER: (keyof Values)[] = [
  "customerName",
  "mobile",
  "vehicleType",
  "vehicleMake",
  "vehicleModel",
  "registrationNumber",
  "service",
  "preferredDate",
  "preferredTime",
  "problemDescription",
];

function packageClassFor(vehicleType: string) {
  return VEHICLE_TYPES.find((v) => v.value === vehicleType)?.packageClass ?? "car";
}

/** .ics calendar file for the appointment (IST has no daylight saving, so UTC = IST − 5:30). */
function buildIcs(c: Confirmation, garage: { name: string; address: string }) {
  const [y, m, d] = c.preferredDate.split("-").map(Number);
  const [hh, mm] = c.preferredTime.split(":").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, hh, mm) - 330 * 60_000);
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (x) => `\\${x}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Garage Website//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${c.reference}@garage-booking`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    "DURATION:PT1H",
    `SUMMARY:${esc(`${c.serviceName} at ${garage.name}`)}`,
    `LOCATION:${esc(garage.address)}`,
    `DESCRIPTION:${esc(`Booking reference ${c.reference}\n${c.vehicleMake} ${c.vehicleModel} (${c.registrationNumber})`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function BookingForm({
  catalog,
  hours,
  slotMinutes,
  bookingWindowDays,
  priceLabel,
  garage,
  initial,
}: {
  catalog: BookingCatalog;
  hours: DayHours[];
  slotMinutes: number;
  bookingWindowDays: number;
  priceLabel: string;
  garage: { name: string; address: string; phone: string; phoneHref: string; whatsapp: string };
  initial: { vehicleType?: string; service?: string };
}) {
  const empty: Values = {
    customerName: "",
    mobile: "",
    vehicleType: initial.vehicleType ?? "",
    vehicleMake: "",
    vehicleModel: "",
    registrationNumber: "",
    service: initial.service ?? "",
    preferredDate: "",
    preferredTime: "",
    problemDescription: "",
    website: "",
  };
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const today = todayIST();
  const maxDate = addDays(today, bookingWindowDays);
  const dateChips = Array.from({ length: Math.min(14, bookingWindowDays + 1) }, (_, i) => {
    const ymd = addDays(today, i);
    const open = isOpenOn(hours, ymd);
    const slotsLeft = open ? availableSlots(hours, ymd, slotMinutes) : [];
    return { ymd, open, full: open && slotsLeft.length === 0 };
  });
  const slots = values.preferredDate && isValidYmd(values.preferredDate) ? availableSlots(hours, values.preferredDate, slotMinutes) : [];

  // Services that apply to the selected vehicle type.
  const serviceGroups = !values.vehicleType
    ? []
    : catalog.categories
        .filter((c) => c.vehicleTypes.includes(values.vehicleType))
        .map((c) => ({ label: c.name, options: c.services.map((s) => ({ value: `service:${s.id}`, label: s.name })) }));
  const packageOptions = !values.vehicleType
    ? []
    : catalog.packages.filter((p) => p.vehicleClass === packageClassFor(values.vehicleType));

  const selectedInfo = (() => {
    const [kind, id] = values.service.split(":");
    if (kind === "service") {
      for (const c of catalog.categories) {
        const s = c.services.find((x) => x.id === Number(id));
        if (s) return { price: s.priceFrom, note: s.priceNote, duration: s.duration, pkg: false };
      }
    }
    if (kind === "package") {
      const p = catalog.packages.find((x) => x.id === Number(id));
      if (p) return { price: p.price, note: "", duration: p.duration, pkg: true };
    }
    return null;
  })();

  const isServiceValidFor = (service: string, vehicleType: string) => {
    if (!service || service === "inspection") return true;
    const [kind, id] = service.split(":");
    if (kind === "service") {
      return catalog.categories.some((c) => c.vehicleTypes.includes(vehicleType) && c.services.some((s) => s.id === Number(id)));
    }
    return catalog.packages.some((p) => p.id === Number(id) && p.vehicleClass === packageClassFor(vehicleType));
  };

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const update = (key: keyof Values, value: string) => {
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === "vehicleType" && !isServiceValidFor(v.service, value)) next.service = "";
      if (key === "preferredDate" && !availableSlots(hours, value, slotMinutes).includes(v.preferredTime)) next.preferredTime = "";
      return next;
    });
    clearError(key);
  };

  /** Extra checks the schema can't do on its own: opening days, booking window and slots. */
  const scheduleErrors = (v: Values): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (v.preferredDate) {
      if (!isValidYmd(v.preferredDate) || v.preferredDate < today) errs.preferredDate = "Choose a date from today onwards";
      else if (v.preferredDate > maxDate) errs.preferredDate = `Choose a date within the next ${bookingWindowDays} days`;
      else if (!isOpenOn(hours, v.preferredDate)) {
        errs.preferredDate = `We're closed on ${weekdayName(weekdayOf(v.preferredDate))}s. Pick another date`;
      } else if (v.preferredTime && !availableSlots(hours, v.preferredDate, slotMinutes).includes(v.preferredTime)) {
        errs.preferredTime = "That slot isn't available any more. Choose another time";
      }
    }
    return errs;
  };

  const validateField = (key: keyof Values) => {
    const result = bookingSchema.safeParse(values);
    const errs = { ...(result.success ? {} : fieldErrors(result.error)), ...scheduleErrors(values) };
    if (errs[key]) setErrors((e) => ({ ...e, [key]: errs[key] }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const result = bookingSchema.safeParse(values);
    const errs = { ...(result.success ? {} : fieldErrors(result.error)), ...scheduleErrors(values) };
    if (Object.keys(errs).length) {
      setErrors(errs);
      const first = FIELD_ORDER.find((k) => errs[k]);
      if (first) document.getElementById(`booking-${first}`)?.focus();
      setFormError("Please fix the highlighted fields.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await apiRequest<{ ok: true; booking: Confirmation | null }>("/api/bookings", {
        body: { ...values, registrationNumber: formatRegistration(values.registrationNumber) },
      });
      setConfirmation(
        res.booking ?? {
          reference: "—",
          customerName: values.customerName,
          mobile: values.mobile,
          vehicleType: values.vehicleType,
          vehicleMake: values.vehicleMake,
          vehicleModel: values.vehicleModel,
          registrationNumber: values.registrationNumber,
          serviceName: "",
          preferredDate: values.preferredDate,
          preferredTime: values.preferredTime,
        },
      );
      setStatus("idle");
      requestAnimationFrame(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) {
      const err = error as ApiClientError;
      if (Object.keys(err.fields ?? {}).length) {
        setErrors(err.fields);
        const first = FIELD_ORDER.find((k) => err.fields[k]);
        if (first) document.getElementById(`booking-${first}`)?.focus();
      }
      setFormError(err.message);
      setStatus("error");
    }
  }

  const bookingText = (c?: Confirmation | null) => {
    const v = c ?? {
      reference: "",
      customerName: values.customerName,
      vehicleMake: values.vehicleMake,
      vehicleModel: values.vehicleModel,
      registrationNumber: values.registrationNumber,
      vehicleType: values.vehicleType,
      serviceName: "",
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      mobile: values.mobile,
    };
    return [
      `Hi ${garage.name}, ${c ? "I've just booked a service" : "I'd like to book a service"}.`,
      c?.reference ? `Booking reference: ${c.reference}` : "",
      `Name: ${v.customerName}`,
      `Vehicle: ${vehicleLabel(v.vehicleType)} - ${v.vehicleMake} ${v.vehicleModel} (${formatRegistration(v.registrationNumber)})`,
      v.serviceName ? `Service: ${v.serviceName}` : "",
      v.preferredDate ? `Preferred slot: ${formatDate(v.preferredDate)}${v.preferredTime ? `, ${formatTime(v.preferredTime)}` : ""}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  /* ---------------------------------------------------------------- */
  /* Confirmation                                                      */
  /* ---------------------------------------------------------------- */
  if (confirmation) {
    const c = confirmation;
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(c, garage))}`;
    return (
      <div ref={cardRef} className="scroll-mt-28">
        <div className="perforated relative rounded-b-[4px] bg-white px-6 pb-8 pt-9 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ring-1 ring-line sm:px-10" role="status">
          <div
            className="pointer-events-none absolute right-5 top-7 animate-stamp rounded-[6px] border-[3px] border-accent px-3 py-1 font-display text-[1.6rem] font-extrabold tracking-[0.12em] text-accent opacity-90 sm:right-10 sm:top-9 sm:text-[2rem]"
            style={{ fontStretch: "80%" }}
            aria-hidden="true"
          >
            BOOKED
          </div>
          <p className="text-[0.85rem] text-slate">Job card</p>
          <p className="numerals mt-0.5 text-[1.5rem] font-bold tracking-wide sm:text-[1.9rem]">{c.reference}</p>
          <h2 className="display-3 mt-6 flex items-center gap-2.5 pr-28 sm:pr-0">
            <CheckCircle2 className="h-7 w-7 shrink-0 text-[#16833f]" aria-hidden="true" />
            Thanks, {c.customerName.split(" ")[0]}. Your booking request is in.
          </h2>
          <p className="mt-2 max-w-xl text-slate">
            We&apos;ll call you on <span className="font-semibold text-charcoal">{c.mobile}</span> to confirm the slot. Keep your
            job number handy.
          </p>

          <dl className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-[3px] bg-line ring-1 ring-line sm:grid-cols-2">
            {[
              ["Vehicle", `${vehicleLabel(c.vehicleType)}: ${c.vehicleMake} ${c.vehicleModel}`],
              ["Service", c.serviceName],
              ["Date", formatDate(c.preferredDate)],
              ["Time", formatTime(c.preferredTime)],
            ].map(([label, value]) => (
              <div key={label} className="bg-paper p-4">
                <dt className="text-[0.8rem] text-slate">{label}</dt>
                <dd className="mt-0.5 font-medium">{value}</dd>
              </div>
            ))}
            <div className="bg-paper p-4 sm:col-span-2">
              <dt className="text-[0.8rem] text-slate">Registration</dt>
              <dd className="mt-1.5">
                <span className="plate inline-flex">
                  <span className="plate-ind">IND</span>
                  <span className="plate-text px-3 py-1.5 text-[1.2rem]">{formatRegistration(c.registrationNumber)}</span>
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={whatsappHref(garage.whatsapp, bookingText(c))} variant="whatsapp">
              <ChatIcon className="h-4 w-4" aria-hidden="true" />
              Send details on WhatsApp
            </ButtonLink>
            <a
              href={icsHref}
              download={`${c.reference}.ics`}
              className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-charcoal/30 px-5 font-display font-semibold text-charcoal hover:border-charcoal"
              style={{ fontStretch: "88%" }}
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Add to calendar
            </a>
            <Button
              variant="ghost-dark"
              onClick={() => {
                setConfirmation(null);
                setValues({ ...empty, vehicleType: "", service: "" });
                setErrors({});
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Book another vehicle
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Form                                                              */
  /* ---------------------------------------------------------------- */
  const makes = MAKE_SUGGESTIONS[packageClassFor(values.vehicleType || "car")];

  return (
    <div ref={cardRef} className="scroll-mt-28">
      <form
        onSubmit={onSubmit}
        noValidate
        className="perforated rounded-b-[4px] bg-white px-5 pb-8 pt-9 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ring-1 ring-line sm:px-10"
        aria-labelledby="job-card-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-charcoal pb-4">
          <div>
            <p className="text-[0.85rem] text-slate">Job card</p>
            <h2 id="job-card-title" className="display-3 text-[1.7rem]">
              Service booking
            </h2>
          </div>
          <p className="text-right text-[0.85rem] text-slate">
            Job no. issued when you book
            <span className="block numerals text-[1rem] font-semibold text-charcoal">{formatDate(today)}</span>
          </p>
        </div>

        {/* Customer */}
        <fieldset className="mt-7">
          <legend className="title-sm mb-4">Your details</legend>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="booking-customerName" required error={errors.customerName}>
              <Input
                id="booking-customerName"
                autoComplete="name"
                value={values.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                onBlur={() => validateField("customerName")}
                {...describedBy("booking-customerName", errors.customerName)}
              />
            </Field>
            <Field label="Mobile number" htmlFor="booking-mobile" required error={errors.mobile} hint="We'll call this number to confirm">
              <div className="flex">
                <span className="inline-flex h-11 items-center rounded-l-[3px] border border-r-0 border-line bg-paper px-3 text-[0.95rem] text-slate">
                  +91
                </span>
                <Input
                  id="booking-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  className="rounded-l-none"
                  value={values.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  onBlur={() => validateField("mobile")}
                  {...describedBy("booking-mobile", errors.mobile, true)}
                />
              </div>
            </Field>
          </div>
        </fieldset>

        {/* Vehicle */}
        <div className="mt-9 border-t border-line pt-7">
        <fieldset>
          <legend className="title-sm mb-4">Vehicle</legend>
          <div>
            <div role="radiogroup" aria-labelledby="vehicle-type-label" aria-describedby={errors.vehicleType ? "booking-vehicleType-error" : undefined}>
              <p id="vehicle-type-label" className="mb-2 text-[0.9rem] font-medium">
                Vehicle type <span className="text-accent-strong" aria-hidden="true">*</span>
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {VEHICLE_TYPES.map((v, i) => {
                  const checked = values.vehicleType === v.value;
                  return (
                    <label
                      key={v.value}
                      className={cn(
                        "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-[3px] border px-2 py-3 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                        checked ? "border-charcoal bg-charcoal text-white" : "border-line bg-white hover:border-charcoal/50",
                        errors.vehicleType && !checked && "border-[#e3a1a1]",
                      )}
                    >
                      <input
                        id={i === 0 ? "booking-vehicleType" : undefined}
                        type="radio"
                        name="vehicleType"
                        value={v.value}
                        checked={checked}
                        onChange={() => update("vehicleType", v.value)}
                        className="sr-only"
                      />
                      <Icon name={v.icon} className="h-6 w-6" strokeWidth={1.8} />
                      <span className="text-[0.86rem] font-medium leading-tight">
                        {v.value === "other" ? "Other / commercial" : v.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.vehicleType && (
                <p id="booking-vehicleType-error" className="mt-1.5 text-[0.84rem] font-medium text-[#b42318]" role="alert">
                  {errors.vehicleType}
                </p>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Vehicle company" htmlFor="booking-vehicleMake" required error={errors.vehicleMake}>
                <Input
                  id="booking-vehicleMake"
                  list="make-suggestions"
                  placeholder={values.vehicleType === "car" || !values.vehicleType ? "e.g. Maruti Suzuki" : "e.g. Honda"}
                  value={values.vehicleMake}
                  onChange={(e) => update("vehicleMake", e.target.value)}
                  onBlur={() => validateField("vehicleMake")}
                  {...describedBy("booking-vehicleMake", errors.vehicleMake)}
                />
                <datalist id="make-suggestions">
                  {makes.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Field>
              <Field label="Model" htmlFor="booking-vehicleModel" required error={errors.vehicleModel}>
                <Input
                  id="booking-vehicleModel"
                  placeholder={values.vehicleType === "car" || !values.vehicleType ? "e.g. Swift" : "e.g. Activa 6G"}
                  value={values.vehicleModel}
                  onChange={(e) => update("vehicleModel", e.target.value)}
                  onBlur={() => validateField("vehicleModel")}
                  {...describedBy("booking-vehicleModel", errors.vehicleModel)}
                />
              </Field>
            </div>

            <Field
              label="Registration number"
              htmlFor="booking-registrationNumber"
              required
              error={errors.registrationNumber}
              hint="As shown on the number plate, e.g. MH 12 AB 1234"
              className="mt-5 max-w-sm"
            >
              <div className={cn("plate h-14 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-accent", errors.registrationNumber && "border-[#b42318]")}>
                <span className="plate-ind" aria-hidden="true">
                  IND
                </span>
                <input
                  id="booking-registrationNumber"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={16}
                  placeholder="MH 12 AB 1234"
                  value={values.registrationNumber}
                  onChange={(e) => update("registrationNumber", e.target.value.toUpperCase())}
                  onBlur={() => {
                    if (compactRegistration(values.registrationNumber)) {
                      setValues((v) => ({ ...v, registrationNumber: formatRegistration(v.registrationNumber) }));
                    }
                    validateField("registrationNumber");
                  }}
                  className="plate-text w-full min-w-0 bg-transparent px-3 text-[1.45rem] placeholder:text-black/20 focus:outline-none"
                  {...describedBy("booking-registrationNumber", errors.registrationNumber, true)}
                />
              </div>
            </Field>
          </div>
        </fieldset>
        </div>

        {/* Work */}
        <div className="mt-9 border-t border-line pt-7">
        <fieldset>
          <legend className="title-sm mb-4">Work required</legend>
          <Field
            label="Service needed"
            htmlFor="booking-service"
            required
            error={errors.service}
            hint={!values.vehicleType ? "Choose your vehicle type first to see matching services" : undefined}
          >
            <Select
              id="booking-service"
              value={values.service}
              onChange={(e) => update("service", e.target.value)}
              onBlur={() => validateField("service")}
              {...describedBy("booking-service", errors.service, !values.vehicleType)}
            >
              <option value="">{values.vehicleType ? "Select a service" : "Select vehicle type first"}</option>
              <option value="inspection">Not sure: inspection & fault diagnosis</option>
              {serviceGroups.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              {packageOptions.length > 0 && (
                <optgroup label="Service packages">
                  {packageOptions.map((p) => (
                    <option key={p.id} value={`package:${p.id}`}>
                      {p.name}
                      {p.price != null ? ` (${formatINR(p.price)})` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
          </Field>
          {selectedInfo && (
            <p className="mt-2 rounded-[3px] bg-paper px-3 py-2 text-[0.88rem] text-slate animate-fade-in">
              {selectedInfo.price != null ? (
                <>
                  {selectedInfo.pkg ? "Package price" : "Starts from"}{" "}
                  <span className="numerals font-semibold text-charcoal">{formatINR(selectedInfo.price)}</span>
                  {selectedInfo.note ? ` ${selectedInfo.note}` : ""} ({priceLabel.toLowerCase()})
                </>
              ) : (
                <>{selectedInfo.note || "Price after inspection"}</>
              )}
              {selectedInfo.duration ? `. Usually takes ${selectedInfo.duration}.` : "."}
            </p>
          )}

          <Field
            label="Describe the problem"
            htmlFor="booking-problemDescription"
            error={errors.problemDescription}
            hint={`${values.problemDescription.length}/1000. Noises, warning lights, when it happens…`}
            className="mt-5"
          >
            <Textarea
              id="booking-problemDescription"
              rows={4}
              maxLength={1000}
              placeholder="e.g. Brakes squeal when stopping, AC not cooling since last week"
              value={values.problemDescription}
              onChange={(e) => update("problemDescription", e.target.value)}
              {...describedBy("booking-problemDescription", errors.problemDescription, true)}
            />
          </Field>
        </fieldset>
        </div>

        {/* Appointment */}
        <div className="mt-9 border-t border-line pt-7">
        <fieldset>
          <legend className="title-sm mb-4">Preferred date & time</legend>
          <div role="radiogroup" aria-labelledby="date-label">
            <p id="date-label" className="mb-2 text-[0.9rem] font-medium">
              Date <span className="text-accent-strong" aria-hidden="true">*</span>
            </p>
            <div className="scrollbar-none relative -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-0 sm:flex-wrap sm:px-0">
              {dateChips.map((chip, i) => {
                const checked = values.preferredDate === chip.ymd;
                const disabled = !chip.open || chip.full;
                const d = new Date(`${chip.ymd}T00:00:00Z`);
                return (
                  <label
                    key={chip.ymd}
                    className={cn(
                      "relative flex w-[4.4rem] shrink-0 flex-col items-center rounded-[3px] border py-2 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                      disabled
                        ? "cursor-not-allowed border-dashed border-line bg-paper text-slate/60"
                        : checked
                          ? "cursor-pointer border-charcoal bg-charcoal text-white"
                          : "cursor-pointer border-line bg-white hover:border-charcoal/50",
                    )}
                  >
                    <input
                      id={i === 0 ? "booking-preferredDate" : undefined}
                      type="radio"
                      name="preferredDate"
                      value={chip.ymd}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => update("preferredDate", chip.ymd)}
                      className="sr-only"
                      aria-label={`${formatDate(chip.ymd)}${!chip.open ? " (closed)" : chip.full ? " (fully booked)" : ""}`}
                    />
                    <span className="text-[0.75rem] font-medium">{i === 0 ? "Today" : i === 1 ? "Tmrw" : weekdayName(d.getUTCDay(), true)}</span>
                    <span className="numerals text-[1.35rem] font-bold leading-tight">{d.getUTCDate()}</span>
                    <span className="text-[0.72rem]">{!chip.open ? "Closed" : chip.full ? "Full" : formatDate(chip.ymd, { weekday: false, year: false }).split(" ")[1]}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.88rem]">
              <label htmlFor="booking-otherDate" className="text-slate">
                Or pick a later date:
              </label>
              <input
                id="booking-otherDate"
                type="date"
                min={today}
                max={maxDate}
                value={values.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
                onBlur={() => validateField("preferredDate")}
                className="h-10 rounded-[3px] border border-line px-2.5 text-charcoal"
              />
            </div>
            {errors.preferredDate && (
              <p id="booking-preferredDate-error" className="mt-1.5 text-[0.84rem] font-medium text-[#b42318]" role="alert">
                {errors.preferredDate}
              </p>
            )}
          </div>

          <div role="radiogroup" aria-labelledby="time-label" className="mt-6">
            <p id="time-label" className="mb-2 text-[0.9rem] font-medium">
              Time slot <span className="text-accent-strong" aria-hidden="true">*</span>
            </p>
            {!values.preferredDate ? (
              <p className="rounded-[3px] bg-paper px-3 py-2.5 text-[0.9rem] text-slate">Choose a date to see available times.</p>
            ) : slots.length === 0 ? (
              <p className="rounded-[3px] bg-paper px-3 py-2.5 text-[0.9rem] text-slate">
                {isOpenOn(hours, values.preferredDate) ? "No slots left on this day. Please choose another date." : "We're closed on this day. Please choose another date."}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((slot, i) => {
                  const checked = values.preferredTime === slot;
                  return (
                    <label
                      key={slot}
                      className={cn(
                        "relative cursor-pointer rounded-[3px] border py-2.5 text-center font-medium transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                        checked ? "border-charcoal bg-charcoal text-white" : "border-line bg-white hover:border-charcoal/50",
                      )}
                    >
                      <input
                        id={i === 0 ? "booking-preferredTime" : undefined}
                        type="radio"
                        name="preferredTime"
                        value={slot}
                        checked={checked}
                        onChange={() => update("preferredTime", slot)}
                        className="sr-only"
                      />
                      <span className="numerals text-[1rem]">{formatTime(slot)}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.preferredTime && (
              <p id="booking-preferredTime-error" className="mt-1.5 text-[0.84rem] font-medium text-[#b42318]" role="alert">
                {errors.preferredTime}
              </p>
            )}
          </div>
        </fieldset>
        </div>

        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="booking-website">Website</label>
          <input id="booking-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} />
        </div>

        {status === "error" && formError && (
          <div className="mt-8 rounded-[3px] border border-[#f5bcbc] bg-[#fdecec] p-4 text-[0.92rem] text-[#7a1313]" role="alert">
            <p className="font-semibold">{formError}</p>
            {Object.keys(errors).length === 0 && (
              <>
                <p className="mt-1">You can also send your booking straight to us:</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ButtonLink href={whatsappHref(garage.whatsapp, bookingText())} size="sm" variant="whatsapp">
                    <ChatIcon className="h-4 w-4" aria-hidden="true" /> Send on WhatsApp
                  </ButtonLink>
                  <ButtonLink href={garage.phoneHref} size="sm" variant="outline-dark">
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call {garage.phone}
                  </ButtonLink>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 border-t-2 border-charcoal pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-[0.82rem] text-slate">
            We&apos;ll only use your details to confirm and carry out this booking.
          </p>
          <Button type="submit" size="lg" loading={status === "submitting"} className="w-full sm:w-auto">
            {status === "submitting" ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
