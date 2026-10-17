import type { IconKey } from "@/content/settings-schema";

export const VEHICLE_TYPES = [
  { value: "car", label: "Car", icon: "car", packageClass: "car" },
  { value: "bike", label: "Bike", icon: "motorbike", packageClass: "bike" },
  { value: "scooter", label: "Scooter", icon: "scooter", packageClass: "bike" },
  { value: "auto_rickshaw", label: "Auto-rickshaw", icon: "auto", packageClass: "other" },
  { value: "other", label: "Other", icon: "truck", packageClass: "other" },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  icon: IconKey;
  packageClass: "car" | "bike" | "other";
}>;

export type VehicleType = (typeof VEHICLE_TYPES)[number]["value"];
export const VEHICLE_TYPE_VALUES = VEHICLE_TYPES.map((v) => v.value) as [VehicleType, ...VehicleType[]];

export function vehicleLabel(value: string): string {
  return VEHICLE_TYPES.find((v) => v.value === value)?.label ?? value;
}

export const PACKAGE_CLASSES = [
  { value: "car", label: "Cars" },
  { value: "bike", label: "Bikes & scooters" },
  { value: "other", label: "Autos & commercial" },
] as const;
export type PackageClass = (typeof PACKAGE_CLASSES)[number]["value"];
export const PACKAGE_CLASS_VALUES = PACKAGE_CLASSES.map((p) => p.value) as [PackageClass, ...PackageClass[]];

export const BOOKING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number]["value"];
export const BOOKING_STATUS_VALUES = BOOKING_STATUSES.map((s) => s.value) as [BookingStatus, ...BookingStatus[]];

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]["value"];
export const ENQUIRY_STATUS_VALUES = ENQUIRY_STATUSES.map((s) => s.value) as [EnquiryStatus, ...EnquiryStatus[]];

export const ENQUIRY_SUBJECTS = [
  "General enquiry",
  "Repair or service question",
  "Price estimate",
  "Commercial / fleet maintenance",
  "Feedback",
] as const;

export const GALLERY_CATEGORIES = [
  { value: "exterior", label: "Garage exterior" },
  { value: "servicing", label: "Vehicle servicing" },
  { value: "mechanics", label: "Mechanics at work" },
  { value: "engine", label: "Engine repairs" },
  { value: "car", label: "Car maintenance" },
  { value: "bike", label: "Bike maintenance" },
  { value: "equipment", label: "Workshop equipment" },
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]["value"];
export const GALLERY_CATEGORY_VALUES = GALLERY_CATEGORIES.map((c) => c.value) as [
  GalleryCategory,
  ...GalleryCategory[],
];

export const ROLES = [
  { value: "admin", label: "Admin", description: "Full access, including settings and user accounts" },
  { value: "staff", label: "Staff", description: "Dashboard, bookings and customer enquiries only" },
] as const;
export type Role = (typeof ROLES)[number]["value"];
export const ROLE_VALUES = ROLES.map((r) => r.value) as [Role, ...Role[]];

export const TIMEZONE = "Asia/Kolkata";

/** Common makes shown as suggestions in the booking form. Customers can type any make. */
export const MAKE_SUGGESTIONS: Record<"car" | "bike" | "other", string[]> = {
  car: [
    "Maruti Suzuki",
    "Hyundai",
    "Tata",
    "Mahindra",
    "Kia",
    "Toyota",
    "Honda",
    "Renault",
    "Skoda",
    "Volkswagen",
    "MG",
    "Nissan",
    "Ford",
  ],
  bike: [
    "Hero",
    "Honda",
    "Bajaj",
    "TVS",
    "Royal Enfield",
    "Yamaha",
    "Suzuki",
    "KTM",
    "Ather",
    "Ola Electric",
    "Jawa",
  ],
  other: ["Bajaj", "Piaggio", "Mahindra", "TVS", "Atul", "Tata", "Ashok Leyland", "Eicher"],
};
