import type { CreditPlan, PaymentMethod, Purchase } from "@/lib/types";

/**
 * Public, one-time credit purchase plans. Credits never expire and there is no
 * subscription — each plan is a single Stripe checkout.
 */
export const creditPlans: CreditPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    credits: 1,
    perProduct: 9,
    cta: "Buy Starter",
    features: [
      "1 complete render",
      "4K MP4",
      "72 frames",
      "Public share page",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: 40,
    credits: 5,
    perProduct: 8,
    highlighted: true,
    cta: "Buy Studio",
    features: ["Everything in Starter", "Bulk rendering"],
  },
  {
    id: "workshop",
    name: "Workshop",
    price: 175,
    credits: 25,
    perProduct: 7,
    cta: "Buy Workshop",
    features: ["Everything in Studio", "Priority render queue"],
  },
  {
    id: "factory",
    name: "Factory",
    price: 600,
    credits: 100,
    perProduct: 6,
    cta: "Buy Factory",
    features: ["Everything in Workshop", "Dedicated processing"],
  },
];

/**
 * One-time Stripe purchase history, newest first. No recurring invoices.
 * Settled purchases (status "succeeded") add up to the wallet's total
 * purchased credits (30); the "processing" charge has not settled yet.
 */
export const purchases: Purchase[] = [
  {
    id: "pi_3Q7FactoryProc00",
    packName: "Factory",
    credits: 100,
    amount: 600,
    purchasedAt: "2026-07-05T08:30:00Z",
    status: "processing",
  },
  {
    id: "pi_3Q1WorkshopPaid0",
    packName: "Workshop",
    credits: 25,
    amount: 175,
    purchasedAt: "2026-07-01T12:00:00Z",
    status: "succeeded",
  },
  {
    id: "pi_3Q0StudioPaid000",
    packName: "Studio",
    credits: 5,
    amount: 40,
    purchasedAt: "2026-06-26T09:05:00Z",
    status: "succeeded",
  },
];

export const paymentMethod: PaymentMethod = {
  brand: "visa",
  last4: "4242",
  expMonth: 9,
  expYear: 2028,
};
