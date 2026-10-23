# Azhi Studio

A premium interior design website — editorial, image-led, built with Next.js.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4
- GSAP + ScrollTrigger (for the cinematic experience)
- Lucide React (icons)

## Development

```bash
npm install
npm run dev     # start the dev server at http://localhost:3000
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Brand

Colour tokens (defined in `src/app/globals.css`, exposed as Tailwind utilities
`bg-ivory`, `text-brown`, `bg-stone`, `bg-charcoal`, etc.):

| Token       | Hex       |
| ----------- | --------- |
| Warm Ivory  | `#F1EAE0` |
| Deep Brown  | `#4A382D` |
| Stone Beige | `#D2C2AD` |
| Charcoal    | `#34332F` |

Typography: **Fraunces** (serif, `.heading-display`) for headings, **Work Sans**
(`--font-sans`) for body copy. Shared layout conventions live in
`src/app/globals.css` as the `.container-editorial` (max-width page gutter)
and `.section` (consistent vertical rhythm) utility classes.

## Structure

- `src/app/` — routes, root layout, global styles
- `src/components/` — `Header`, `Footer`, and `sections/` (one file per
  homepage section)
- `src/data/projects.ts` — the project portfolio data (currently empty)
- `src/types/project.ts` — the `Project` type for the portfolio
- `public/images/cinematic/` — stills/footage for the cinematic experience
- `public/images/projects/` — project photography, one subfolder per project
  slug matching `src/data/projects.ts`

## Homepage sections

`src/app/page.tsx` composes, in order: Cinematic Experience (placeholder),
Our Story, What We Do, Space Shaped by Purpose, and Contact.

## Planned cinematic experience

The homepage's hero will become a six-scene, scroll-driven sequence built with
GSAP's ScrollTrigger (no Three.js / WebGL). Each scene pins to the viewport
and animates as the user scrolls, before releasing into the next:

1. Opening shot — establishing the studio's mood
2. Material close-up — texture and craft
3. Spatial reveal — a room opening up
4. Light study — how natural light shapes a space
5. Detail vignette — a styled, finished corner
6. Closing shot — transition into "Our Story"

Scene assets (video stills, image sequences, or looping clips) belong in
`public/images/cinematic/`. The sequence itself is not yet implemented —
`CinematicExperience` in `src/components/sections/` is currently a static
placeholder section.

## Not included (by design)

Three.js, a CMS/database, and an admin dashboard are intentionally out of
scope to keep the project lightweight.
