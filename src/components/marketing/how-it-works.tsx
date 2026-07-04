import { Check, ImageUp, Rocket, Workflow } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { PIPELINE_STAGES } from "@/lib/pipeline";

const STEPS = [
  {
    icon: ImageUp,
    step: "01",
    title: "Upload one photo",
    description:
      "Any catalog or phone shot works — one product, at least 1024px. We handle background cleanup and color calibration.",
  },
  {
    icon: Workflow,
    step: "02",
    title: "The pipeline renders",
    description:
      "Source normalization, 360° orbit generation, 4K enhancement, and frame extraction run automatically — about 11 minutes end to end.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Publish everywhere",
    description:
      "Embed the viewer on your PDP, drop the orbit video into ads, and export image sets cut to each marketplace's spec.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From flat photo to full product experience
          </h2>
          <p className="mt-4 text-muted-foreground">
            The same pipeline studios charge thousands to replicate — running
            as a managed service.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-250 hover:border-brand/30 hover:shadow-[0_0_32px_-16px_rgba(91,140,255,0.4)]">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background transition-colors duration-250 group-hover:border-brand/40">
                    <step.icon className="size-4.5 text-brand" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-sm text-muted-foreground/50">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {step.step === "02" && (
                  <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                    {PIPELINE_STAGES.slice(1).map((stage) => (
                      <li
                        key={stage.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="size-3 text-success" aria-hidden="true" />
                        {stage.label}
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
                          {stage.engine}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
