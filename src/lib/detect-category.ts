import type { ProductCategory } from "@/lib/types";

/**
 * Lightweight keyword classifier used client-side (upload form auto-detect).
 * Real detection happens in the worker via Claude vision; this mirrors that
 * behavior so the merchant sees a reasonable guess before the job runs.
 * Falls back to "general".
 */
const KEYWORDS: [ProductCategory, RegExp][] = [
  ["accessories", /\b(bag|handbag|purse|wallet|watch|jewelry|jewellery|bracelet|necklace|ring|earring|sunglasses|belt|hat|cap|scarf|glove|backpack|clutch|tote|satchel)\b/i],
  ["electronics", /\b(phone|smartphone|laptop|tablet|computer|keyboard|mouse|monitor|headphone|earphone|earbud|camera|speaker|tv|television|console|charger|cable|router|drone|smartwatch)\b/i],
  ["fashion", /\b(shirt|dress|jacket|coat|shoe|boot|sneaker|trouser|pant|jeans|skirt|top|blouse|sweater|hoodie|suit|clothing|apparel|garment|outfit)\b/i],
  ["furniture", /\b(chair|sofa|couch|bed|table|desk|shelf|cabinet|wardrobe|dresser|lamp|light|pendant|chandelier|bench|stool|ottoman|recliner|nightstand|bookcase)\b/i],
  ["food_beverage", /\b(bottle|jar|can|box|package|food|drink|beverage|sauce|oil|wine|coffee|tea|supplement|vitamin|protein)\b/i],
];

export function guessCategory(...text: (string | undefined)[]): ProductCategory {
  const haystack = text.filter(Boolean).join(" ");
  for (const [category, pattern] of KEYWORDS) {
    if (pattern.test(haystack)) return category;
  }
  return "general";
}

const LABELS: Record<ProductCategory, string> = {
  accessories: "Accessories",
  electronics: "Electronics",
  fashion: "Fashion",
  furniture: "Furniture",
  food_beverage: "Food & Beverage",
  general: "General",
};

export function categoryLabel(category: ProductCategory): string {
  return LABELS[category];
}
