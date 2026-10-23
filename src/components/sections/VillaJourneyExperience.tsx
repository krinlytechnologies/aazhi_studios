"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "@/components/cinematic/useFrameSequence";
import {
  VILLA_JOURNEY_SEQUENCE,
  VILLA_JOURNEY_POSTER_SOURCES,
  VILLA_JOURNEY_TEXT_BEATS,
  getVillaJourneyFrameSrc,
  type TextBeatAlign,
} from "@/lib/cinematic/villa-journey-sequence";

function alignClassName(align: TextBeatAlign | undefined): string {
  switch (align) {
    case "left":
      return "items-start text-left";
    case "right":
      return "items-end text-right";
    default:
      return "items-center text-center";
  }
}

/**
 * The "Villa Journey" scene: a continuous 653-frame walkthrough that follows Arrival,
 * using the same canvas frame-sequence engine (useFrameSequence). Structurally mirrors
 * CinematicExperience.tsx (Arrival) — see that file's comments for the shared pattern;
 * differences here are: a much longer sequence, lazy-started streaming (so Arrival
 * isn't competing for bandwidth), and a frame-synchronized text-beat list that is
 * currently empty — see docs/cinematic-assets.md and villa-journey-sequence.ts.
 */
export default function VillaJourneyExperience() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bridgeRef = useRef<HTMLDivElement | null>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [reducedMotion, setReducedMotion] = useState(false);
  // Only start streaming the 653-frame sequence once the visitor is actually
  // approaching this scene — not the moment the page loads while Arrival plays.
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50% 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const { status, setProgress } = useFrameSequence({
    canvasRef,
    frameCount: VILLA_JOURNEY_SEQUENCE.frameCount,
    getFrameSrc: getVillaJourneyFrameSrc,
    posterSources: VILLA_JOURNEY_POSTER_SOURCES,
    // A static representative frame is enough under reduced motion — no need to stream 653.
    streamFrames: nearViewport && !reducedMotion,
    debugLabel: "VillaJourney",
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const bridge = bridgeRef.current;
    if (!section || !bridge) return;

    const beats = VILLA_JOURNEY_TEXT_BEATS.map((_, i) => beatRefs.current[i]).filter(
      (el): el is HTMLDivElement => Boolean(el)
    );
    if (beats.length !== VILLA_JOURNEY_TEXT_BEATS.length) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 768px)",
      },
      (context) => {
        const { reduced, desktop } = context.conditions as { reduced: boolean; desktop: boolean };

        gsap.set(bridge, { opacity: 0 });
        gsap.set(beats, { opacity: 1, y: 0 });

        if (reduced) {
          // Stable representative frame, no scroll-scrubbed movement.
          setProgress(0);
          return;
        }

        gsap.set(beats, { opacity: 0, y: 14 });

        const lastFrame = VILLA_JOURNEY_SEQUENCE.frameCount - 1;
        const textTl = gsap.timeline({ paused: true });

        VILLA_JOURNEY_TEXT_BEATS.forEach((beat, i) => {
          const el = beats[i];
          const startP = Math.min(1, Math.max(0, beat.startFrame / lastFrame));
          const endP = Math.min(1, Math.max(startP, beat.endFrame / lastFrame));
          const fadeOutStart = Math.max(startP, endP - 0.04);
          textTl.to(el, { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" }, startP);
          textTl.to(el, { opacity: 0, y: -14, duration: 0.04, ease: "power1.in" }, fadeOutStart);
        });

        // Bridge into the next homepage section, fading in over the final stretch.
        textTl.to(bridge, { opacity: 1, duration: 0.08, ease: "power1.in" }, 0.94);
        textTl.progress(0);

        const onUpdate = (self: ScrollTrigger) => {
          setProgress(self.progress);
          textTl.progress(self.progress);
        };

        const st = desktop
          ? ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: `+=${VILLA_JOURNEY_SEQUENCE.desktop.scrollDistanceVh}vh`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate,
              onRefresh: onUpdate,
            })
          : ScrollTrigger.create({
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate,
              onRefresh: onUpdate,
            });

        return () => {
          st.kill();
          textTl.kill();
        };
      }
    );

    return () => mm.revert();
  }, [setProgress]);

  const showLoadingHint = nearViewport && status === "idle" && !reducedMotion;
  const showDevNotice = process.env.NODE_ENV !== "production" && status === "missing";

  return (
    <section
      ref={sectionRef}
      id="villa-journey-experience"
      className="relative h-screen w-full overflow-hidden bg-charcoal text-ivory"
    >
      {/* Initial poster image: visible immediately on SSR & initial load before canvas paints */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={VILLA_JOURNEY_SEQUENCE.posterSrc}
        alt="Interior of the villa"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full">
        Interior of the villa.
      </canvas>

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/5 to-transparent" />

      {VILLA_JOURNEY_TEXT_BEATS.map((beat, i) => (
        <div
          key={`${beat.startFrame}-${beat.endFrame}`}
          ref={(el) => {
            beatRefs.current[i] = el;
          }}
          className={`pointer-events-none absolute inset-x-0 bottom-10 flex flex-col gap-2 px-6 sm:bottom-14 sm:px-10 md:bottom-16 md:px-16 ${alignClassName(beat.align)}`}
        >
          {beat.eyebrow && <span className="eyebrow text-ivory/70">{beat.eyebrow}</span>}
          {beat.heading && (
            <h3 className="heading-display max-w-2xl text-3xl sm:text-4xl">{beat.heading}</h3>
          )}
          {beat.supportingText && (
            <p className="max-w-lg text-sm text-ivory/80 sm:text-base">{beat.supportingText}</p>
          )}
        </div>
      ))}

      <div ref={bridgeRef} className="pointer-events-none absolute inset-0 z-20 bg-ivory opacity-0" />

      {showLoadingHint && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-ivory/70" />
        </div>
      )}

      {showDevNotice && (
        <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-xs rounded border border-ivory/30 bg-charcoal/90 px-3 py-2 text-xs text-ivory/80">
          Dev only: villa journey frame sequence not found — showing a fallback image instead.
        </div>
      )}
    </section>
  );
}
