"use client";

import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { Eyebrow } from "@/components/marketing/section-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type { Faq } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FaqSection({ items }: { items: Faq[] }) {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16, filter: "blur(5px)" },
          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-border bg-[#070707] py-24 sm:py-28"
    >
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <motion.div {...reveal()} className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-display-sm mt-4 text-balance">
              Answers before you ask
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Anything else? Write to{" "}
              <a
                href="mailto:support@commerce360.ai"
                className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
              >
                support@commerce360.ai
              </a>{" "}
              — a human replies within a business day.
            </p>
          </motion.div>

          <motion.div {...reveal(0.08)}>
            <Accordion type="single" collapsible className="flex flex-col gap-2">
              {items.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="overflow-hidden rounded-xl bg-card ring-1 ring-border transition-colors duration-200 not-last:border-b-0 hover:ring-foreground/20 data-[state=open]:ring-foreground/20"
                >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger className="group/faq flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset">
                      {faq.question}
                      <Plus
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-quart group-data-[state=open]/faq:rotate-45"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
