# Cinematic Frame Sequences — Asset Contract

The homepage opens with two scroll-scrubbed frame sequences, each rendered to a
single `<canvas>` via the shared `useFrameSequence` hook
(`src/components/cinematic/useFrameSequence.ts`):

1. **Arrival** — `src/components/sections/CinematicExperience.tsx`,
   config in `src/lib/cinematic/arrival-sequence.ts`.
2. **Villa Journey** — `src/components/sections/VillaJourneyExperience.tsx`,
   config in `src/lib/cinematic/villa-journey-sequence.ts`.

Both follow the same contract below. Update the relevant config file if any of
these numbers change — the loader does not infer frame count from disk.

## Expected files

```
public/images/cinematic/arrival/
  frame-0001.webp … frame-0048.webp
public/images/cinematic/arrival-poster.jpg

public/images/cinematic/villa-journey/
  frame-0001.webp … frame-0653.webp
public/images/cinematic/villa-journey-poster.jpg
```

- **Frame counts:** Arrival 48 (4s @ 12fps), Villa Journey 653 (55s @ 12fps).
- **Numbering:** 4-digit, zero-padded, starting at `0001` (not `0000`).
- **Format:** WebP for frames. JPEG for posters, since they load before
  anything else and should decode as fast as possible.
- **Dimensions:** both existing sequences are 1280×720. The canvas renderer
  crops to "cover" at render time, so keep a consistent aspect ratio within
  each sequence — don't mix portrait/landscape frames.
- **Posters:** should visually match each sequence's frame `0001` so there's
  no visible jump when the first real frame replaces it.

## Extracting frames with FFmpeg (Windows)

```powershell
# From the project root, with ffmpeg on PATH:
New-Item -ItemType Directory -Force public\images\cinematic\<scene>

ffmpeg -i <scene>-source.mp4 `
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" `
  -r 12 `
  -q:v 80 `
  public\images\cinematic\<scene>\frame-%04d.webp
```

Notes:
- `-r 12` extracts at 12fps; let the source video's duration determine the
  total frame count rather than capping with `-frames:v` and guessing.
- `scale=...,crop=...` enforces a fixed export frame regardless of the
  source video's resolution.
- `-q:v 80` is a reasonable WebP quality/size trade-off; inspect file sizes
  and adjust (Arrival and Villa Journey both average well under 50KB/frame).
- Generate the poster separately from frame 1, e.g.:
  ```powershell
  ffmpeg -i public\images\cinematic\<scene>\frame-0001.webp public\images\cinematic\<scene>-poster.jpg
  ```

## Validation checklist before wiring a new/changed sequence in for real

- [ ] File count matches the config's `frameCount` exactly, named
      `frame-0001.webp` … `frame-NNNN.webp`, no gaps.
- [ ] All frames share the same dimensions and aspect ratio.
- [ ] `<scene>-poster.jpg` exists and visually matches `frame-0001.webp`.
- [ ] Total folder size is reasonable for a progressively-loaded sequence
      (spot-check a few frame file sizes; flag before committing if any
      single frame is unexpectedly large).
- [ ] Open the homepage with the Network tab open and confirm frames load
      progressively (not all at once) as you scroll, and that Villa Journey's
      frames don't start downloading while Arrival is still playing.
- [ ] Scroll slowly, quickly, and in reverse through each sequence — the
      canvas should never show a blank or broken frame, and should settle on
      the correct frame when scrolling stops.

## Current temporary fallbacks

Neither `arrival-poster.jpg` nor `villa-journey-poster.jpg` exists yet.
`useFrameSequence` is given an ordered list of sources per scene
(`ARRIVAL_POSTER_SOURCES` / `VILLA_JOURNEY_POSTER_SOURCES`) and falls through
to the next one on failure:

- **Arrival:** poster → real `frame-0001.webp` (exists) → legacy
  `public/images/cinematic/scene-01.png` (an unrelated still from an earlier
  version of this page, kept only as a last-resort safety net).
- **Villa Journey:** poster → real `frame-0001.webp` (exists). No legacy
  fallback is used here, since frame 0001 is already a real, correct frame.

Once each `<scene>-poster.jpg` is generated, it will be picked up
automatically — no code changes needed, since it's already first in each
fallback list.

## Future story-beat text (Villa Journey)

`src/lib/cinematic/villa-journey-sequence.ts` exports `VILLA_JOURNEY_TEXT_BEATS`,
an array of `{ startFrame, endFrame, eyebrow?, heading?, supportingText?, align? }`
objects. It is intentionally empty — wording and frame ranges haven't been
decided. `VillaJourneyExperience.tsx` already renders and animates whatever is
in that array (fade in at `startFrame`, fade out at `endFrame`, reversible on
scroll-up); adding a beat there is enough to make it appear on screen, with no
changes needed to the sequence engine or scroll/canvas logic.
