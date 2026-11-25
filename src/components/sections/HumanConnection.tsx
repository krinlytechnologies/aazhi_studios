"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

/**
 * Human Connection — the section exists to build trust and aspiration
 * through what thoughtful interiors actually change about daily life. No
 * client quote is attributed here; when a real testimonial is available it
 * can be dropped into this slot rather than one being invented for it.
 */
export default function HumanConnection() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  useRevealOnScroll(revealRefs, [], { translateY: 28, threshold: 0.2, stagger: 120 });

  return (
    <section id="human-connection" className="section bg-ivory">
      <div className="container-editorial grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <div
          ref={(el) => {
            revealRefs.current[0] = el;
          }}
          className="relative order-2 aspect-[4/5] overflow-hidden rounded-sm shadow-xl md:order-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/KID%20ROOM/kid-1.webp"
            alt="A warm, lived-in room designed by Hash Theory for everyday family life"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          ref={(el) => {
            revealRefs.current[1] = el;
          }}
          className="order-1 md:order-2"
        >
          <p className="eyebrow text-brown/60">Human Connection</p>
          <h2 className="heading-display mt-6 max-w-lg text-4xl text-brown sm:text-5xl">
            A home shapes how you live in it, every single day.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/80">
            A well-designed room changes more than how a space looks — it
            changes how a family gathers, how a morning begins, how a day
            unwinds. That is the measure we design toward: not just a
            beautiful photograph, but a space that earns its place in
            everyday life.
          </p>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-charcoal/80">
            We listen first, design with intention, and stay close through
            every detail — so what we build together feels less like a
            project delivered, and more like a space that was always meant to
            be yours.
          </p>
        </div>
      </div>
    </section>
  );
}
