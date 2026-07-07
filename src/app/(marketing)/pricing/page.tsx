import type { Metadata } from "next";

import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { PricingSection } from "@/components/marketing/pricing-section";
import { getCreditPacks, getFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One-time credit pricing: one credit renders one product into a 360° viewer, orbit video, 72 frames, and marketplace sets. Credits never expire.",
};

export default async function PricingPage() {
  const [packs, faqs] = await Promise.all([getCreditPacks(), getFaqs()]);
  const billingFaqs = faqs.filter((faq) =>
    /credit|expire|commercial/i.test(faq.question),
  );

  return (
    <div className="pt-16">
      <PricingSection packs={packs} id="packs" />

      <FaqSection items={billingFaqs.length > 0 ? billingFaqs : faqs.slice(0, 4)} />
      <FinalCta />
    </div>
  );
}
