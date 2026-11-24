# Villa Journey Hero — Asset Contract

The homepage opens with a single scroll-scrubbed hero video: a continuous
walkthrough of the villa, played via `src/components/sections/VillaJourneyExperience.tsx`,
configured in `src/lib/cinematic/villa-journey-sequence.ts`.

Scrolling sets `video.currentTime` directly (via GSAP ScrollTrigger) —
there's no frame-by-frame image sequence, canvas, or per-frame network
request. This replaced an earlier 653-image canvas frame-sequence (and a
separate 48-frame "Arrival" scene) that cost ~700 CDN requests and ~22MB per
page load and was materially heavier to decode on low-power mobile devices
than a single hardware-decoded video.

## Expected files

```
public/videos/villa-journey.mp4
public/images/cinematic/villa-journey-poster.png
```

- **Poster:** should visually match the video's first frame — shown
  immediately via the `<video poster>` attribute before playback data
  arrives, and used as-is under `prefers-reduced-motion` or on detected
  low-power devices (no video loaded at all in that case: `preload="none"`).

## Re-encoding the source video (FFmpeg, Windows)

Keep the source master (e.g. `villa-journey.mp4` at the repo root, untracked
by the app) and re-encode from it whenever the clip changes:

```powershell
ffmpeg -i villa-journey.mp4 `
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" `
  -an -c:v libx264 -preset slow -crf 26 -g 12 -keyint_min 12 -sc_threshold 0 `
  -pix_fmt yuv420p -movflags +faststart `
  public\videos\villa-journey.mp4

ffmpeg -ss 0 -i public\videos\villa-journey.mp4 -frames:v 1 -q:v 80 `
  public\images\cinematic\villa-journey-poster.png
```

Notes:

- `-an` strips audio — the hero is silent and muted regardless, no reason to
  ship the audio track's bytes.
- `-g 12 -keyint_min 12 -sc_threshold 0` forces a keyframe roughly every
  ~0.5s so scrubbing (seeking) stays responsive — a long GOP is fine for
  linear playback but makes arbitrary seeks (what scroll-scrubbing does
  constantly) decode-heavy.
- `-crf 26 -preset slow` is a reasonable quality/size trade-off; raise CRF
  (less quality, smaller) if the file is still too large for comfortable
  mobile delivery.
- `-movflags +faststart` moves the moov atom to the front so playback can
  start before the whole file downloads.

## Text beats

`src/lib/cinematic/villa-journey-sequence.ts` exports `VILLA_JOURNEY_TEXT_BEATS`:
`{ startFrame, endFrame, eyebrow?, heading?, supportingText?, align? }`
objects. `startFrame`/`endFrame` are **not** tied to the video file's real
fps — they're indices into a virtual 653-"frame" timeline (12fps-equivalent)
used only to compute a 0..1 scroll-progress fraction
(`frame / (frameCount - 1)`). Adjust `frameCount` only if you deliberately
want to re-time every beat at once; otherwise just adjust individual
`startFrame`/`endFrame` values directly.

A beat with either value still `null` is filtered out of
`VILLA_JOURNEY_ASSIGNED_TEXT_BEATS` and never rendered — nothing displays at
an unassigned/guessed time.

## Low-power / reduced-motion fallback

`VillaJourneyExperience.tsx` skips the pin, the scroll-scrub, and loading the
video entirely (`preload="none"`) when either is true:

- `prefers-reduced-motion: reduce`
- A heuristic "low-power device" check: `navigator.deviceMemory <= 4`,
  `connection.saveData`, or `connection.effectiveType` is `2g`/`3g`.

In that case only the poster image and the first beat's text are shown,
statically, with no per-scroll-frame work at all.
