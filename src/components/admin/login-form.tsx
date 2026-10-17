"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, describedBy } from "@/components/ui/field";
import { ApiClientError, apiRequest } from "@/lib/client-api";

type DemoAccount = { name: string; email: string; password: string; role: string };

export function LoginForm({
  next,
  demoAccounts,
  demoInMemory = false,
}: {
  next: string;
  demoAccounts: DemoAccount[];
  demoInMemory?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const errs: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Enter your password";
    setFields(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await apiRequest("/api/auth/login", { body: { email, password, remember } });
      router.replace(next);
      router.refresh();
    } catch (err) {
      const apiErr = err as ApiClientError;
      setError(apiErr.message);
      setFields(apiErr.fields ?? {});
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
        {error && (
          <div className="rounded-lg border border-[#f5bcbc] bg-[#fdecec] px-4 py-3 text-[0.9rem] font-medium text-[#7a1313]" role="alert">
            {error}
          </div>
        )}
        <Field label="Email" htmlFor="login-email" required error={fields.email} optionalText="">
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...describedBy("login-email", fields.email)}
          />
        </Field>
        <Field label="Password" htmlFor="login-password" required error={fields.password} optionalText="">
          <div className="relative">
            <Input
              id="login-password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12"
              {...describedBy("login-password", fields.password)}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate hover:text-charcoal"
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
            >
              {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </Field>
        <label className="flex items-center gap-2.5 text-[0.92rem]">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Keep me signed in for 30 days
        </label>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Signing in…" : (
            <>
              <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
            </>
          )}
        </Button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-charcoal/25 bg-white p-4">
          <p className="text-[0.9rem] font-semibold">Demo accounts</p>
          <p className="mt-0.5 text-[0.82rem] text-slate">
            Shown only in demo mode (no database connected). They are never created on a real database.
          </p>
          {demoInMemory && (
            <p className="mt-2 rounded-md bg-[#fff6e0] px-3 py-2 text-[0.82rem] text-[#6b4200]">
              This deployment keeps demo data in memory, so new bookings and edits can reset when the server restarts.
              Connect a database (DATABASE_URL) for a lasting site.
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {demoAccounts.map((a) => (
              <li key={a.email} className="flex items-center justify-between gap-3 text-[0.85rem]">
                <span>
                  <span className="font-medium capitalize">{a.role}</span>
                  <span className="block text-slate">
                    {a.email} / {a.password}
                  </span>
                </span>
                <button
                  type="button"
                  className="rounded-md border border-line px-2.5 py-1.5 font-medium hover:bg-paper"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                    setFields({});
                    setError("");
                  }}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
