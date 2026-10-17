import { IMG } from "./images";

/**
 * Starting content for a new database. Everything here can be edited from the
 * admin panel afterwards — these are demo services, demo prices (labelled as
 * estimates on the site) and clearly marked sample reviews.
 */

export const SEED_CATEGORIES = [
  {
    slug: "car",
    name: "Car services",
    shortName: "Cars",
    description:
      "Servicing, repairs and diagnostics for hatchbacks, sedans, SUVs and MUVs, whether petrol, diesel or CNG.",
    imageUrl: IMG.carService,
    icon: "car",
    vehicleTypes: ["car"],
    sortOrder: 1,
  },
  {
    slug: "bike",
    name: "Bike & scooter services",
    shortName: "Two-wheelers",
    description:
      "Routine servicing and repairs for motorcycles and scooters of every make, from daily commuters to cruisers.",
    imageUrl: IMG.bikeService,
    icon: "motorbike",
    vehicleTypes: ["bike", "scooter"],
    sortOrder: 2,
  },
  {
    slug: "other",
    name: "Auto-rickshaw & commercial",
    shortName: "Other vehicles",
    description:
      "Repairs and maintenance for auto-rickshaws, three-wheelers and light commercial vehicles that need to get back on the road fast.",
    imageUrl: IMG.autoRickshaw,
    icon: "auto",
    vehicleTypes: ["auto_rickshaw", "other"],
    sortOrder: 3,
  },
] as const;

type SeedService = {
  category: "car" | "bike" | "other";
  slug: string;
  name: string;
  description: string;
  icon: string;
  priceFrom: number | null;
  priceNote?: string;
  duration?: string;
  featured?: boolean;
};

