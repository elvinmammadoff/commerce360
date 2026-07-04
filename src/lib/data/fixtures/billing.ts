import type { CreditPack, Invoice, PaymentMethod, Plan } from "@/lib/types";

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For your first product pages",
    priceMonthly: 29,
    priceYearly: 24,
    creditsPerMonth: 20,
    frameResolution: "2048²",
    videoResolution: "1080p",
    seats: 2,
    features: [
      "20 renders per month",
      "360° viewer + embed code",
      "Orbit video in 1080p",
      "72 frames at 2048²",
      "Amazon & Shopify image sets",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For catalogs that ship weekly",
    priceMonthly: 79,
    priceYearly: 66,
    creditsPerMonth: 80,
    frameResolution: "2048²",
    videoResolution: "4K",
    seats: 5,
    highlighted: true,
    features: [
      "80 renders per month",
      "Everything in Starter",
      "Orbit video in 4K",
      "Priority render queue",
      "Hosted share pages",
      "Version history & re-renders",
      "Chat support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For teams automating their pipeline",
    priceMonthly: 199,
    priceYearly: 166,
    creditsPerMonth: 250,
    frameResolution: "4K",
    videoResolution: "4K",
    seats: 15,
    features: [
      "250 renders per month",
      "Everything in Growth",
      "Frames at native 4K",
      "REST API & webhooks",
      "Bulk upload (CSV / feed)",
      "Dedicated render capacity",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For marketplaces and retail groups",
    priceMonthly: null,
    priceYearly: null,
    creditsPerMonth: null,
    frameResolution: "4K",
    videoResolution: "4K",
    seats: null,
    features: [
      "Custom credit pools",
      "White-label viewer & share pages",
      "SSO / SAML",
      "99.9% uptime SLA",
      "Custom render pipelines",
      "Dedicated success manager",
    ],
  },
];

export const creditPacks: CreditPack[] = [
  { id: "pack_25", credits: 25, price: 39, perCredit: 1.56 },
  { id: "pack_100", credits: 100, price: 129, perCredit: 1.29, bestValue: true },
  { id: "pack_500", credits: 500, price: 549, perCredit: 1.1 },
];

export const invoices: Invoice[] = [
  {
    id: "INV-2026-0612",
    date: "2026-07-26T09:00:00Z",
    description: "Growth plan · monthly",
    amount: 79,
    status: "upcoming",
  },
  {
    id: "INV-2026-0583",
    date: "2026-06-26T09:00:00Z",
    description: "Growth plan · monthly",
    amount: 79,
    status: "paid",
  },
];

export const paymentMethod: PaymentMethod = {
  brand: "visa",
  last4: "4242",
  expMonth: 9,
  expYear: 2028,
};
