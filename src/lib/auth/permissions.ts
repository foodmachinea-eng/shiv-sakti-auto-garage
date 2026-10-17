import type { Role } from "@/lib/constants";

/** Role-based access control. Checked on the server for every admin page and API call. */
export const PERMISSIONS = [
  "dashboard.view",
  "bookings.view",
  "bookings.update",
  "bookings.delete",
  "bookings.export",
  "enquiries.view",
  "enquiries.update",
  "enquiries.delete",
  "services.manage",
  "packages.manage",
  "gallery.manage",
  "reviews.manage",
  "content.manage",
  "users.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: PERMISSIONS,
  staff: [
    "dashboard.view",
    "bookings.view",
    "bookings.update",
    "bookings.export",
    "enquiries.view",
    "enquiries.update",
  ],
};

export function can(role: string | undefined | null, permission: Permission): boolean {
  if (!role || !(role in ROLE_PERMISSIONS)) return false;
  return ROLE_PERMISSIONS[role as Role].includes(permission);
}
