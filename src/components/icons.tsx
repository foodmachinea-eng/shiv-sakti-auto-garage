import {
  Battery,
  Car,
  Clock,
  Cog,
  Disc3,
  Droplet,
  Fuel,
  Gauge,
  IndianRupee,
  Link2,
  MessageCircle,
  Motorbike,
  Package,
  ScanSearch,
  Scooter,
  Settings2,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ThumbsUp,
  Truck,
  Users,
  Wrench,
  Zap,
  CircleDot,
  ClipboardCheck,
  ArrowDownUp,
  type LucideProps,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { IconKey } from "@/content/settings-schema";

type IconComponent = ComponentType<LucideProps>;

/** Auto-rickshaw (three-wheeler) icon drawn in the same style as the Lucide set. */
export function AutoRickshawIcon({
  size = 24,
  strokeWidth = 2,
  className,
  ...rest
}: LucideProps & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M3.5 15V9.5A5.5 5.5 0 0 1 9 4h7a1.5 1.5 0 0 1 1.4 1l1.8 5" />
      <path d="M19.2 10H13v5" />
      <path d="M19.2 10l1.3 5.2" />
      <path d="M3.5 15H13" />
      <circle cx="6.8" cy="17.3" r="2.2" />
      <circle cx="18.6" cy="17.3" r="2.2" />
    </svg>
  );
}

/** Chat-bubble icon used for WhatsApp buttons (labelled "WhatsApp" in text). */
export const ChatIcon = MessageCircle;

const ICONS: Record<IconKey, IconComponent> = {
  wrench: Wrench,
  engine: Cog,
  oil: Droplet,
  brake: Disc3,
  gearbox: Settings2,
  suspension: ArrowDownUp,
  battery: Battery,
  ac: Snowflake,
  electrical: Zap,
  tyre: CircleDot,
  wash: Sparkles,
  chain: Link2,
  scooter: Scooter,
  motorbike: Motorbike,
  car: Car,
  auto: AutoRickshawIcon as IconComponent,
  truck: Truck,
  diagnosis: ScanSearch,
  inspection: ClipboardCheck,
  shield: ShieldCheck,
  rupee: IndianRupee,
  clock: Clock,
  users: Users,
  "thumbs-up": ThumbsUp,
  parts: Package,
  gauge: Gauge,
  spark: Sparkles,
  fuel: Fuel,
};

export const ICON_LABELS: Record<IconKey, string> = {
  wrench: "Wrench",
  engine: "Engine",
  oil: "Oil",
  brake: "Brakes",
  gearbox: "Gearbox / clutch",
  suspension: "Suspension",
  battery: "Battery",
  ac: "Air conditioning",
  electrical: "Electrical",
  tyre: "Tyre",
  wash: "Wash / detailing",
  chain: "Chain",
  scooter: "Scooter",
  motorbike: "Motorbike",
  car: "Car",
  auto: "Auto-rickshaw",
  truck: "Truck",
  diagnosis: "Diagnosis",
  inspection: "Inspection",
  shield: "Shield",
  rupee: "Rupee",
  clock: "Clock",
  users: "People",
  "thumbs-up": "Thumbs up",
  parts: "Spare parts",
  gauge: "Gauge",
  spark: "Sparkle",
  fuel: "Fuel",
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = ICONS[name as IconKey] ?? Wrench;
  return <Cmp aria-hidden="true" {...props} />;
}

