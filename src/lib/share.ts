/**
 * Public share + embed URL helpers.
 *
 * Every hosted viewer link runs through here so the domain lives in one place.
 * Point `NEXT_PUBLIC_SHARE_URL` at a dedicated subdomain (e.g.
 * https://share.orbittify.com) in production; it defaults to the main site.
 */

const SHARE_BASE = (
  process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com"
).replace(/\/$/, "");

/** Public, account-free viewer page for a completed product. */
export function shareUrl(slug: string): string {
  return `${SHARE_BASE}/view/${slug}`;
}

/** Bare viewer served inside merchant `<iframe>` embeds. */
export function embedUrl(slug: string): string {
  return `${SHARE_BASE}/embed/${slug}`;
}

/** CDN origin that serves the drop-in `<script>` widget. */
export function widgetSrc(): string {
  return `${SHARE_BASE}/widget.js`;
}
