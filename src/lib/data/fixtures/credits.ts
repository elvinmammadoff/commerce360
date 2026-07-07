import type { CreditEntry } from "@/lib/types";

/**
 * Credit ledger, newest first. One-time wallet model: a free credit on signup,
 * one-time credit-pack purchases add credits, generations spend one, failures
 * auto-refund. Running balance is consistent top to bottom (current balance:
 * 26 — from 1 free + 30 purchased credits, less 7 renders, plus 2 refunds).
 */
export const creditLedger: CreditEntry[] = [
  {
    id: "led_012",
    type: "generation",
    description: "Aria Bouclé Armchair — Ivory · v1 render",
    amount: -1,
    balanceAfter: 26,
    createdAt: "2026-07-04T11:32:00Z",
  },
  {
    id: "led_011",
    type: "refund",
    description: "Kestrel Task Chair — Graphite · failed render refunded",
    amount: 1,
    balanceAfter: 27,
    createdAt: "2026-07-02T14:11:00Z",
  },
  {
    id: "led_010",
    type: "generation",
    description: "Kestrel Task Chair — Graphite · v1 render",
    amount: -1,
    balanceAfter: 26,
    createdAt: "2026-07-02T14:02:00Z",
  },
  {
    id: "led_009",
    type: "generation",
    description: "Solvei Upholstered Bed — Dove Grey · v2 render (4K upscale)",
    amount: -1,
    balanceAfter: 27,
    createdAt: "2026-07-01T16:05:00Z",
  },
  {
    id: "led_008",
    type: "pack_purchase",
    description: "Workshop pack · 25 credits · Stripe",
    amount: 25,
    balanceAfter: 28,
    createdAt: "2026-07-01T12:00:00Z",
  },
  {
    id: "led_007",
    type: "generation",
    description: "Vireo Lounge Chair — Oxblood Velvet · v3 render (4K upscale)",
    amount: -1,
    balanceAfter: 3,
    createdAt: "2026-06-30T11:18:00Z",
  },
  {
    id: "led_006",
    type: "generation",
    description: "Solvei Upholstered Bed — Dove Grey · v1 render",
    amount: -1,
    balanceAfter: 4,
    createdAt: "2026-06-28T15:44:00Z",
  },
  {
    id: "led_005",
    type: "generation",
    description: "Vireo Lounge Chair — Oxblood Velvet · v2 render",
    amount: -1,
    balanceAfter: 5,
    createdAt: "2026-06-27T10:31:00Z",
  },
  {
    id: "led_004",
    type: "refund",
    description: "Vireo Lounge Chair — Oxblood Velvet · failed render refunded",
    amount: 1,
    balanceAfter: 6,
    createdAt: "2026-06-27T10:14:00Z",
  },
  {
    id: "led_003",
    type: "generation",
    description: "Vireo Lounge Chair — Oxblood Velvet · v1 render",
    amount: -1,
    balanceAfter: 5,
    createdAt: "2026-06-27T10:02:00Z",
  },
  {
    id: "led_002",
    type: "pack_purchase",
    description: "Studio pack · 5 credits · Stripe",
    amount: 5,
    balanceAfter: 6,
    createdAt: "2026-06-26T09:05:00Z",
  },
  {
    id: "led_001",
    type: "bonus",
    description: "1 free credit on signup",
    amount: 1,
    balanceAfter: 1,
    createdAt: "2026-06-26T09:00:00Z",
  },
];
