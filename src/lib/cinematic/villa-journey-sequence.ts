/**
 * Config for the "Villa Journey" scroll-scrubbed hero video — a single
 * continuous walkthrough clip the user scrubs through by scrolling.
 */
export const VILLA_JOURNEY_SEQUENCE = {
  videoSrc: "/videos/villa-journey.mp4",
  posterSrc: "/images/cinematic/villa-journey-poster.png",
  /**
   * Virtual frame count the text beats below are authored against (12fps over
   * the clip's ~54s) — only used as a denominator to turn a beat's
   * startFrame/endFrame into a 0..1 scroll-progress fraction. The actual video
   * file's real fps/duration don't need to match this; scrubbing sets
   * `video.currentTime` directly from scroll progress.
   */
  frameCount: 653,
  desktop: {
    /**
     * Pinned scroll distance. Kept to a single comfortable scroll passage
     * rather than a multi-screen scroll-trap — this is a continuous
     * walkthrough meant to be scrubbed through, not savored frame by frame.
     */
    scrollDistanceVh: 11000,
  },
  mobile: {
    /**
     * Pinned scroll distance on touch devices. Deliberately much shorter than
     * desktop's: without a pin here the section would scroll past like any
     * other block (the whole page sliding underneath it) instead of holding
     * still while the video scrubs — but a phone-length flick-scroll session
     * also shouldn't take as long per screen-height as a desktop wheel-scroll
     * does, so this isn't a 1:1 scaling of the desktop number.
     */
    scrollDistanceVh: 3500,
  },
} as const;

export type TextBeatAlign = "left" | "center" | "right";

/**
 * A story beat timed against the virtual frame count above. `null` until a
 * frame range is assigned — see isAssignedTextBeat below.
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

/** Scene titles for the villa journey, in on-screen order. */
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
 * The subset of VILLA_JOURNEY_TEXT_BEATS that actually has a frame range
 * assigned — computed once so an unfilled beat is simply absent.
 */
export const VILLA_JOURNEY_ASSIGNED_TEXT_BEATS: AssignedVillaJourneyTextBeat[] =
  VILLA_JOURNEY_TEXT_BEATS.filter(isAssignedTextBeat);
