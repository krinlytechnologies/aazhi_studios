"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  VILLA_JOURNEY_SEQUENCE,
  VILLA_JOURNEY_ASSIGNED_TEXT_BEATS,
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
 * Returns true on devices unlikely to handle a pinned, scroll-scrubbed video
 * smoothly — low memory or a constrained/data-saver connection. These fall
 * back to the static poster with no pin and no per-scroll-frame work, same
 * as prefers-reduced-motion, rather than fighting for a "premium" effect
 * the hardware can't deliver smoothly anyway.
 */
/**
 * How long to hold on the poster frame after mount before scroll starts
 * driving the video/text, even if the visitor scrolls immediately — gives
 * the video a moment to buffer so it doesn't stutter the instant scrubbing
 * begins.
 */
const INTRO_HOLD_MS = 1300;

function isLowPowerDevice(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  const connection = nav.connection;
  if (connection?.saveData) return true;
  if (connection?.effectiveType && /2g|3g/.test(connection.effectiveType)) return true;
  return false;
}

/**
 * The homepage's opening hero: a single continuous villa walkthrough video,
 * scroll-scrubbed via GSAP ScrollTrigger (sets `video.currentTime` directly —
 * hardware-decoded, one file, no per-frame image requests) with a
 * frame-synchronized text-beat list fading in over it.
 */
