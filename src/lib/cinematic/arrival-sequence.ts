/**
 * Asset contract for the "Arrival" exterior frame sequence.
 * See docs/cinematic-assets.md for extraction instructions and validation checks.
 */
export const ARRIVAL_SEQUENCE = {
  /** Folder of extracted frames, relative to /public. */
  basePath: "/images/cinematic/arrival",
  /** Zero-padded digits in `frame-0001.webp` style filenames. */
  frameNumberPadding: 4,
  frameExtension: "webp",
  /** 4s source clip extracted at 12fps. */
  frameCount: 48,
  /** Does not exist yet — see ARRIVAL_POSTER_SOURCES for the fallback chain. */
  posterSrc: "/images/cinematic/arrival-poster.jpg",
  /**
   * Last-resort fallback if neither the poster nor any real frame can be loaded
   * (e.g. a build/deploy problem). An existing project asset, not part of this sequence.
   */
  legacyFallbackSrc: "/images/cinematic/scene-01.png",
  desktop: {
    /**
     * Pinned scroll distance. ~4vh per frame across 48 frames: enough room to resolve
     * each frame distinctly on a slow scroll without turning this into a multi-screen
     * scroll-trap. Deliberately shorter than a long multi-scene sequence would need.
     */
    scrollDistanceVh: 200,
  },
} as const;

export function getFrameSrc(frameIndex: number): string {
  const frameNumber = String(frameIndex + 1).padStart(ARRIVAL_SEQUENCE.frameNumberPadding, "0");
  return `${ARRIVAL_SEQUENCE.basePath}/frame-${frameNumber}.${ARRIVAL_SEQUENCE.frameExtension}`;
}

/**
 * Tried in order until one loads. The real poster doesn't exist yet, so this
 * falls through to the real first frame (which does) before the old legacy still.
 */
export const ARRIVAL_POSTER_SOURCES: readonly string[] = [
  ARRIVAL_SEQUENCE.posterSrc,
  getFrameSrc(0),
  ARRIVAL_SEQUENCE.legacyFallbackSrc,
];
