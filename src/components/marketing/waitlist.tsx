"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, CircleCheck, Loader2, Mail, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { joinWaitlist } from "@/app/actions/waitlist";
import { Eyebrow } from "@/components/marketing/section-header";
import { SectionGlow } from "@/components/marketing/section-glow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EASE = [0.16, 1, 0.3, 1] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success";

export function Waitlist() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = React.useState("");
  // Honeypot: real users never fill this; bots that auto-fill every field do.
  const [company, setCompany] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const enter = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14, filter: "blur(5px)" },
          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setStatus("loading");
    joinWaitlist(value, company)
      .then(({ error: serverError }) => {
        if (serverError) {
          setError(serverError);
          setStatus("idle");
        } else {
          setStatus("success");
          setModalOpen(true);
        }
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      });
  };

  return (
    <section
      id="waitlist"
      aria-labelledby="waitlist-title"
      className="relative scroll-mt-24 py-24 sm:py-28"
    >
      <div className="container-page">
        <motion.div
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-60px" },
                transition: { duration: 0.6, ease: EASE },
              })}
          className="gradient-ring relative isolate overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a0a0d] px-6 py-16 text-center shadow-[0_50px_140px_-50px_rgba(91,140,255,0.45)] sm:px-14 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(560px_300px_at_50%_0,black,transparent)]"
          />
          <SectionGlow placement="top-center" tone="blue" size="34rem" intensity={0.14} drift />
          <div
            aria-hidden="true"
            className="aurora-slow pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.16),transparent_65%)] blur-2xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <motion.div {...enter(0.04)} className="flex justify-center">
              <Eyebrow>Early access · Founding members</Eyebrow>
            </motion.div>

            <motion.h2
              {...enter(0.1)}
              id="waitlist-title"
              className="text-display-sm mx-auto mt-5 max-w-xl text-balance"
            >
              <span className="text-sheen block">
                One product photo in.
              </span>
              <span className="block bg-linear-to-r from-[#5B8CFF] to-[#a855f7] bg-clip-text text-transparent">
                A complete asset pipeline out.
              </span>
            </motion.h2>

            <motion.p
              {...enter(0.18)}
              className="mx-auto mt-5 max-w-lg text-pretty text-muted-foreground"
            >
              Commerce360 turns a single product photo into AI-powered ecommerce
              content — studio image sets, 360° viewers, and motion — ready for
              every storefront. Join the waitlist to lock in priority onboarding
              and a limited founding-member seat.
            </motion.p>

            <motion.div {...enter(0.26)} className="mx-auto mt-9 max-w-lg">
              <form onSubmit={onSubmit} noValidate>
                {/* Honeypot: hidden from users, tabbing and screen readers.
                    Bots that fill every field trip it and get a fake success. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[9999px] size-px overflow-hidden opacity-0"
                >
                  <label htmlFor="waitlist-company">
                    Company (leave this field empty)
                  </label>
                  <input
                    id="waitlist-company"
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <label htmlFor="waitlist-email" className="sr-only">
                      Email address
                    </label>
                    <Input
                      ref={inputRef}
                      id="waitlist-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={status === "loading"}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "waitlist-error" : undefined}
                      className="h-11 rounded-xl border-white/12 bg-white/[0.03] pl-10 text-sm md:text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={status === "loading"}
                    className="h-11 shrink-0 rounded-xl border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] px-6 text-white shadow-[0_8px_28px_-8px_rgba(124,92,246,0.6)] hover:text-white hover:shadow-[0_10px_34px_-6px_rgba(124,92,246,0.85)]"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" />
                        Joining
                      </>
                    ) : (
                      <>
                        Join waitlist
                        <ArrowRight aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <p
                    id="waitlist-error"
                    role="alert"
                    className="mt-2.5 text-left text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <WaitlistSuccessModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}

function WaitlistSuccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#0a0a0d]/95 p-8 text-center shadow-[0_50px_140px_-40px_rgba(124,92,246,0.6)] outline-none backdrop-blur-xl duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_65%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(340px_200px_at_50%_0,black,transparent)]"
          />

          <div className="relative">
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute -top-2 -right-2 text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>

            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-brand/25 bg-brand/[0.08] ring-1 ring-brand/20 shadow-[0_0_40px_-8px_rgba(124,92,246,0.7)]">
              <CircleCheck className="size-8 text-brand" aria-hidden="true" />
            </div>

            <DialogPrimitive.Title className="font-heading mt-6 text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
              You&apos;re on the list.
            </DialogPrimitive.Title>

            <DialogPrimitive.Description className="mx-auto mt-4 max-w-sm space-y-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              <span className="block">
                Thanks for joining the Commerce360 waitlist.
              </span>
              <span className="block">
                We&apos;ll notify you as soon as early access becomes available.
              </span>
              <span className="block">
                We&apos;re onboarding users in small batches to ensure the best
                experience.
              </span>
            </DialogPrimitive.Description>

            <DialogPrimitive.Close asChild>
              <Button
                size="lg"
                className="mt-8 w-full rounded-xl border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_28px_-8px_rgba(124,92,246,0.6)] hover:text-white hover:shadow-[0_10px_34px_-6px_rgba(124,92,246,0.85)]"
              >
                Continue exploring
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
