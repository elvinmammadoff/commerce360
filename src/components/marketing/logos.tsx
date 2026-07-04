import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

/**
 * Fictional customer wordmarks — pure typography, each with its own voice so
 * the row reads like six different brands.
 */
const BRANDS = [
  { name: "Møbelhuset Nord", className: "font-semibold tracking-tight" },
  { name: "CASA VERDE", className: "font-light tracking-[0.28em]" },
  { name: "Volt & Vine", className: "font-serif italic" },
  { name: "ATELIER RUBEN", className: "font-medium tracking-[0.18em]" },
  { name: "Nordvik", className: "font-bold tracking-tighter" },
  { name: "Hemlund & Co.", className: "font-normal tracking-wide" },
];

export function Logos() {
  return (
    <section aria-label="Customers" className="border-y border-border bg-[#070707] py-12">
      <div className="container-page">
        <Reveal>
          <p className="text-center text-xs font-medium tracking-wider text-muted-foreground/80 uppercase">
            Trusted by teams replacing studio shoots
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {BRANDS.map((brand) => (
              <li
                key={brand.name}
                className={cn(
                  "text-[15px] text-muted-foreground/70 transition-colors duration-200 hover:text-foreground/90",
                  brand.className,
                )}
              >
                {brand.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
