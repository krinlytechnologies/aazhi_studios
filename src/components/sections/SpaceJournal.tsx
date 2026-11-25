"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

interface GalleryImage {
  folder: string;
  file: string;
}

interface GalleryCategory {
  label: string;
  description: string;
  images: GalleryImage[];
}

const GALLERY: GalleryCategory[] = [
  {
    label: "Living",
    description:
      "The room that has to do the most — gather, host, and unwind — so layout and light come first, finish and furniture second.",
    images: [
      { folder: "LIVING", file: "liv-1.webp" },
      { folder: "LIVING", file: "liv-2.webp" },
      { folder: "LIVING", file: "liv-3.webp" },
      { folder: "LIVING", file: "liv-4.webp" },
    ],
  },
  {
    label: "Kitchen",
    description:
      "Built around how you actually cook: storage where your hands reach first, worktops that keep pace with real use.",
    images: [
      { folder: "KITCHEN", file: "kit-1.webp" },
      { folder: "KITCHEN", file: "kit-2.webp" },
      { folder: "KITCHEN", file: "kit-3.webp" },
    ],
  },
  {
    label: "Bedroom",
    description:
      "A quieter palette and softer light — the one space designed purely to help you switch off.",
    images: [
      { folder: "BEDROOM", file: "Bed-1.webp" },
      { folder: "BEDROOM", file: "Bed-2.webp" },
      { folder: "BEDROOM", file: "Bed-3.webp" },
    ],
  },
  {
    label: "Kid's Room",
    description:
      "Playful without being precious — durable materials and storage that grows with the child, not just the trend.",
    images: [
      { folder: "KID ROOM", file: "kid-1.webp" },
      { folder: "KID ROOM", file: "kid-2.webp" },
      { folder: "KID ROOM", file: "kid-3.webp" },
      { folder: "KID ROOM", file: "kid-4.webp" },
    ],
  },
  {
    label: "Bathroom",
    description:
      "Small footprint, high stakes — every fixture and finish chosen for a space that has to feel calm every single day.",
    images: [
      { folder: "BATHROOM", file: "bath-1.webp" },
      { folder: "BATHROOM", file: "bath-2.webp" },
      { folder: "BATHROOM", file: "bath-3.webp" },
      { folder: "BATHROOM", file: "bath-4.webp" },
    ],
  },
  {
    label: "Cafes",
    description:
      "Commercial spaces that still feel designed for people — seating, acoustics, and atmosphere tuned for long stays.",
    images: [
      { folder: "cafe", file: "Modern Industrial Café Interior.png" },
      { folder: "cafe", file: "Symmetrical Café Lounge at Dusk.png" },
      { folder: "cafe", file: "Warm Curved Nook Café Interior.png" },
    ],
  },
];

function imageSrc({ folder, file }: GalleryImage): string {
  return `/${folder}/${file}`
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : segment))
    .join("/");
}

/**
 * An editorial, magazine-spread treatment of one room category: a large hero
 * image, an index/title/description column, a "Read the Story" affordance
 * that drops the visitor into the enquiry flow for that kind of space, and a
 * mosaic of the category's remaining shots. Alternates sides category to
 * category so the journal reads as a sequence of hand-laid-out spreads
 * rather than a repeating grid.
 */
function CategoryBlock({ label, description, images, index }: GalleryCategory & { index: number }) {
  const [hero, ...rest] = images;
  const reversed = index % 2 === 1;
  const mosaicRows = Math.ceil(rest.length / 2);

  const heroRef = useRef<(HTMLDivElement | null)[]>([]);
  const mosaicRefs = useRef<(HTMLDivElement | null)[]>([]);

  useRevealOnScroll(heroRef, [], { translateY: 32, threshold: 0.15 });
  useRevealOnScroll(mosaicRefs, [], { translateY: 20, threshold: 0.2, stagger: 90 });

  return (
    <div className="border-t border-brown/10 py-16 first:border-t-0 first:pt-0 last:pb-0 sm:py-20">
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div
            className={`flex flex-col gap-5 border-brown/15 md:col-span-3 md:self-center md:border-l md:pl-6 ${
              reversed ? "md:order-2 md:border-l-0 md:border-r md:pl-0 md:pr-6" : ""
            }`}
          >
            <p className="eyebrow text-terracotta">Issue {String(index + 1).padStart(2, "0")}</p>
            <h3 className="heading-display text-4xl text-brown sm:text-5xl">{label}</h3>
            <p className="max-w-sm text-base leading-relaxed text-charcoal/70">{description}</p>
            <a
              href="#contact"
              className="eyebrow group mt-2 inline-flex w-fit items-center gap-2 text-brown transition-colors hover:text-terracotta"
            >
              Read the Story
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </div>

          <div
            ref={(el) => {
              heroRef.current[0] = el;
            }}
            className={`relative aspect-[4/3] overflow-hidden rounded-sm shadow-xl md:col-span-6 ${
              reversed ? "md:order-1" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc(hero)}
              alt={`${label} interior concept render`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          </div>

          <div
            className={`grid aspect-[4/3] grid-cols-2 gap-4 md:col-span-3 md:aspect-auto md:h-full ${
              reversed ? "md:order-3" : ""
            }`}
            style={{ gridTemplateRows: `repeat(${mosaicRows}, 1fr)` }}
          >
            {rest.map((image, i) => {
              const src = imageSrc(image);
              const isLast = i === rest.length - 1;
              const spansFull = isLast && rest.length % 2 === 1;
              return (
                <div
                  key={src}
                  ref={(el) => {
                    mosaicRefs.current[i] = el;
                  }}
                  className={`relative overflow-hidden rounded-sm ${spansFull ? "col-span-2" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${label} interior concept render`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpaceJournal() {
  return (
    <section id="projects" className="section texture-paper">
      <div className="container-editorial">
        <p className="eyebrow text-terracotta">The Space Journal</p>
        <h1 className="heading-display text-balance mt-6 max-w-3xl text-5xl text-brown sm:text-6xl md:text-7xl">
          The Space Journal
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-charcoal/70">
          Projects, stories and lived spaces — a curated journal of the homes,
          materials and ideas we&apos;ve brought to life, one room at a time.
        </p>
      </div>

      <div className="mt-16 flex flex-col sm:mt-20">
        {GALLERY.map((category, index) => (
          <CategoryBlock key={category.label} index={index} {...category} />
        ))}
      </div>
    </section>
  );
}
