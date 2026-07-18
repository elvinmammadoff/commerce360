import type { ProductCategory } from "@/lib/types";

/**
 * Lightweight keyword classifier used in the demo where no worker/vision call
 * runs. Production detection happens in the worker from the actual photo; this
 * mirrors the "AI auto-detect" behaviour client-side so the merchant never
 * picks a category by hand. Falls back to "seating" — the most common case.
 */
const KEYWORDS: [ProductCategory, RegExp][] = [
  ["beds", /\b(bed|mattress|headboard|bunk|crib)\b/i],
  ["sofas", /\b(sofa|couch|sectional|loveseat|settee)\b/i],
  ["lighting", /\b(lamp|light|pendant|chandelier|sconce|lantern)\b/i],
  ["tables", /\b(table|desk|nightstand|console|stand)\b/i],
  ["storage", /\b(shelf|shelving|cabinet|dresser|wardrobe|drawer|bookcase|sideboard)\b/i],
  ["seating", /\b(chair|stool|bench|armchair|recliner|ottoman|seat)\b/i],
];

export function guessCategory(...text: (string | undefined)[]): ProductCategory {
  const haystack = text.filter(Boolean).join(" ");
  for (const [category, pattern] of KEYWORDS) {
    if (pattern.test(haystack)) return category;
  }
  return "seating";
}

const LABELS: Record<ProductCategory, string> = {
  seating: "Seating",
  sofas: "Sofas",
  beds: "Beds",
  tables: "Tables",
  lighting: "Lighting",
  storage: "Storage",
};

export function categoryLabel(category: ProductCategory): string {
  return LABELS[category];
}
