"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Phone, Send } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { ChatIcon } from "@/components/icons";
import { ENQUIRY_SUBJECTS, VEHICLE_TYPES } from "@/lib/constants";
import { enquirySchema, fieldErrors } from "@/lib/validation";
import { ApiClientError, apiRequest } from "@/lib/client-api";

type Values = {
  name: string;
  mobile: string;
  email: string;
  vehicleType: string;
  subject: string;
  message: string;
  website: string;
};

const EMPTY: Values = { name: "", mobile: "", email: "", vehicleType: "", subject: ENQUIRY_SUBJECTS[0], message: "", website: "" };

export function EnquiryForm({ phoneHref, whatsappHref }: { phoneHref: string; whatsappHref: string }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [sentName, setSentName] = useState("");

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const validateField = (key: keyof Values) => {
    const result = enquirySchema.safeParse(values);
    if (result.success) return;
    const errs = fieldErrors(result.error);
    if (errs[key]) setErrors((e) => ({ ...e, [key]: errs[key] }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const result = enquirySchema.safeParse(values);
    if (!result.success) {
      const errs = fieldErrors(result.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document.getElementById(`enquiry-${first}`)?.focus();
      return;
    }
    setStatus("submitting");
    try {
      await apiRequest("/api/enquiries", { body: values });
      setSentName(values.name.split(" ")[0]);
      setValues(EMPTY);
      setErrors({});
      setStatus("success");
    } catch (error) {
      const err = error as ApiClientError;
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      setFormError(err.message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[3px] bg-white p-8 ring-1 ring-line animate-slide-up" role="status">
        <CheckCircle2 className="h-10 w-10 text-[#16833f]" aria-hidden="true" />
        <h3 className="display-3 mt-4">Message sent{sentName ? `, ${sentName}` : ""}</h3>
        <p className="mt-2 text-slate">
          Thanks for getting in touch. We&apos;ll call or WhatsApp you during working hours. For anything urgent, call us directly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline-dark" onClick={() => setStatus("idle")}>
            Send another message
          </Button>
          <ButtonLink href={phoneHref} variant="ghost-dark">
            <Phone className="h-4 w-4" aria-hidden="true" /> Call now
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[3px] bg-white p-6 ring-1 ring-line sm:p-8" aria-labelledby="enquiry-title">
      <h2 id="enquiry-title" className="display-3">
        Send us a message
      </h2>
      <p className="mt-1.5 text-[0.95rem] text-slate">Questions, quotes or feedback. We usually reply the same day.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="enquiry-name" required error={errors.name}>
          <Input id="enquiry-name" name="name" autoComplete="name" value={values.name} onChange={set("name")} onBlur={() => validateField("name")} {...describedBy("enquiry-name", errors.name)} />
        </Field>
        <Field label="Mobile number" htmlFor="enquiry-mobile" required error={errors.mobile}>
          <Input
            id="enquiry-mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            value={values.mobile}
            onChange={set("mobile")}
            onBlur={() => validateField("mobile")}
            {...describedBy("enquiry-mobile", errors.mobile)}
          />
        </Field>
        <Field label="Email" htmlFor="enquiry-email" error={errors.email}>
          <Input id="enquiry-email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} onBlur={() => validateField("email")} {...describedBy("enquiry-email", errors.email)} />
        </Field>
        <Field label="Vehicle type" htmlFor="enquiry-vehicleType" error={errors.vehicleType}>
          <Select id="enquiry-vehicleType" name="vehicleType" value={values.vehicleType} onChange={set("vehicleType")}>
            <option value="">Select (optional)</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Topic" htmlFor="enquiry-subject" required className="sm:col-span-2" error={errors.subject}>
          <Select id="enquiry-subject" name="subject" value={values.subject} onChange={set("subject")}>
            {ENQUIRY_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Message" htmlFor="enquiry-message" required className="sm:col-span-2" error={errors.message}>
          <Textarea
            id="enquiry-message"
            name="message"
            rows={5}
            maxLength={1500}
            placeholder="Tell us about your vehicle and what you need."
            value={values.message}
            onChange={set("message")}
            onBlur={() => validateField("message")}
            {...describedBy("enquiry-message", errors.message)}
          />
        </Field>
        {/* Honeypot for bots — hidden from people and screen readers */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="enquiry-website">Website</label>
          <input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </div>
      </div>

      {status === "error" && formError && (
        <div className="mt-5 rounded-[3px] border border-[#f5bcbc] bg-[#fdecec] p-4 text-[0.92rem] text-[#7a1313]" role="alert">
          <p className="font-semibold">{formError}</p>
          <p className="mt-1">You can also reach us directly:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink href={phoneHref} size="sm" variant="outline-dark">
              <Phone className="h-4 w-4" aria-hidden="true" /> Call
            </ButtonLink>
            <ButtonLink href={whatsappHref} size="sm" variant="whatsapp">
              <ChatIcon className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </ButtonLink>
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" loading={status === "submitting"}>
        {status === "submitting" ? (
          "Sending…"
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" /> Send message
          </>
        )}
      </Button>
    </form>
  );
}
