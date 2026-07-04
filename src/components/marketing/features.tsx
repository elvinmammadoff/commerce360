import {
  Code2,
  Film,
  Images,
  Rotate3d,
  Share2,
  Store,
} from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

const FEATURES = [
  {
    icon: Rotate3d,
    title: "Interactive 360° viewer",
    description:
      "Drag-to-rotate, keyboard accessible, 28 KB embed. Drops into Shopify, WooCommerce, or any PDP with one snippet.",
  },
  {
    icon: Film,
    title: "4K orbit video",
    description:
      "A seamless loop for product pages, paid social, and retail screens. H.265, alpha-ready, broadcast clean.",
  },
  {
    icon: Images,
    title: "72 studio frames",
    description:
      "Every 5° of your product at 2048² and up, color-matched to the source photo. Pick hero angles in seconds.",
  },
  {
    icon: Store,
    title: "Marketplace sets",
    description:
      "Amazon, Shopify, Etsy, and Wayfair specs exported automatically — white backgrounds, exact dimensions, zero cropping.",
  },
  {
    icon: Code2,
    title: "API & webhooks",
    description:
      "Render on publish: connect your PIM or product feed and new SKUs come out the other side with full asset sets.",
  },
  {
    icon: Share2,
    title: "Share pages & team",
    description:
      "Hosted viewer pages for buyers and internal sign-off, with roles, version history, and re-renders built in.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-t border-border bg-[#070707] py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">Everything included</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One render. Every format your channels ask for.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each credit produces the complete set — no add-ons, no per-format
            pricing.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-250 hover:border-brand/30 hover:shadow-[0_0_32px_-16px_rgba(91,140,255,0.4)]">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background transition-colors duration-250 group-hover:border-brand/40">
                  <feature.icon className="size-4.5 text-brand" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
