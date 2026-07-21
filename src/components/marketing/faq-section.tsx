"use client";

import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { GradientBorder } from "@/components/marketing/gradient-border";
import { SectionGlow } from "@/components/marketing/section-glow";
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
      className="relative scroll-mt-24 py-24 sm:py-28"
    >
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      <SectionGlow placement="right" tone="violet" size="34rem" intensity={0.07} />
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <motion.div {...reveal()} className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-display-sm mt-5 text-balance bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
              Answers before you ask
            </h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground/70">
              Anything else? Write to{" "}
              <a
                href="mailto:support@orbittify.com"
                className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-brand"
              >
                support@orbittify.com
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
                  className="group/item relative overflow-hidden rounded-xl bg-card ring-1 ring-border transition-colors duration-200 not-last:border-b-0 hover:ring-brand/25 data-[state=open]:ring-brand/30"
                >
                  <GradientBorder className="opacity-0 transition-opacity duration-300 group-hover/item:opacity-60 group-data-[state=open]/item:opacity-100" />
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger className="group/faq relative flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset">
                      {faq.question}
                      <Plus
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-300 ease-out-quart group-data-[state=open]/faq:rotate-45 group-data-[state=open]/faq:text-brand"
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
