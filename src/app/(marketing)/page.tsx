import { Demo } from "@/components/marketing/demo";
import { FaqSection } from "@/components/marketing/faq-section";
import { Features } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Logos } from "@/components/marketing/logos";
import { ProductPipeline } from "@/components/marketing/product-pipeline";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Testimonials } from "@/components/marketing/testimonials";
import { getCreditPacks, getFaqs, getTestimonials } from "@/lib/data";

export default async function LandingPage() {
  const [packs, testimonials, faqs] = await Promise.all([
    getCreditPacks(),
    getTestimonials(),
    getFaqs(),
  ]);

  return (
    <>
      <Hero />
      <Logos />
      <ProductPipeline />
      <HowItWorks />
      <Features />
      <Demo />
      <Testimonials items={testimonials} />
      <PricingSection packs={packs} />
      <FaqSection items={faqs} />
      <FinalCta />
    </>
  );
}