export const SEED_SERVICES: SeedService[] = [
  // ── Cars ────────────────────────────────────────────────────────────
  {
    category: "car",
    slug: "car-engine-repair",
    name: "Engine repair & maintenance",
    description:
      "Diagnosis and repair of misfires, overheating, oil leaks, unusual noises and loss of power, up to complete engine overhauls.",
    icon: "engine",
    priceFrom: null,
    priceNote: "Price after inspection",
    duration: "Depends on the job",
  },
  {
    category: "car",
    slug: "car-servicing-oil-change",
    name: "Car servicing & oil change",
    description:
      "Periodic service with engine oil and filter change, fluid top-ups and a multi-point safety check.",
    icon: "oil",
    priceFrom: 2499,
    duration: "3–4 hrs",
    featured: true,
  },
  {
    category: "car",
    slug: "car-brake-repair",
    name: "Brake repair & replacement",
    description:
      "Brake pad and shoe replacement, disc skimming, brake fluid change and a complete brake system check.",
    icon: "brake",
    priceFrom: 999,
    priceNote: "+ parts",
    duration: "1–2 hrs",
    featured: true,
  },
  {
    category: "car",
    slug: "car-clutch-gearbox",
    name: "Clutch & gearbox repair",
    description:
      "Clutch plate, pressure plate and bearing replacement, hard gear shifting and gearbox overhauls.",
    icon: "gearbox",
    priceFrom: 2999,
    priceNote: "+ parts",
    duration: "4–8 hrs",
  },
  {
    category: "car",
    slug: "car-suspension-steering",
    name: "Suspension & steering repair",
    description:
      "Shock absorbers, struts, bushes, ball joints, tie-rod ends and steering rack repairs for a smooth, safe ride.",
    icon: "suspension",
    priceFrom: 1499,
    priceNote: "+ parts",
    duration: "2–4 hrs",
  },
  {
    category: "car",
    slug: "car-battery",
    name: "Battery inspection & replacement",
    description:
      "Battery health test, terminal cleaning, charging and replacement with branded batteries under warranty.",
    icon: "battery",
    priceFrom: null,
    priceNote: "Free health check",
    duration: "30 min",
  },
  {
    category: "car",
    slug: "car-ac-service",
    name: "AC servicing & repair",
    description:
      "AC gas top-up, leak detection, condenser and cooling-coil cleaning, compressor and blower repairs.",
    icon: "ac",
    priceFrom: 1499,
    duration: "2–3 hrs",
    featured: true,
  },
  {
    category: "car",
    slug: "car-electrical-wiring",
    name: "Car electrical & wiring repair",
    description:
      "Wiring faults, lights, horns, power windows, sensors, starter motor and alternator repairs.",
    icon: "electrical",
    priceFrom: 499,
    priceNote: "+ parts",
    duration: "1–3 hrs",
  },
  {
    category: "car",
    slug: "car-tyres-alignment",
    name: "Tyre inspection & wheel alignment",
    description:
      "Computerised wheel alignment and balancing, tyre rotation, puncture repair and new tyres.",
    icon: "tyre",
    priceFrom: 499,
    duration: "1 hr",
    featured: true,
  },
  {
    category: "car",
    slug: "car-wash-detailing",
    name: "Car washing & detailing",
    description:
      "Foam wash, interior vacuum and shampoo, dashboard dressing, rubbing, polishing and paint protection.",
    icon: "wash",
    priceFrom: 399,
    duration: "1–6 hrs",
  },

  // ── Bikes & scooters ────────────────────────────────────────────────
  {
    category: "bike",
    slug: "bike-servicing",
    name: "Bike servicing & maintenance",
    description:
      "General service with oil change, chain cleaning, brake and clutch adjustment, and a full safety check.",
    icon: "motorbike",
    priceFrom: 599,
    duration: "2–3 hrs",
    featured: true,
  },
  {
    category: "bike",
    slug: "bike-engine-oil",
    name: "Engine repair & oil change",
    description:
      "Oil changes with quality engine oil, plus engine noise, oil leak, starting and pick-up problems.",
    icon: "engine",
    priceFrom: 349,
    priceNote: "+ oil",
    duration: "30 min – 1 day",
  },
  {
    category: "bike",
    slug: "bike-brake-clutch",
    name: "Brake & clutch repair",
    description:
      "Brake shoe and pad replacement, disc brake service, clutch plate and cable replacement.",
    icon: "brake",
    priceFrom: 249,
    priceNote: "+ parts",
    duration: "1 hr",
  },
  {
    category: "bike",
    slug: "bike-chain-sprocket",
    name: "Chain & sprocket replacement",
    description:
      "Chain cleaning, lubrication and adjustment, and replacement of worn chain-sprocket kits.",
    icon: "chain",
    priceFrom: 299,
    priceNote: "+ parts",
    duration: "1 hr",
    featured: true,
  },
  {
    category: "bike",
    slug: "bike-battery-electrical",
    name: "Battery & electrical repairs",
    description:
      "Battery testing and replacement, self-start, horn, indicator and headlight wiring repairs.",
    icon: "battery",
    priceFrom: 199,
    priceNote: "+ parts",
    duration: "30 min – 2 hrs",
  },
  {
    category: "bike",
    slug: "bike-tyre-puncture",
    name: "Tyre & puncture repair",
    description: "Tubeless and tube puncture repair, tyre replacement and wheel balancing.",
    icon: "tyre",
    priceFrom: 100,
    duration: "20–40 min",
    featured: true,
  },
  {
    category: "bike",
    slug: "scooter-motorcycle-repair",
    name: "Scooter & motorcycle repair",
    description:
      "Repairs for all scooters and motorcycles: carburettor and fuel-injection, CVT and variator, and suspension work.",
    icon: "scooter",
    priceFrom: null,
    priceNote: "Price after inspection",
    duration: "Depends on the job",
  },

  // ── Other vehicles ──────────────────────────────────────────────────
  {
    category: "other",
    slug: "auto-rickshaw-repair",
    name: "Three-wheeler & auto-rickshaw repair",
    description:
      "Engine, clutch, brake and electrical repairs for petrol, CNG, LPG and electric auto-rickshaws, done the same day where possible.",
    icon: "auto",
    priceFrom: null,
    priceNote: "Price after inspection",
    duration: "Same day for most jobs",
    featured: true,
  },
  {
    category: "other",
    slug: "commercial-vehicle-maintenance",
    name: "Commercial vehicle maintenance",
    description:
      "Scheduled maintenance for pick-ups, tempos and small goods carriers, with service records for every visit.",
    icon: "truck",
    priceFrom: null,
    priceNote: "Price after inspection",
    duration: "Scheduled to suit you",
  },
  {
    category: "other",
    slug: "general-mechanical-repairs",
    name: "General mechanical repairs",
    description:
      "General mechanical repairs for other supported vehicles. Call us to check if we can work on yours.",
    icon: "wrench",
    priceFrom: null,
    priceNote: "Price after inspection",
    duration: "Depends on the job",
  },
  {
    category: "other",
    slug: "inspection-fault-diagnosis",
    name: "Vehicle inspection & fault diagnosis",
    description:
      "Computerised diagnostic scan and a detailed inspection report for any vehicle, including pre-purchase checks.",
    icon: "diagnosis",
    priceFrom: 499,
    duration: "45 min – 1 hr",
    featured: true,
  },
];

