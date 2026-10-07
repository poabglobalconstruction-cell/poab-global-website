export const COMPANY_INFO = {
  name: "POAB Global Construction Company Ltd",
  shortName: "POAB Global",
  cacNumber: "9896965",
  rcNumber: "RC 9896965",
  officialEmail: "poabglobalconstruction@gmail.com",
  headOffice: "Ibadan, Oyo State, Nigeria",
  operationsCoverage: "Lagos and Nationwide",
  experienceStatement: "11 years of hands-on site engineering experience",
  customerPromise: "Affordable cost, honest quotation, and foundation to finish delivery.",
  tagline: "Building Houses That Stand The Test Of Time.",
  coreProposition: "Complete building delivery from foundation to finishing.",
  positioning: "Foundation to Finish Construction & Property Services",
} as const;

export const DEFAULT_BUDGET_OPTIONS = [
  "Below ₦15,000,000",
  "₦15,000,000 - ₦30,000,000",
  "₦30,000,000 - ₦60,000,000",
  "₦60,000,000 - ₦120,000,000",
  "Above ₦120,000,000",
  "Prefer to discuss",
] as const;

export const DEFAULT_TIMELINE_OPTIONS = [
  "Immediately / Within 1 month",
  "1 - 3 months",
  "3 - 6 months",
  "Planning stage / Flexible",
] as const;

export const PROJECT_TYPES = [
  "Bungalow",
  "Duplex",
  "Luxury Home",
  "Apartments",
  "Commercial",
  "Renovation",
  "Perimeter / Site Work",
  "Other",
] as const;

export const CONSTRUCTION_STAGES = [
  { id: "site-prep", title: "Site Preparation & Securing", desc: "Setting out, clearing, perimeter fencing, and staging site security." },
  { id: "excavation", title: "Excavation & Trenching", desc: "Straight trench excavation to proper depth and verified trench alignment." },
  { id: "foundation", title: "Foundation Blockwork & Casting", desc: "Solid foundation blockwork, steel reinforcement, and solid concrete filling." },
  { id: "structural", title: "Superstructure & Slab Casting", desc: "Disciplined blockwork alignment, lintels, columns, and structural concrete slabs." },
  { id: "roofing", title: "Roofing & Carcass Sealing", desc: "Solid roof trusses, timber treatment, durable roof coverings, and rainwater drainage." },
  { id: "finishing", title: "Finishing & Installations", desc: "High-grade plastering, plumbing, electrical conduit, tiling, screeding, and painting." },
  { id: "handover", title: "Inspection & Handover", desc: "Quality review, site clean-up, snag resolution, and keys handover to the client." },
] as const;

export const CONSTRUCTION_PRINCIPLES = [
  {
    title: "Straight Trench Excavation & Proper Depth",
    desc: "A solid building begins beneath the soil. We adhere strictly to proper excavation depths and level alignment.",
  },
  {
    title: "Solid Foundation Blockwork & Concrete Filling",
    desc: "No cutting corners on cement-to-aggregate ratios. Every hollow section is vibrated and fully filled with dense concrete.",
  },
  {
    title: "Professional Site Supervision",
    desc: "Daily hands-on site supervision ensuring structural drawings are executed without deviation.",
  },
  {
    title: "Stage-by-Stage Documentation",
    desc: "Clients receive transparent photographic proof and updates at every milestone, from excavation to finishing.",
  },
] as const;
