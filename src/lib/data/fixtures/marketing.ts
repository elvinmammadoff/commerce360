import type { Faq, Testimonial } from "@/lib/types";

export const trustedByBrands = [
  "Møbelhuset Nord",
  "Casa Verde",
  "Volt & Vine",
  "Atelier Ruben",
  "Nordvik Living",
  "Hemlund & Co.",
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "We shot our entire spring collection without booking a camera. 214 SKUs went live with 360° viewers in under two weeks.",
    name: "Linnea Voss",
    title: "E-commerce Director",
    company: "Møbelhuset Nord",
    initials: "LV",
  },
  {
    quote:
      "Returns on upholstered seating dropped 11% the quarter we added orbit videos to our product pages. Customers finally see the back of the sofa.",
    name: "Marcus Bell",
    title: "Head of Digital",
    company: "Casa Verde Interiors",
    initials: "MB",
  },
  {
    quote:
      "Our Amazon listings finally look like the big brands'. The marketplace set alone pays for the credit.",
    name: "Dana Whitfield",
    title: "Marketplace Lead",
    company: "Volt & Vine Electronics",
    initials: "DW",
  },
  {
    quote:
      "From a single photo to PDP-ready assets in eleven minutes. Our old studio partner quoted three weeks for the same deliverables.",
    name: "Tomás Herrera",
    title: "Founder",
    company: "Atelier Ruben",
    initials: "TH",
  },
  {
    quote:
      "The API slots straight into our Shopify pipeline — new SKUs get a 360° viewer automatically on publish.",
    name: "Priya Nair",
    title: "CTO",
    company: "Nordvik Living",
    initials: "PN",
  },
  {
    quote:
      "The first tool our merchandising team adopted without being asked twice. The share pages sell it internally for us.",
    name: "Sofia Andersson",
    title: "VP Merchandising",
    company: "Hemlund & Co.",
    initials: "SA",
  },
];

export const faqs: Faq[] = [
  {
    question: "What exactly do I get from one photo?",
    answer:
      "Each render produces an interactive 360° viewer with embed code, a seamless orbit video (up to 4K), 72 studio frames at 5° intervals, and marketplace-ready image sets for Amazon, Shopify, Etsy, and Wayfair — bundled into one downloadable package.",
  },
  {
    question: "What makes a good source photo?",
    answer:
      "One product, front-facing or at a slight angle, at least 1024px on the short edge. Neutral backgrounds help but aren't required — normalization removes backgrounds and calibrates color automatically.",
  },
  {
    question: "How long does a render take?",
    answer:
      "Typically 10–12 minutes end to end: source normalization, orbit rendering, 4K enhancement, frame extraction, and packaging. You'll get a notification the moment it's ready.",
  },
  {
    question: "What counts as a credit?",
    answer:
      "One credit = one full render of one product, including every output format. Re-renders with different settings cost one credit each. Failed renders are refunded automatically.",
  },
  {
    question: "Do credits expire?",
    answer:
      "Never. Credits are a one-time purchase that live in your workspace wallet indefinitely — there's no subscription and nothing to cancel. Buy more whenever you need them.",
  },
  {
    question: "Who hosts the 360° viewer — is there a monthly fee?",
    answer:
      "We do, and there's no separate hosting bill. Every render includes hosting, the global CDN, and the share page for the life of your account — the credit you spend covers it. No subscription, no per-view charge; just top up credits as you add products.",
  },
  {
    question: "Can I use the assets commercially?",
    answer:
      "Yes — you own everything we generate from your photos, with full commercial rights and no watermarks on any credit pack.",
  },
  {
    question: "How do the marketplace image sets work?",
    answer:
      "We export to each marketplace's spec automatically: pure-white backgrounds and 2000px+ squares for Amazon, 2048² for Shopify, plus lifestyle-ready angles. No manual cropping.",
  },
  {
    question: "Is there an API?",
    answer:
      "Yes. A REST API with webhooks is available so new SKUs from your PIM or Shopify feed can be rendered automatically — each render simply draws one credit from your wallet. Docs live in the dashboard.",
  },
];

export const heroStats = [
  { value: 72, suffix: "", label: "frames per product" },
  { value: 4, suffix: "K", label: "orbit video output" },
  { value: 11, suffix: " min", label: "photo to publish" },
];
