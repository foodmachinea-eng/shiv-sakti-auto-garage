import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/logo";
import { getSettings } from "@/lib/data/settings";
import { getCurrentUser } from "@/lib/auth/dal";
import { demoStorage, getDbMode } from "@/lib/db/client";
import { DEMO_ACCOUNTS } from "@/lib/db/seed";
import { countAdmins } from "@/lib/data/users";

export const metadata: Metadata = { title: "Sign in" };

function safeNext(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  return value && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = safeNext(params.next);

  let configError: string | null = null;
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    configError = error instanceof Error ? error.message : "Sign-in is not configured.";
  }
  if (user) redirect(next);

  const mode = getDbMode();
  let noAdmins = false;
  try {
    noAdmins = (await countAdmins()) === 0;
  } catch {
    configError ??= "Can't connect to the database. Check DATABASE_URL.";
  }
  const settings = await getSettings();

  return (
    <main className="grid grid-cols-1 min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="on-dark relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <LogoMark className="h-11 w-11" wrenchColor="#ffffff" />
          <span className="font-display text-[1.4rem] font-bold" style={{ fontStretch: "80%" }}>
            {settings.business.name}
          </span>
        </div>
        <div>
          <p className="display-1 max-w-md">Workshop admin</p>
          <p className="mt-4 max-w-sm text-[1.05rem] text-fog">
            Bookings, enquiries, services, prices and website content in one place.
          </p>
        </div>
        <p className="text-[0.85rem] text-steel">Authorised staff only. Sign-in attempts are rate-limited.</p>
        <LogoMark className="pointer-events-none absolute -bottom-24 -right-24 h-[26rem] w-[26rem] opacity-[0.07]" wrenchColor="#ffffff" gearColor="#ffffff" />
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-10 w-10" wrenchColor="#16171a" />
            <span className="font-display text-[1.3rem] font-bold" style={{ fontStretch: "80%" }}>
              {settings.business.name}
            </span>
          </div>
          <h1 className="font-display text-[2rem] font-bold" style={{ fontStretch: "82%" }}>
            Sign in
          </h1>
          <p className="mt-1 text-[0.95rem] text-slate">Use your admin or staff account.</p>

          {configError && (
            <div className="mt-6 rounded-lg border border-[#f5bcbc] bg-[#fdecec] p-4 text-[0.9rem] text-[#7a1313]" role="alert">
              <p className="font-semibold">Setup needed</p>
              <p className="mt-1">{configError}</p>
            </div>
          )}

          {!configError && noAdmins && mode === "postgres" && (
            <div className="mt-6 rounded-lg border border-[#f3d38a] bg-[#fff6e0] p-4 text-[0.9rem] text-[#6b4200]" role="status">
              <p className="font-semibold">No admin account yet</p>
              <p className="mt-1">
                Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in your environment variables and redeploy, or run{" "}
                <code>npm run admin:create</code>. See the README.
              </p>
            </div>
          )}

          <LoginForm
            next={next}
            demoAccounts={mode === "demo" ? DEMO_ACCOUNTS.map((a) => ({ ...a })) : []}
            demoInMemory={mode === "demo" && demoStorage() === "memory"}
          />
        </div>
      </div>
    </main>
  );
}
