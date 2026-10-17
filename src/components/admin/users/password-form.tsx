"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, describedBy } from "@/components/ui/field";
import { apiRequest, type ApiClientError } from "@/lib/client-api";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!current) errs.currentPassword = "Enter your current password";
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) errs.newPassword = "At least 8 characters, including a letter and a number";
    if (next !== confirmPw) errs.confirm = "The passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await apiRequest("/api/admin/account/password", { body: { currentPassword: current, newPassword: next } });
      toast.success("Password changed. Other devices have been signed out.");
      setCurrent("");
      setNext("");
      setConfirmPw("");
    } catch (err) {
      const apiErr = err as ApiClientError;
      setErrors(apiErr.fields ?? {});
      toast.error(apiErr.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-md gap-5">
      <Field label="Current password" htmlFor="pw-current" required error={errors.currentPassword} optionalText="">
        <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} {...describedBy("pw-current", errors.currentPassword)} />
      </Field>
      <Field label="New password" htmlFor="pw-new" required error={errors.newPassword} hint="At least 8 characters, including a letter and a number." optionalText="">
        <Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} {...describedBy("pw-new", errors.newPassword, true)} />
      </Field>
      <Field label="Confirm new password" htmlFor="pw-confirm" required error={errors.confirm} optionalText="">
        <Input id="pw-confirm" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} {...describedBy("pw-confirm", errors.confirm)} />
      </Field>
      <div>
        <Button type="submit" loading={saving}>
          Change password
        </Button>
      </div>
    </form>
  );
}
