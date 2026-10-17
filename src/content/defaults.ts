import { IMG } from "./images";
import type { SiteSettings } from "./settings-schema";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  DEMO GARAGE DETAILS — EDIT THESE TO MATCH THE REAL BUSINESS
 * ─────────────────────────────────────────────────────────────────────────
 * Everything here is placeholder content for the demo. It is copied into the
 * database the first time the site runs; after that, edit it from
 * Admin → Content & settings (no code needed).
 *
 * Text fields support two tokens that are filled in automatically:
 *   {name}   → the garage name
 *   {years}  → years of experience
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  business: {
    name: "TorqueLine Garage",
    tagline: "Multi-vehicle repair & service workshop",
    ownerName: "Owner name",
    ownerRole: "Founder & head mechanic",
    yearsExperience: 15,
    phone: "+91 12345 67890",
    whatsapp: "911234567890",
    email: "bookings@example.com",
    addressLine1: "Shop 7, Sample Auto Market",
    addressLine2: "MG Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    mapQuery: "MG Road, Pune, Maharashtra",
    mapEmbedUrl: "",
    googleReviewUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    // 0 = Sunday … 6 = Saturday (24-hour times, India Standard Time)
    hours: [
      { day: 0, open: "10:00", close: "14:00", closed: false },
      { day: 1, open: "09:00", close: "20:00", closed: false },
      { day: 2, open: "09:00", close: "20:00", closed: false },
      { day: 3, open: "09:00", close: "20:00", closed: false },
      { day: 4, open: "09:00", close: "20:00", closed: false },
      { day: 5, open: "09:00", close: "20:00", closed: false },
      { day: 6, open: "09:00", close: "20:00", closed: false },
    ],
    slotMinutes: 60,
    bookingWindowDays: 30,
  },

  home: {
    heroTitle: "Complete Vehicle Care Under One Roof",
    heroSubtitle:
      "Expert repairs, reliable servicing, and professional maintenance for cars, bikes, and more.",
    heroImage: IMG.hero,
    heroImageAlt: "A black SUV parked in a workshop service bay",
    highlights: [
      { title: "{years}+ years", text: "of hands-on repair experience" },
      { title: "Every vehicle", text: "cars, bikes, scooters, autos & commercial" },
      { title: "Written estimates", text: "approved by you before work starts" },
      { title: "Quality parts", text: "genuine & OEM-grade, with bills" },
    ],
    whyTitle: "Why vehicle owners choose us",
    whyIntro:
      "One workshop for every vehicle in the family, run by mechanics who explain the problem before they fix it.",
    whyItems: [
      {
        icon: "users",
        title: "Experienced mechanics",
        text: "Technicians who work on petrol, diesel, CNG and two-wheeler engines every day.",
      },
      {
        icon: "parts",
        title: "Quality spare parts",
        text: "Genuine and OEM-grade parts, with the bill and your old parts shown to you.",
      },
      {
        icon: "rupee",
        title: "Transparent pricing",
        text: "A written estimate before any work begins, and nothing extra without your approval.",
      },
      {
        icon: "clock",
        title: "On-time delivery",
        text: "A realistic ready-by time when you drop off, with updates on WhatsApp.",
      },
      {
        icon: "diagnosis",
        title: "Modern diagnostics",
        text: "Computerised fault scanning to find the real problem instead of guessing.",
      },
      {
        icon: "thumbs-up",
        title: "Work you can check",
        text: "A test drive and a walk-through of the work done when you collect your vehicle.",
      },
    ],
    processTitle: "How a service works",
    processSteps: [
      { title: "Book a slot", text: "Book online, call or WhatsApp us, and tell us what you've noticed." },
      { title: "Inspection & estimate", text: "We inspect the vehicle and share a written estimate before starting." },
      { title: "Repair with your approval", text: "Work starts only once you approve. Extra jobs need your OK too." },
      { title: "Quality check & handover", text: "Final checks, a clean vehicle and an itemised bill." },
    ],
    workshopTitle: "Inside our workshop",
    workshopText:
      "Separate bays for cars and two-wheelers, a vehicle lift, computerised diagnostics and a waiting area. You're welcome to watch the work being done on your vehicle.",
    workshopPoints: [
      "Separate car and two-wheeler bays",
      "Vehicle lift for underbody work",
      "Computerised fault diagnosis",
      "Wheel alignment & balancing",
    ],
    workshopImages: [
      { url: IMG.workshopFloor, alt: "Mechanics working on cars in the workshop" },
      { url: IMG.carOnLift, alt: "A car raised on a vehicle lift" },
      { url: IMG.diagnostics, alt: "Technician running a computer diagnostic inside a car" },
      { url: IMG.toolbox, alt: "Spanners and tools in a tool box" },
    ],
    ctaTitle: "Vehicle due for a service?",
    ctaText: "Book a slot in under a minute. We'll call you to confirm.",
  },

  about: {
    title: "Honest repairs, done properly",
    intro:
      "{name} is an independent workshop for cars, bikes, scooters, auto-rickshaws and light commercial vehicles.",
    story:
      "{name} started as a small two-wheeler repair shop and grew into a full workshop for every vehicle on the road. In {years} years in the trade, we've learnt that customers come back for one reason: they trust what we tell them.\n\nEvery vehicle that comes in gets a proper inspection, a clear explanation of what's wrong and a written estimate. We start work only after you approve it, we use quality spare parts, and we show you the old parts we replace.\n\nWhether it's a family hatchback, a delivery scooter or an auto-rickshaw that needs to be earning again by evening, we treat it like our own.",
    image: IMG.workshopFloor,
    imageAlt: "Mechanics at work inside the garage",
    commitments: [
      {
        icon: "wrench",
        title: "Reliable repairs",
        text: "Faults are diagnosed properly and fixed right the first time, with a test drive before handover.",
      },
      {
        icon: "parts",
        title: "Quality spare parts",
        text: "Genuine and OEM-grade parts from trusted suppliers. Bills and old parts are shown to you.",
      },
      {
        icon: "users",
        title: "Experienced mechanics",
        text: "A team that works on cars, two-wheelers and three-wheelers every day.",
      },
      {
        icon: "rupee",
        title: "Transparent pricing",
        text: "Written estimates, itemised bills and no work without your approval.",
      },
      {
        icon: "thumbs-up",
        title: "Customer satisfaction",
        text: "We keep you updated, and the job isn't done until you're happy with it.",
      },
    ],
    ownerMessage:
      "Bring your vehicle in, tell us what you've noticed, and we'll explain exactly what it needs. No jargon and no pressure.",
    ownerPhoto: "",
  },

  pricing: {
    intro:
      "Fixed-scope service packages for cars and two-wheelers. Pick a package, or book an inspection and we'll recommend what your vehicle actually needs.",
    priceLabel: "Demo estimate",
    disclaimer:
      "All prices are demo estimates for presentation. Final prices depend on the vehicle's make, model and condition and are confirmed after inspection. Extra parts or work are charged only with your approval.",
    faqs: [
      {
        q: "Are these prices final?",
        a: "No. They're starting estimates. We confirm the final price after inspecting your vehicle, and nothing extra is done without your approval.",
      },
      {
        q: "Do you use genuine spare parts?",
        a: "Yes. We use genuine or OEM-grade parts and give you the bill. If you'd like to supply your own parts, mention it when you book.",
      },
      {
        q: "How long does a service take?",
        a: "A basic car service usually takes 3–4 hours and a two-wheeler service 2–3 hours. You'll get a ready-by time when you drop off the vehicle.",
      },
      {
        q: "Which vehicles do you work on?",
        a: "Cars (petrol, diesel and CNG), motorcycles, scooters, auto-rickshaws and light commercial vehicles. If you're not sure, call or WhatsApp us.",
      },
      {
        q: "How can I pay?",
        a: "Cash, UPI and cards are accepted when you collect your vehicle.",
      },
    ],
  },

  branding: {
    accent: "red",
    logoUrl: "",
    showDemoNotice: true,
    demoNoticeText: "Demo website. Business details, prices and reviews are sample content.",
    seoTitle: "",
    seoDescription: "",
  },
};
