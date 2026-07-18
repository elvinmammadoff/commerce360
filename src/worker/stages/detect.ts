import type { Category } from "../presets";

const VALID: Category[] = [
  "seating",
  "sofas",
  "beds",
  "tables",
  "lighting",
  "storage",
];

/**
 * Stage 0 — Detect product category from the source image.
 *
 * A single vision call classifies the uploaded photo so the orbit camera is
 * framed correctly (chair at eye level, table angled down, etc.). We never
 * trust a merchant-picked category — the photo is the source of truth.
 *
 * Uses an OpenAI-compatible vision endpoint when `VISION_API_KEY` is set.
 * Without it (or on any failure) we return `null` and the caller keeps the
 * category already on the product, so the pipeline never blocks on detection.
 */
export async function detectCategory(
  imageUrl: string,
): Promise<Category | null> {
  const apiKey = process.env.VISION_API_KEY;
  if (!apiKey) return null;

  const base = process.env.VISION_API_BASE ?? "https://api.openai.com/v1";
  const model = process.env.VISION_MODEL ?? "gpt-4o-mini";

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 5,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Classify this product photo into exactly one category. Reply with only the single word: ${VALID.join(
                  ", ",
                )}.`,
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "";
    const match = VALID.find((c) => raw.includes(c));
    return match ?? null;
  } catch {
    // Network/parse failure — fall back to the product's existing category.
    return null;
  }
}
