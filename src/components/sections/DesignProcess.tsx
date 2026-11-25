"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Step {
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { title: "Connect", description: "We listen." },
  { title: "Concept", description: "We envision." },
  { title: "Develop", description: "We refine." },
  { title: "Build", description: "We create." },
  { title: "Complete", description: "We deliver." },
];

/**
 * Our Design Process — "Five Steps. One Vision." A horizontal timeline on
 * desktop whose connecting line and node fills draw in as the section
 * scrolls into view; a plain vertical list on mobile, in the same spirit as
 * the rest of the site's "stack-on-mobile" pattern.
 */
export default function DesignProcess() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const lineFillRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const lineFill = lineFillRef.current;
    const nodes = nodeRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (!section || !lineFill || nodes.length !== STEPS.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.set(lineFill, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(nodes, { opacity: 0.35, scale: 0.85 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        end: "bottom 60%",
        scrub: 0.6,
      },
    });

    tl.to(lineFill, { scaleX: 1, ease: "none" }, 0);
    nodes.forEach((node, i) => {
      tl.to(node, { opacity: 1, scale: 1, ease: "none", duration: 0.2 }, i / nodes.length);
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section id="design-process" className="section bg-ivory">
      <div className="container-editorial">
        <p className="eyebrow text-brown/60">Our Design Process</p>
        <h2 className="heading-display mt-6 max-w-3xl text-4xl text-brown sm:text-5xl">
          Five Steps. One Vision.
        </h2>
      </div>

      {/* Desktop: horizontal timeline with a drawing connector line. */}
      <div ref={sectionRef} className="container-editorial relative mt-24 hidden md:block">
        <div className="absolute left-0 right-0 top-[11px] h-px bg-brown/15" />
        <div
          ref={lineFillRef}
          className="absolute left-0 right-0 top-[11px] h-px bg-terracotta"
        />
        <div className="relative grid grid-cols-5 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col items-start">
              <div
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-xs font-semibold text-ivory"
              >
                {i + 1}
              </div>
              <h3 className="heading-display mt-6 text-2xl text-brown">{step.title}</h3>
              <p className="eyebrow mt-2 text-brown/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical list, no scrubbed animation. */}
      <div className="container-editorial mt-14 flex flex-col gap-10 md:hidden">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex gap-5">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-terracotta text-sm font-semibold text-ivory">
              {i + 1}
            </div>
            <div>
              <h3 className="heading-display text-xl text-brown">{step.title}</h3>
              <p className="eyebrow mt-1 text-brown/60">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