export default function VillaJourneyExperience() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bridgeRef = useRef<HTMLDivElement | null>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [staticFallback, setStaticFallback] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const introRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStaticFallback(query.matches || isLowPowerDevice());
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || staticFallback) return;

    const onCanPlay = () => setVideoReady(true);
    const onError = () => setVideoFailed(true);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, [staticFallback]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers fire `resize` as the URL bar hides/shows mid-scroll;
    // without this, every one of those triggers a pin recalculation —
    // the classic cause of a pinned section jittering/snapping on phones.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const section = sectionRef.current;
    const video = videoRef.current;
    const bridge = bridgeRef.current;
    if (!section || !video || !bridge) return;

    const beats = VILLA_JOURNEY_ASSIGNED_TEXT_BEATS.map((_, i) => beatRefs.current[i]).filter(
      (el): el is HTMLDivElement => Boolean(el)
    );
    if (beats.length !== VILLA_JOURNEY_ASSIGNED_TEXT_BEATS.length) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        // "all" always matches, so gsap.matchMedia's callback fires immediately on
        // registration no matter which breakpoint the device starts at.
        all: "all",
        desktop: "(min-width: 768px)",
      },
      (context) => {
        const { desktop } = context.conditions as { desktop: boolean };
        const header = document.getElementById("site-header");
        const intro = introRef.current;

        gsap.set(bridge, { opacity: 0 });

        if (staticFallback) {
          // No scroll-scrubbed hero to hide it behind, so keep the header visible
          // and usable throughout — the hide/reveal dance below is skipped entirely.
          if (header) gsap.set(header, { opacity: 1, pointerEvents: "auto" });
          if (intro) gsap.set(intro, { opacity: 0, pointerEvents: "none" });

          // Stable poster frame, no scroll-scrubbed video. Only the first beat is
          // shown — the rest stay hidden rather than overlapping at the same spot.
          gsap.set(beats, { opacity: 0, y: 0 });
          if (beats[0]) gsap.set(beats[0], { opacity: 1 });
          return;
        }

        if (header) gsap.set(header, { opacity: 0, pointerEvents: "none" });
        if (intro) gsap.set(intro, { opacity: 1, pointerEvents: "none" });

        gsap.set(beats, { opacity: 0, y: 14 });

        const lastFrame = VILLA_JOURNEY_SEQUENCE.frameCount - 1;
        const textTl = gsap.timeline({ paused: true });

        // The brand intro (logo + tagline + scroll cue) holds while the
        // visitor is still at the very top, then dissolves as soon as they
        // start scrubbing the walkthrough — it never reappears.
        if (intro) {
          textTl.to(intro, { opacity: 0, duration: 0.03, ease: "power1.in" }, 0);
        }

        VILLA_JOURNEY_ASSIGNED_TEXT_BEATS.forEach((beat, i) => {
          const el = beats[i];
          const startP = Math.min(1, Math.max(0, beat.startFrame / lastFrame));
          const endP = Math.min(1, Math.max(startP, beat.endFrame / lastFrame));
          const fadeOutStart = Math.max(startP, endP - 0.04);
          textTl.to(el, { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" }, startP);
          textTl.to(el, { opacity: 0, y: -14, duration: 0.04, ease: "power1.in" }, fadeOutStart);
        });

        // Bridge into the next homepage section, fading in over the final stretch.
        textTl.to(bridge, { opacity: 1, duration: 0.08, ease: "power1.in" }, 0.94);
        // Reveal the header just ahead of the bridge so it's fully visible by the
        // time the journey hands off to the next section.
        if (header) {
          textTl.set(header, { pointerEvents: "auto" }, 0.92);
          textTl.to(header, { opacity: 1, duration: 0.08, ease: "power1.in" }, 0.92);
        }
        textTl.progress(0);

        const applySeek = (progress: number) => {
          const duration = video.duration;
          if (!duration || Number.isNaN(duration)) return;
          video.currentTime = Math.min(duration, Math.max(0, progress * duration));
        };

        // The progress we most recently want applied, regardless of whether
        // we actually managed to apply it yet (see seekVideo below).
        let latestProgress = 0;

        const seekVideo = (progress: number) => {
          latestProgress = progress;
          // Skip while a previous seek is still in flight. Mobile decoders are
          // far slower to complete a seek than desktop GPUs; writing
          // currentTime again before the last one finishes queues up seeks
          // faster than they can be serviced, which is what produces visible
          // stutter/frozen frames on phones. Dropping the intermediate
          // targets and always chasing the latest one once free reads as a
          // smooth (if slightly simplified) scrub instead.
          if (video.seeking) return;
          applySeek(progress);
        };

        // Once an in-flight seek finishes, make sure the video actually lands
        // on the most recent target — otherwise, if scrolling stops exactly
        // while a seek is pending, the final frame shown could be stale
        // (whatever the dropped intermediate seeks landed on) instead of
        // matching the final scroll position.
        const onSeeked = () => {
          const duration = video.duration;
          if (!duration || Number.isNaN(duration)) return;
          if (Math.abs(video.currentTime / duration - latestProgress) > 0.002) {
            applySeek(latestProgress);
          }
        };
        video.addEventListener("seeked", onSeeked);

        // Held true until INTRO_HOLD_MS has passed since mount — see
        // INTRO_HOLD_MS's comment above.
        let introHoldElapsed = false;

        const onUpdate = (self: ScrollTrigger) => {
          if (!introHoldElapsed) return;
          seekVideo(self.progress);
          textTl.progress(self.progress);
        };

        // Pinned on both breakpoints — without this, the section (and the whole
        // page under it) just scrolls past normally instead of holding still
        // while the video scrubs. Only the pinned distance differs per device.
        const scrollDistanceVh = desktop
          ? VILLA_JOURNEY_SEQUENCE.desktop.scrollDistanceVh
          : VILLA_JOURNEY_SEQUENCE.mobile.scrollDistanceVh;

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${scrollDistanceVh}vh`,
          pin: true,
          // A light scrub smooths out jittery wheel/touch input into a
          // buttery seek curve without feeling laggy or disconnected
          // from the scrollbar.
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate,
          onRefresh: onUpdate,
        });

        const introHoldTimeout = window.setTimeout(() => {
          introHoldElapsed = true;
          // Snap to wherever the scroll actually is once the hold ends — the
          // visitor may well have kept scrolling through the held poster.
          onUpdate(st);
        }, INTRO_HOLD_MS);

        return () => {
          window.clearTimeout(introHoldTimeout);
          video.removeEventListener("seeked", onSeeked);
          st.kill();
          textTl.kill();
          // Never leave the header stuck hidden if this effect tears down mid-sequence.
          if (header) gsap.set(header, { opacity: 1, pointerEvents: "auto" });
        };
      }
    );

    return () => mm.revert();
  }, [staticFallback]);

  const showLoadingHint = !staticFallback && !videoReady && !videoFailed;
  const showDevNotice = process.env.NODE_ENV !== "production" && videoFailed;

  return (
    <section
      ref={sectionRef}
      id="villa-journey-experience"
      className="relative h-screen w-full overflow-hidden bg-charcoal text-ivory"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={VILLA_JOURNEY_SEQUENCE.videoSrc}
        poster={VILLA_JOURNEY_SEQUENCE.posterSrc}
        muted
        playsInline
        preload={staticFallback ? "none" : "auto"}
        aria-label="A walkthrough of the villa's interior."
      />

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/5 to-transparent" />

      <div
        ref={introRef}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-charcoal/30 px-6 text-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-transparent.png" alt="" aria-hidden className="h-16 w-auto sm:h-20" />
        <div>
          <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl">
            Step Into Our World
          </h1>
          <p className="eyebrow mt-4 text-ivory/70">Every Space Has a Theory</p>
        </div>
        <div className="absolute bottom-10 flex flex-col items-center gap-2 sm:bottom-14">
          <span className="block h-8 w-px animate-pulse bg-ivory/60" />
          <span className="eyebrow text-xs text-ivory/60">Scroll to begin the walkthrough</span>
        </div>
      </div>

      {VILLA_JOURNEY_ASSIGNED_TEXT_BEATS.map((beat, i) => (
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
          Dev only: villa journey video failed to load — showing the poster instead.
        </div>
      )}
    </section>
  );
}
