"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  CalendarCheck,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Star,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import type { Permission } from "@/lib/auth/permissions";
import { apiRequest } from "@/lib/client-api";
import { cn } from "@/lib/format";

type NavItem = { href: string; label: string; icon: typeof Wrench; permission?: Permission; count?: number };

export function AdminShell({
  user,
  permissions,
  counts,
  garageName,
  demoMode,
  children,
}: {
  user: { name: string; email: string; role: string };
  permissions: Permission[];
  counts: { pending: number; newEnquiries: number };
  garageName: string;
  demoMode: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close the mobile drawer after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: "Workshop",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
        { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, permission: "bookings.view", count: counts.pending },
        { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, permission: "enquiries.view", count: counts.newEnquiries },
      ],
    },
    {
      label: "Website",
      items: [
        { href: "/admin/services", label: "Services & prices", icon: Wrench, permission: "services.manage" },
        { href: "/admin/packages", label: "Packages", icon: Package, permission: "packages.manage" },
        { href: "/admin/gallery", label: "Gallery", icon: Images, permission: "gallery.manage" },
        { href: "/admin/reviews", label: "Reviews", icon: Star, permission: "reviews.manage" },
        { href: "/admin/content", label: "Content & settings", icon: FileText, permission: "content.manage" },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/admin/users", label: "Users & roles", icon: Users, permission: "users.manage" },
        { href: "/admin/account", label: "My account", icon: UserCog },
      ],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {groups.map((group) => {
        const items = group.items.filter((i) => !i.permission || permissions.includes(i.permission));
        if (!items.length) return null;
        return (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[0.75rem] font-medium text-steel">{group.label}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-[0.92rem] transition-colors",
                        active ? "bg-white/10 font-semibold text-white" : "text-fog hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px]", active && "text-accent-bright")} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {!!item.count && (
                        <span className="rounded-full bg-accent px-2 py-px text-[0.72rem] font-semibold text-white" aria-label={`${item.count} need attention`}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="on-dark flex h-full flex-col bg-charcoal text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <LogoMark className="h-8 w-8" wrenchColor="#ffffff" />
        <span className="truncate font-display text-[1.15rem] font-bold" style={{ fontStretch: "82%" }}>
          {garageName}
        </span>
      </div>
      {nav}
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-[0.9rem] text-fog hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" /> View website
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-md px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.9rem] font-semibold">{user.name}</p>
            <p className="truncate text-[0.78rem] capitalize text-steel">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="rounded-md p-2 text-fog hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <div className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-charcoal px-4 text-white lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="-ml-2 rounded-md p-2 hover:bg-white/10" aria-label="Open admin menu" aria-expanded={open}>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <span className="font-display text-[1.1rem] font-bold" style={{ fontStretch: "82%" }}>
          Admin
        </span>
        <LogoMark className="h-7 w-7" wrenchColor="#ffffff" />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-ink/60 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-up">
            {sidebar}
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3.5 rounded-md p-2 text-white hover:bg-white/10" aria-label="Close menu">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {demoMode && (
          <div className="mb-6 rounded-lg border border-[#f3d38a] bg-[#fff6e0] px-4 py-3 text-[0.88rem] text-[#6b4200]" role="status">
            <span className="font-semibold">Demo mode.</span> Data is stored in the built-in demo database. Connect PostgreSQL
            (set <code className="rounded bg-white/60 px-1">DATABASE_URL</code>) before going live.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