/** Service used when a customer isn't sure what their vehicle needs. */
export const FALLBACK_SERVICE_SLUG = "inspection-fault-diagnosis";

export const SEED_PACKAGES = [
  // Cars
  {
    name: "Basic Service",
    vehicleClass: "car",
    tagline: "Essential care every 5,000 km",
    price: 2499,
    duration: "3–4 hrs",
    isPopular: false,
    features: [
      "Engine oil change (semi-synthetic, up to 3.5 L)",
      "Oil filter replacement",
      "Air filter cleaning",
      "Coolant, brake and washer fluid top-up",
      "25-point safety inspection",
      "Exterior wash",
    ],
  },
  {
    name: "Standard Service",
    vehicleClass: "car",
    tagline: "Recommended every 10,000 km",
    price: 3999,
    duration: "4–5 hrs",
    isPopular: true,
    features: [
      "Everything in Basic Service",
      "Air filter replacement",
      "AC filter cleaning",
      "Brake cleaning and adjustment",
      "Spark plug check and cleaning",
      "Battery health test",
      "Tyre rotation",
      "40-point inspection report",
      "Interior vacuum",
    ],
  },
  {
    name: "Complete Vehicle Checkup",
    vehicleClass: "car",
    tagline: "Know exactly what your car needs",
    price: 1499,
    duration: "1–2 hrs",
    isPopular: false,
    features: [
      "Computerised diagnostic (OBD) scan",
      "75-point inspection report",
      "Brakes, suspension and steering check",
      "Battery and charging system test",
      "AC cooling performance check",
      "Tyre condition and pressure check",
      "Written estimate for any repairs",
    ],
  },
  {
    name: "Premium Maintenance Package",
    vehicleClass: "car",
    tagline: "Yearly care for complete peace of mind",
    price: 6999,
    duration: "1 day",
    isPopular: false,
    features: [
      "Everything in Standard Service",
      "Fully synthetic engine oil",
      "Wheel alignment and balancing",
      "AC service with vent disinfection",
      "Brake fluid replacement",
      "Throttle body cleaning",
      "Engine bay cleaning",
      "Foam wash, interior shampoo and polish",
    ],
  },
  // Bikes & scooters
  {
    name: "Basic Service",
    vehicleClass: "bike",
    tagline: "Routine care every 3,000 km",
    price: 599,
    duration: "2 hrs",
    isPopular: false,
    features: [
      "Engine oil change (up to 1 L)",
      "Oil filter cleaning",
      "Chain cleaning and lubrication",
      "Brake and clutch adjustment",
      "Battery and lights check",
      "Water wash",
    ],
  },
  {
    name: "Standard Service",
    vehicleClass: "bike",
    tagline: "Recommended every 6,000 km",
    price: 999,
    duration: "3 hrs",
    isPopular: true,
    features: [
      "Everything in Basic Service",
      "Air filter cleaning",
      "Spark plug cleaning",
      "Carburettor or throttle body cleaning",
      "Nut and bolt tightening",
      "Electrical system check",
      "Foam wash and polish",
    ],
  },
  {
    name: "Complete Vehicle Checkup",
    vehicleClass: "bike",
    tagline: "Before a long ride or a purchase",
    price: 399,
    duration: "45 min",
    isPopular: false,
    features: [
      "30-point inspection",
      "Brake and tyre condition",
      "Chain and sprocket wear check",
      "Battery and electrical test",
      "Written estimate for any repairs",
    ],
  },
  {
    name: "Premium Maintenance Package",
    vehicleClass: "bike",
    tagline: "Complete care for your two-wheeler",
    price: 1799,
    duration: "4–5 hrs",
    isPopular: false,
    features: [
      "Everything in Standard Service",
      "Premium synthetic engine oil",
      "Brake pad or shoe replacement (labour)",
      "Front fork oil check",
      "Chain-sprocket alignment",
      "Wheel balancing",
      "Full body polish",
    ],
  },
] as const;

