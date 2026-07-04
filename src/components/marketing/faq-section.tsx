import { Reveal } from "@/components/marketing/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/lib/types";

export function FaqSection({ items }: { items: Faq[] }) {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-border bg-[#070707] py-24">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal>
            <p className="text-sm font-medium text-brand">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
              Answers before you ask
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Anything else? Write to{" "}
              <a
                href="mailto:support@commerce360.ai"
                className="text-foreground underline underline-offset-4 hover:text-brand"
              >
                support@commerce360.ai
              </a>{" "}
              — a human replies within a business day.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-2">
            <Accordion type="single" collapsible className="w-full">
              {items.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-left text-[15px] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
