import type { Category } from "../presets";

const VALID: Category[] = [
  "accessories",
  "electronics",
  "fashion",
  "furniture",
  "food_beverage",
  "general",
];

/**
 * Stage 0 — Detect product category from the source image via Claude vision.
 *
 * Uses claude-haiku-4-5 (cheap, fast) to classify the photo so the orbit
 * camera is framed correctly. Falls back to null on any failure so the
 * pipeline never blocks — caller keeps the category already on the product.
 */
export async function detectCategory(
  imageUrl: string,
): Promise<Category | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "url", url: imageUrl },
              },
              {
                type: "text",
                text: `Classify this product photo into exactly one category. Reply with only one word from this list: ${VALID.join(", ")}.`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const raw = data.content?.[0]?.text?.trim().toLowerCase() ?? "";
    const match = VALID.find((c) => raw.includes(c));
    return match ?? null;
  } catch {
    return null;
  }
}
