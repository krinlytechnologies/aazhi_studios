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
 * A frame-synchronized story beat. startFrame/endFrame are indices into the 653-frame
 * sequence (0-based), inclusive — `null` until the real range is known. A beat with
 * either value still `null` is treated as unassigned: it is filtered out of
 * VILLA_JOURNEY_ASSIGNED_TEXT_BEATS below and never rendered or animated, so nothing
 * displays at an arbitrary/guessed time.
 */
export interface VillaJourneyTextBeat {
  startFrame: number | null;
  endFrame: number | null;
  eyebrow?: string;
  heading?: string;
  supportingText?: string;
  align?: TextBeatAlign;
}

export type AssignedVillaJourneyTextBeat = VillaJourneyTextBeat & {
  startFrame: number;
  endFrame: number;
};

function isAssignedTextBeat(beat: VillaJourneyTextBeat): beat is AssignedVillaJourneyTextBeat {
  return beat.startFrame !== null && beat.endFrame !== null;
}

/**
 * Scene titles for the villa journey, in on-screen order. Frame ranges are
 * intentionally left `null` — they have not been decided yet, and must not be
 * guessed. Fill in each beat's `startFrame`/`endFrame` (0-based indices into the
 * 653-frame sequence) once the scene boundaries in the source video are known;
 * VillaJourneyExperience.tsx picks up any beat with both values set automatically
 * via VILLA_JOURNEY_ASSIGNED_TEXT_BEATS below — no component changes needed.
 */
export const VILLA_JOURNEY_TEXT_BEATS: VillaJourneyTextBeat[] = [
  { eyebrow: "01 — FOYER", heading: "Let's Enter", startFrame: 20, endFrame: 55 },
  { eyebrow: "02 — LIVING ROOM", heading: "A Life Beautifully Lived", startFrame: 75, endFrame: 130 },
  { eyebrow: "03 — DINING", heading: "Around the Table", startFrame: 140, endFrame: 210 },
  { eyebrow: "04 — KITCHEN", heading: "The Everyday Atelier", startFrame: 220, endFrame: 300 },
  { eyebrow: "05 — STAIRCASE", heading: "Between Two Worlds", startFrame: 305, endFrame: 335 },
  { eyebrow: "06 — MASTER BEDROOM", heading: "The Quietude Suite", startFrame: 340, endFrame: 370 },
  { eyebrow: "07 — WALK-IN WARDROBE", heading: "A Wardrobe of Wonders", startFrame: 370, endFrame: 405 },
  { eyebrow: "08 — BATHROOM", heading: "The Ritual of Retreat", startFrame: 410, endFrame: 459 },
  { eyebrow: "09 — INDOOR–OUTDOOR CONNECTION", heading: "Where the Horizon Begins", startFrame: 520, endFrame: 600 },
  { eyebrow: "10 — POOL / EXTERIOR", heading: "A World of Your Own", startFrame: 615, endFrame: 680 },
];

/**
 * The subset of VILLA_JOURNEY_TEXT_BEATS that actually has a frame range assigned.
 * This is what VillaJourneyExperience.tsx renders and animates — computed once here
 * so an unfilled beat is simply absent, never displayed at an arbitrary time.
 */
export const VILLA_JOURNEY_ASSIGNED_TEXT_BEATS: AssignedVillaJourneyTextBeat[] =
  VILLA_JOURNEY_TEXT_BEATS.filter(isAssignedTextBeat);