export const SEED_GALLERY = [
  { title: "Workshop entrance", category: "exterior", imageUrl: IMG.exterior, alt: "Building with roller-shutter garage doors" },
  { title: "Service bay", category: "exterior", imageUrl: IMG.carInBay, alt: "A car parked inside the service bay" },
  { title: "Periodic service", category: "servicing", imageUrl: IMG.oilTopUp, alt: "Mechanic refilling engine oil in a car" },
  { title: "Car on the ramp", category: "servicing", imageUrl: IMG.carBeingWorked, alt: "A car being worked on in the repair shop" },
  { title: "Underbody inspection", category: "mechanics", imageUrl: IMG.underVehicle, alt: "Mechanic working underneath a vehicle" },
  { title: "Mechanic at work", category: "mechanics", imageUrl: IMG.mechanicAtWork, alt: "Mechanic working on a car in the garage" },
  { title: "Workshop floor", category: "mechanics", imageUrl: IMG.workshopFloor, alt: "Mechanics working on several cars in the workshop" },
  { title: "Engine diagnosis", category: "engine", imageUrl: IMG.engineRepair, alt: "Mechanic working on a car engine" },
  { title: "Engine repair", category: "engine", imageUrl: IMG.engineWrench, alt: "Mechanic using a wrench on a car engine" },
  { title: "Engine bay work", category: "engine", imageUrl: IMG.engineBay, alt: "Mechanic working in a car's engine bay" },
  { title: "Tyre service", category: "car", imageUrl: IMG.tyreWork, alt: "Mechanic working on a car tyre" },
  { title: "Wheel change", category: "car", imageUrl: IMG.wheelWrench, alt: "A tyre with a wrench beside it" },
  { title: "Foam wash", category: "car", imageUrl: IMG.carWash, alt: "Car covered in foam during a wash" },
  { title: "Paint polish", category: "car", imageUrl: IMG.carWax, alt: "Polishing the bonnet of a car" },
  { title: "Motorcycle repair", category: "bike", imageUrl: IMG.bikeWrench, alt: "Mechanic repairing a motorcycle with a wrench" },
  { title: "Two-wheeler service", category: "bike", imageUrl: IMG.bikeGarage, alt: "Mechanic working on a motorcycle in the garage" },
  { title: "Bike maintenance", category: "bike", imageUrl: IMG.bikeDetail, alt: "Mechanic working on a motorcycle" },
  { title: "Tool kit", category: "equipment", imageUrl: IMG.toolbox, alt: "Spanners and tools in a tool box" },
  { title: "Vehicle lift", category: "equipment", imageUrl: IMG.carOnLift, alt: "A car raised on a vehicle lift" },
  { title: "Diagnostic scanner", category: "equipment", imageUrl: IMG.diagnostics, alt: "Technician using a laptop for vehicle diagnostics" },
  { title: "Spare parts stock", category: "equipment", imageUrl: IMG.partsShelf, alt: "Engine parts arranged on a shelf" },
] as const;

