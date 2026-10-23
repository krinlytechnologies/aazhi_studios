/**
 * Asset contract for the "Villa Journey" frame sequence — the continuous walkthrough
 * that follows Arrival. See docs/cinematic-assets.md for the extraction contract.
 */
export const VILLA_JOURNEY_SEQUENCE = {
  /** Folder of extracted frames, relative to /public. */
  basePath: "/images/cinematic/villa-journey",
  /** Zero-padded digits in `frame-0001.webp` style filenames. */
  frameNumberPadding: 4,
  frameExtension: "webp",
  /** 55s source clip extracted at 12fps. Confirmed on disk — do not assume 660. */
  frameCount: 653,
  /** Does not exist yet — see VILLA_JOURNEY_POSTER_SOURCES for the fallback. */
  posterSrc: "/images/cinematic/villa-journey-poster.jpg",
  desktop: {
    /**
     * Pinned scroll distance. Deliberately NOT a 1:1 scaling of Arrival's ~4vh/frame
     * (653 * 4 ≈ 2600vh would be a multi-screen scroll trap). This is a continuous
     * walkthrough meant to be scrubbed through, not 653 individually-savored stills,
     * so it gets a much lower ~0.9vh/frame — generous enough to resolve motion
     * smoothly, short enough to stay a single comfortable scroll passage.
     */
    scrollDistanceVh: 600,
  },
} as const;

export function getVillaJourneyFrameSrc(frameIndex: number): string {
  const frameNumber = String(frameIndex + 1).padStart(
    VILLA_JOURNEY_SEQUENCE.frameNumberPadding,
    "0"
  );
  return `${VILLA_JOURNEY_SEQUENCE.basePath}/frame-${frameNumber}.${VILLA_JOURNEY_SEQUENCE.frameExtension}`;
}

/**
 * Tried in order until one loads. The real poster doesn't exist yet, so this falls
 * through to the real first frame, which does — no unrelated legacy image is used
 * here, since frame 0 is already the strongest available fallback.
 */
export const VILLA_JOURNEY_POSTER_SOURCES: readonly string[] = [
  VILLA_JOURNEY_SEQUENCE.posterSrc,
  getVillaJourneyFrameSrc(0),
];

export type TextBeatAlign = "left" | "center" | "right";

/**
 * A frame-synchronized story beat. Wording is intentionally left unset — see
 * VILLA_JOURNEY_TEXT_BEATS below. startFrame/endFrame are indices into the 653-frame
 * sequence (0-based), inclusive.
 */
export interface VillaJourneyTextBeat {
  startFrame: number;
  endFrame: number;
  eyebrow?: string;
  heading?: string;
  supportingText?: string;
  align?: TextBeatAlign;
}

/**
 * Frame-synchronized story beats for the villa journey.
 *
 * INTENTIONALLY EMPTY: wording and frame ranges have not been decided yet — the
 * source video needs to be reviewed first. VillaJourneyExperience.tsx already wires
 * up GSAP tweens per beat (fade in at startFrame, fade out at endFrame, reversible
 * on scroll-up) driven off this array, so adding a beat here is enough to make it
 * appear — no changes to the sequence engine or the scroll/canvas logic are needed.
 *
 * Example of the shape a future beat will take (do not uncomment without real copy):
 * { startFrame: 120, endFrame: 180, eyebrow: "...", heading: "...", align: "left" }
 */
export const VILLA_JOURNEY_TEXT_BEATS: VillaJourneyTextBeat[] = [];
