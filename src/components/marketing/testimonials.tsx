import { Reveal } from "@/components/marketing/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Testimonial } from "@/lib/types";

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 border-t border-border bg-[#070707] py-24"
    >
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">Customers</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Teams that stopped booking studios
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((testimonial, i) => (
            <Reveal key={testimonial.name} delay={(i % 3) * 0.08}>
              <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 transition-all duration-250 hover:border-brand/25">
                <blockquote className="text-[15px] leading-relaxed text-foreground/90">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary text-xs font-medium">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
