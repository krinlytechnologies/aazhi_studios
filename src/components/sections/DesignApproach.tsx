"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

interface Pillar {
  index: string;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    index: "01",
    title: "Meaning",
    description: "Design shaped by stories and purpose.",
  },
  {
    index: "02",
    title: "Materiality",
    description: "Depth created through texture, form and contrast.",
  },
  {
    index: "03",
    title: "Identity",
    description: "Spaces that feel distinctive, never generic.",
  },
];

/**
 * Our Design Approach — the client-approved "We Create More Than Spaces. We
 * Create Depth." statement, presented as a dark, editorial triptych rather
 * than a generic feature grid.
 */
export default function DesignApproach() {
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  useRevealOnScroll(pillarRefs, [], { translateY: 24, threshold: 0.25, stagger: 120 });

  return (
    <section id="design-approach" className="section bg-charcoal text-ivory">
      <div className="container-editorial">
        <p className="eyebrow text-ivory/50">Our Design Approach</p>
        <h2 className="heading-display text-balance mt-6 max-w-4xl text-4xl sm:text-5xl md:text-6xl">
          We Create More Than Spaces.{" "}
          <span className="text-terracotta">We Create Depth.</span>
        </h2>

        <div className="mt-20 grid gap-14 border-t border-ivory/15 pt-14 sm:grid-cols-3 sm:gap-10">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              ref={(el) => {
                pillarRefs.current[i] = el;
              }}
            >
              <p className="eyebrow text-terracotta">{pillar.index}</p>
              <h3 className="heading-display mt-4 text-2xl sm:text-3xl">{pillar.title}</h3>
              <p className="mt-3 max-w-xs text-base leading-relaxed text-ivory/70">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