/** Clearly labelled SAMPLE reviews — replace with genuine reviews before going live. */
export const SEED_TESTIMONIALS = [
  {
    customerName: "Rohan M.",
    vehicle: "Maruti Suzuki Swift",
    rating: 5,
    content:
      "Booked a service online in the morning and had the car back by evening. They called before replacing the brake pads and showed me the old ones.",
  },
  {
    customerName: "Priya S.",
    vehicle: "Honda Activa",
    rating: 5,
    content:
      "My scooter had a starting problem two other shops couldn't fix. They traced it to a loose wiring connection and charged only for the time it took.",
  },
  {
    customerName: "Imran K.",
    vehicle: "Bajaj auto-rickshaw",
    rating: 5,
    content:
      "My auto is my income, so I can't wait days for a repair. The clutch work was done the same day, at the price they quoted.",
  },
  {
    customerName: "Anita D.",
    vehicle: "Hyundai Creta",
    rating: 4,
    content:
      "Clear estimate on WhatsApp before they started the AC repair, and the cooling is perfect now. Collection took a little longer than promised.",
  },
  {
    customerName: "Suresh P.",
    vehicle: "Royal Enfield Classic 350",
    rating: 5,
    content:
      "Chain-sprocket kit and a full service. The bike rides smoother and they told me what to keep an eye on before the next service.",
  },
  {
    customerName: "Neha R.",
    vehicle: "Tata Ace",
    rating: 5,
    content:
      "We service our delivery vehicle here. Proper records, fair pricing, and they stick to the time they give.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Sample bookings & enquiries (demo dashboard data)                   */
/* ------------------------------------------------------------------ */

const SAMPLE_PEOPLE = [
  ["Sample Customer 1", "car", "Maruti Suzuki", "Baleno", "MH 12 AB 4521"],
  ["Sample Customer 2", "bike", "Bajaj", "Pulsar 150", "MH 14 CX 0912"],
  ["Sample Customer 3", "scooter", "TVS", "Jupiter", "MH 12 KL 7781"],
  ["Sample Customer 4", "car", "Hyundai", "i20", "MH 12 RT 3390"],
  ["Sample Customer 5", "auto_rickshaw", "Bajaj", "RE Compact", "MH 12 Q 5512"],
  ["Sample Customer 6", "car", "Tata", "Nexon", "MH 14 HJ 2206"],
  ["Sample Customer 7", "bike", "Royal Enfield", "Classic 350", "MH 12 ZX 1185"],
  ["Sample Customer 8", "other", "Tata", "Ace Gold", "MH 12 MV 6630"],
  ["Sample Customer 9", "scooter", "Honda", "Activa 6G", "MH 12 GH 4407"],
  ["Sample Customer 10", "car", "Mahindra", "XUV300", "MH 14 DT 8812"],
  ["Sample Customer 11", "bike", "Hero", "Splendor Plus", "MH 12 NB 2290"],
  ["Sample Customer 12", "car", "Kia", "Seltos", "MH 12 SE 1102"],
] as const;

const SAMPLE_PROBLEMS = [
  "Due for regular service. Slight vibration at idle.",
  "Brakes making a squealing noise.",
  "AC not cooling properly since last week.",
  "Self-start not working in the mornings.",
  "Clutch feels hard and gear shifting is rough.",
  "Steering pulls to the left at speed.",
  "",
  "Check engine light came on.",
  "Chain is loose and making noise.",
  "Front tyre keeps losing air.",
] as const;

/**
 * Builds ~26 sample bookings spread around `today` so the demo dashboard has
 * realistic numbers. Mobile numbers are deliberately invalid (+91 1…).
 */
export function buildSampleBookings(
  today: string,
  serviceIdsByCategory: Record<"car" | "bike" | "other", { id: number; name: string }[]>,
  addDays: (ymd: string, days: number) => string,
) {
  const offsets = [-21, -19, -17, -15, -14, -12, -11, -9, -8, -7, -6, -5, -4, -3, -3, -2, -1, -1, 0, 0, 0, 1, 2, 3, 5, 7];
  const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
  return offsets.map((offset, i) => {
    const [name, vehicleType, make, model, reg] = SAMPLE_PEOPLE[i % SAMPLE_PEOPLE.length];
    const cat = vehicleType === "car" ? "car" : vehicleType === "bike" || vehicleType === "scooter" ? "bike" : "other";
    const pool = serviceIdsByCategory[cat];
    const svc = pool[(i * 3) % pool.length];
    let status: string;
    if (offset < -2) status = i % 7 === 3 ? "cancelled" : "completed";
    else if (offset < 0) status = i % 2 === 0 ? "completed" : "confirmed";
    else if (offset === 0) status = i % 2 === 0 ? "confirmed" : "pending";
    else status = i % 3 === 0 ? "confirmed" : "pending";
    // Always in the past: older appointments were booked a few days before; upcoming ones recently.
    const hoursAgo = offset <= 0 ? (1 + (i % 4) - offset) * 24 + (i % 9) : (i % 3) * 24 + 2 + (i % 5);
    const created = new Date(Date.now() - hoursAgo * 3_600_000);
    return {
      reference: `BK-DEMO-${String(i + 1).padStart(3, "0")}`,
      customerName: name,
      mobile: `+91 10000 ${String(10000 + i * 37).slice(-5)}`,
      vehicleType,
      vehicleMake: make,
      vehicleModel: model,
      registrationNumber: reg,
      serviceId: svc?.id ?? null,
      serviceName: svc?.name ?? "General inspection",
      preferredDate: addDays(today, offset),
      preferredTime: times[i % times.length],
      problemDescription: SAMPLE_PROBLEMS[i % SAMPLE_PROBLEMS.length],
      status,
      isSample: true,
      createdAt: created,
      updatedAt: created,
      statusChangedAt: created,
    };
  });
}

export const SAMPLE_ENQUIRIES = [
  {
    name: "Sample Enquiry 1",
    mobile: "+91 10000 20001",
    email: "",
    vehicleType: "car",
    subject: "Price estimate",
    message: "What would a clutch plate replacement cost for a 2018 Honda City? Can you also check the AC?",
    status: "new",
    hoursAgo: 3,
  },
  {
    name: "Sample Enquiry 2",
    mobile: "+91 10000 20002",
    email: "sample2@example.com",
    vehicleType: "other",
    subject: "Commercial / fleet maintenance",
    message: "We run four delivery vans. Do you offer a monthly maintenance arrangement?",
    status: "new",
    hoursAgo: 20,
  },
  {
    name: "Sample Enquiry 3",
    mobile: "+91 10000 20003",
    email: "",
    vehicleType: "scooter",
    subject: "Repair or service question",
    message: "My scooter stalls when it is idling at signals. Is this something you can look at today?",
    status: "in_progress",
    hoursAgo: 30,
  },
  {
    name: "Sample Enquiry 4",
    mobile: "+91 10000 20004",
    email: "",
    vehicleType: "auto_rickshaw",
    subject: "General enquiry",
    message: "Do you repair electric auto-rickshaws as well as CNG ones?",
    status: "resolved",
    hoursAgo: 72,
  },
  {
    name: "Sample Enquiry 5",
    mobile: "+91 10000 20005",
    email: "",
    vehicleType: "bike",
    subject: "Feedback",
    message: "Thanks for the quick puncture repair yesterday. The bike is running great.",
    status: "resolved",
    hoursAgo: 120,
  },
] as const;
