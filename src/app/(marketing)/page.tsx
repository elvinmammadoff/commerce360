import { Demo } from "@/components/marketing/demo";
import { FaqSection } from "@/components/marketing/faq-section";
import { Features } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Logos } from "@/components/marketing/logos";
import { ProductPipeline } from "@/components/marketing/product-pipeline";
import { PricingSection } from "@/components/marketing/pricing-section";
// Testimonials temporarily disabled until we have real customer quotes.
// Re-enable: uncomment the import, the getTestimonials() fetch, and the
// <Testimonials /> render below.
// import { Testimonials } from "@/components/marketing/testimonials";
import { Waitlist } from "@/components/marketing/waitlist";
import { getCreditPacks, getFaqs } from "@/lib/data";

// Pin the Node.js runtime so the waitlist server action can use node:dns for
// MX resolution (unavailable on the Edge runtime).
export const runtime = "nodejs";

export default async function LandingPage() {
  const [packs, faqs] = await Promise.all([
    getCreditPacks(),
    getFaqs(),
  ]);

  return (
    <>
      <Hero />
      <Waitlist />
      <Logos />
      <ProductPipeline />
      <HowItWorks />
      <Features />
      <Demo />
      {/* Testimonials temporarily disabled — restore once real quotes exist. */}
      {/* <Testimonials items={testimonials} /> */}
      <PricingSection packs={packs} />
      <FaqSection items={faqs} />
      <FinalCta />
    </>
  );
}
