"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Service {
  title: string;
  description: string;
  image: string;
}

const SERVICES: Service[] = [
  {
    title: "Space Planning",
    description: "Layouts that resolve flow, light, and function before a single material is chosen.",
    image: "/wedo/1.png",
  },
  {
    title: "Residential Interiors",
    description: "End-to-end interior design for homes, from spatial planning to final styling.",
    image: "/wedo/2.png",
  },
  {
    title: "Commercial Interiors",
    description: "Thoughtful commercial spaces designed to balance brand identity, functionality, and a refined aesthetic.",
    image: "/wedo/3.png",
  },
  {
    title: "Bespoke Furniture & Styling",
    description: "Custom pieces and final styling that bring a space to its finished state.",
    image: "/wedo/4.png",
  },
];

/**
 * Desktop: a pinned deck of cards — each new card slides up over the last,
 * which settles back and dims to read as "underneath" the stack. Mobile skips
 * the pin/stack illusion entirely and just lists the cards in normal flow —
 * see the mobile ScrollTrigger lessons in CinematicExperience.tsx; a four-card
 * pinned deck isn't worth that risk when a plain stacked list already reads fine.
 */
export default function WhatWeDo() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (!section || cards.length !== SERVICES.length) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        // "all" guarantees this callback runs immediately regardless of starting
        // breakpoint — without it, gsap.matchMedia never calls back at all when
        // every listed query starts false (e.g. a narrow viewport that's never
        // >=768px), so the desktop-only setup below would silently never run.
        all: "all",
        reduced: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 768px)",
      },
      (context) => {
        const { reduced, desktop } = context.conditions as { reduced: boolean; desktop: boolean };

        // Mobile renders a plain stacked list (see JSX) — nothing to animate here.
        if (!desktop || reduced) return;

        gsap.set(cards[0], { yPercent: 0, scale: 1, filter: "brightness(1)" });
        gsap.set(cards.slice(1), { yPercent: 100 });

        const stackTl = gsap.timeline({ paused: true });
        const segment = 1 / (cards.length - 1);

        cards.forEach((card, i) => {
          if (i === 0) return;
          const start = (i - 1) * segment;
          stackTl.fromTo(
            card,
            { yPercent: 100 },
            { yPercent: 0, duration: segment, ease: "none" },
            start
          );
          stackTl.to(
            cards[i - 1],
            { scale: 0.92, filter: "brightness(0.55)", duration: segment, ease: "none" },
            start
          );
        });
        stackTl.progress(0);

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${(cards.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => stackTl.progress(self.progress),
          onRefresh: (self) => stackTl.progress(self.progress),
        });

        return () => {
          st.kill();
          stackTl.kill();
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section id="what-we-do" className="bg-stone/30">
      {/* Desktop: pinned, stacking deck of cards. */}
      <div ref={sectionRef} className="relative hidden h-screen w-full overflow-hidden md:block">
        {SERVICES.map((service, i) => (
          <div
            key={service.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-center bg-ivory"
            style={{ transformOrigin: "center top" }}
          >
            <div className="container-editorial grid w-full items-center gap-14 lg:grid-cols-2">
              <div>
                <p className="eyebrow text-brown/60">
                  {String(i + 1).padStart(2, "0")} — What We Do
                </p>
                <h3 className="heading-display mt-4 text-4xl text-brown sm:text-5xl">
                  {service.title}
                </h3>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/75">
                  {service.description}
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: plain stacked list, no pin. */}
      <div className="section md:hidden">
        <div className="container-editorial">
          <p className="eyebrow text-brown/60">What We Do</p>
          <h2 className="heading-display mt-4 text-4xl text-brown">
            A full-service design practice.
          </h2>
        </div>
        <div className="container-editorial mt-12 flex flex-col gap-14">
          {SERVICES.map((service, i) => (
            <div key={service.title}>
              <p className="eyebrow text-brown/60">
                {String(i + 1).padStart(2, "0")} — What We Do
              </p>
              <h3 className="heading-display mt-3 text-3xl text-brown">{service.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-charcoal/75">
                {service.description}
              </p>
              <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
