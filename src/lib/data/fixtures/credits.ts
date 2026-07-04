import type { CreditEntry } from "@/lib/types";

/**
 * Credit ledger, newest first. Wallet model: plan renewal adds credits,
 * generations spend one, failures auto-refund. Running balance is
 * consistent top to bottom (current balance: 75).
 */
export const creditLedger: CreditEntry[] = [
  {
    id: "led_010",
    type: "generation",
    description: "Aria Bouclé Armchair — Ivory · v1 render",
    amount: -1,
    balanceAfter: 75,
    createdAt: "2026-07-04T11:32:00Z",
  },
  {
    id: "led_009",
    type: "refund",
    description: "Kestrel Task Chair — Graphite · failed render refunded",
    amount: 1,
    balanceAfter: 76,
    createdAt: "2026-07-02T14:11:00Z",
  },
  {
    id: "led_008",
    type: "generation",
    description: "Kestrel Task Chair — Graphite · v1 render",
    amount: -1,
    balanceAfter: 75,
    createdAt: "2026-07-02T14:02:00Z",
  },
  {
    id: "led_007",
    type: "generation",
    description: "Solvei Upholstered Bed — Dove Grey · v2 render (4K upscale)",
    amount: -1,
    balanceAfter: 76,
    createdAt: "2026-07-01T16:05:00Z",
  },
  {
    id: "led_006",
    type: "generation",
    description: "Vireo Lounge Chair — Oxblood Velvet · v3 render (4K upscale)",
    amount: -1,
    balanceAfter: 77,
    createdAt: "2026-06-30T11:18:00Z",
  },
  {
    id: "led_005",
    type: "generation",
    description: "Solvei Upholstered Bed — Dove Grey · v1 render",
    amount: -1,
    balanceAfter: 78,
    createdAt: "2026-06-28T15:44:00Z",
  },
  {
    id: "led_004",
    type: "generation",
    description: "Vireo Lounge Chair — Oxblood Velvet · v2 render",
    amount: -1,
    balanceAfter: 79,
    createdAt: "2026-06-27T10:31:00Z",
  },
  {
    id: "led_003",
    type: "refund",
    description: "Vireo Lounge Chair — Oxblood Velvet · failed render refunded",
    amount: 1,
    balanceAfter: 80,
    createdAt: "2026-06-27T10:14:00Z",
  },
  {
    id: "led_002",
    type: "generation",
    description: "Vireo Lounge Chair — Oxblood Velvet · v1 render",
    amount: -1,
    balanceAfter: 79,
    createdAt: "2026-06-27T10:02:00Z",
  },
  {
    id: "led_001",
    type: "plan_grant",
    description: "Growth plan · monthly credits",
    amount: 80,
    balanceAfter: 80,
    createdAt: "2026-06-26T09:00:00Z",
  },
];
