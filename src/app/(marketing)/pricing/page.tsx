import type { Metadata } from "next";

import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Reveal } from "@/components/marketing/reveal";
import { formatCurrency } from "@/lib/format";
import { getCreditPacks, getFaqs, getPlans } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple credit-based pricing: one credit renders one product into a 360° viewer, orbit video, 72 frames, and marketplace sets.",
};

export default async function PricingPage() {
  const [plans, packs, faqs] = await Promise.all([
    getPlans(),
    getCreditPacks(),
    getFaqs(),
  ]);
  const billingFaqs = faqs.filter((faq) =>
    /credit|roll over|commercial/i.test(faq.question),
  );

  return (
    <div className="pt-16">
      <PricingSection
        plans={plans}
        heading="Start free. Pay for what you render."
        id="plans"
      />

      <section className="border-t border-border bg-[#070707] py-20">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Need more mid-cycle? Top up.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Packs stack on your plan credits and never expire while your
              subscription is active.
            </p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {packs.map((pack, i) => (
              <Reveal key={pack.id} delay={i * 0.06}>
                <div className="rounded-2xl border border-border bg-card p-6 text-center transition-colors duration-250 hover:border-brand/30">
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {pack.credits}
                  </p>
                  <p className="text-sm text-muted-foreground">credits</p>
                  <p className="mt-4 text-lg font-medium">
                    {formatCurrency(pack.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(pack.perCredit, true)} per render
                    {pack.bestValue && (
                      <span className="ml-1.5 text-success">· best value</span>
                    )}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={billingFaqs.length > 0 ? billingFaqs : faqs.slice(0, 4)} />
      <FinalCta />
    </div>
  );
}
