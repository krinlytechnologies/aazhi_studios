"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "@/components/cinematic/useFrameSequence";
import { ARRIVAL_SEQUENCE, ARRIVAL_POSTER_SOURCES, getFrameSrc } from "@/lib/cinematic/arrival-sequence";

/**
 * The "Arrival" scene: a single scroll-scrubbed frame sequence (48 frames) of the villa
 * exterior, rendered to one canvas. One shared ScrollTrigger + timeline drives both the
 * canvas frame and the text overlays on desktop (pinned) and mobile (not pinned) alike —
 * see docs/cinematic-assets.md for the asset contract.
 */
export default function CinematicExperience() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const identityRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  // Starts false so server and client render identically; an effect corrects it.
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const { status, setProgress } = useFrameSequence({
    canvasRef,
    frameCount: ARRIVAL_SEQUENCE.frameCount,
    getFrameSrc,
    posterSources: ARRIVAL_POSTER_SOURCES,
    // A static representative frame is enough under reduced motion — no need to stream 48.
    streamFrames: !reducedMotion,
    debugLabel: "Arrival",
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const identity = identityRef.current;
    const label = labelRef.current;
    if (!section || !identity || !label) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 768px)",
      },
      (context) => {
        const { reduced, desktop } = context.conditions as { reduced: boolean; desktop: boolean };

        if (reduced) {
          // Stable representative frame (the first — this scene's "poster" shot), no
          // scroll-scrubbed movement, text present immediately.
          setProgress(0);
          gsap.set(identity, { opacity: 1 });
          gsap.set(label, { opacity: 1, y: 0 });
          return;
        }

        gsap.set(identity, { opacity: 1 });
        gsap.set(label, { opacity: 0, y: 14 });

        // One shared timeline for desktop and mobile: paused so it is driven ONLY
        // by the ScrollTrigger's scrub/progress, never auto-playing on its own.
        const textTl = gsap.timeline({ paused: true });
        textTl.to(identity, { opacity: 0, duration: 0.12, ease: "power1.out" }, 0.02);
        textTl.to(label, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, 0.55);
        textTl.to(label, { opacity: 0, y: -14, duration: 0.08, ease: "power1.in" }, 0.88);
        textTl.progress(0);

        const onUpdate = (self: ScrollTrigger) => {
          setProgress(self.progress);
          textTl.progress(self.progress);
        };

        const st = desktop
          ? ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: `+=${ARRIVAL_SEQUENCE.desktop.scrollDistanceVh}vh`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate,
              onRefresh: onUpdate,
            })
          : ScrollTrigger.create({
              // Not pinned: the scrub plays out over exactly the scroll distance the
              // section is passing through the viewport, so it stays visible throughout.
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

  const showLoadingHint = status === "idle" && !reducedMotion;
  const showDevNotice = process.env.NODE_ENV !== "production" && status === "missing";

  return (
    <section
      ref={sectionRef}
      id="cinematic-experience"
      className="relative h-screen w-full overflow-hidden bg-charcoal text-ivory"
    >
      {/* Initial poster image: visible immediately on SSR & initial load before canvas paints */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ARRIVAL_SEQUENCE.posterSrc}
        alt="Villa exterior at dusk"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full">
        Villa exterior at dusk.
      </canvas>

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/5 to-transparent" />

      <div
        ref={identityRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
      >
        <span className="eyebrow text-ivory/70">An Interior Design</span>
        <h1 className="heading-display text-5xl sm:text-6xl">Azhi Studio&apos;s</h1>
      </div>

      <div
        ref={labelRef}
        className="absolute bottom-10 left-0 w-full px-6 sm:bottom-14 sm:px-10 md:bottom-16 md:px-16"
      >
        <span className="eyebrow text-ivory/70"></span>
        <h3 className="heading-display mt-2 text-3xl sm:text-4xl">The Art of Entering.</h3>
      </div>

      {showLoadingHint && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-ivory/70" />
        </div>
      )}

      {showDevNotice && (
        <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-xs rounded border border-ivory/30 bg-charcoal/90 px-3 py-2 text-xs text-ivory/80">
          Dev only: arrival frame sequence not found — showing a fallback image instead.
        </div>
      )}
    </section>
  );
}
