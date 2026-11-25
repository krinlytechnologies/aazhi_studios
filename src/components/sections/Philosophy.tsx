"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

/**
 * The Philosophy — an emotionally compelling, editorial-scale introduction:
 * oversized serif typography, a single full-bleed image and generous
 * whitespace rather than a wall of copy. Carries the studio's original
 * "depth" narrative, restyled to the scale this moment in the journey calls
 * for.
 */
export default function Philosophy() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  useRevealOnScroll(revealRefs, [], { translateY: 28, threshold: 0.2, stagger: 120 });

  return (
    <section id="philosophy" className="section bg-ivory">
      <div className="container-editorial">
        <p
          ref={(el) => {
            revealRefs.current[0] = el;
          }}
          className="eyebrow text-brown/60"
        >
          The Philosophy
        </p>
        <h2
          ref={(el) => {
            revealRefs.current[1] = el;
          }}
          className="heading-display text-balance mt-6 max-w-5xl text-5xl text-brown sm:text-6xl md:text-7xl"
        >
          Spaces that feel lived, meaningful and timeless.
        </h2>
      </div>

      <div
        ref={(el) => {
          revealRefs.current[2] = el;
        }}
        className="relative mt-16 aspect-[16/9] w-full overflow-hidden sm:mt-20 md:aspect-[21/9]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/LIVING/liv-1.webp"
          alt="A warm, light-filled living room designed by Hash Theory"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="container-editorial mt-16 grid gap-10 md:grid-cols-[0.6fr_1fr] md:gap-16">
        <div />
        <div
          ref={(el) => {
            revealRefs.current[3] = el;
          }}
          className="max-w-2xl"
        >
          <p className="text-lg leading-relaxed text-charcoal/80 sm:text-xl">
            Hash Theory embraces the idea that every space holds something
            deeper than its surface — a structure beneath the form.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-charcoal/80 sm:text-xl">
            Like a theory, design has layers — form, material, texture, light
            and emotion. When these elements come together with intention, a
            space becomes more than a visual experience; it becomes something
            to feel, live in and remember.
          </p>
          <p className="mt-6 text-lg font-medium text-brown">
            Hash Theory — Every space has a theory.
          </p>
        </div>
      </div>
    </section>
  );
}
