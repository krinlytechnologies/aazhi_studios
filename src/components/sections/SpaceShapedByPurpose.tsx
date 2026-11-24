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
 * An editorial asymmetric block: a large hero image, a text column (index,
 * title, a line describing what that room is designed around), and a mosaic
 * of the category's remaining shots — alternating sides category to category
 * so the section reads as a sequence of hand-laid-out spreads rather than a
 * repeating grid.
 *
 * The text column is vertically centered against the hero image (`md:self-center`
 * on an otherwise-stretched grid row) instead of split to the row's top/bottom
 * edges, and the mosaic is stretched (`md:h-full`) with its row count computed
 * from the image count so its total height always matches the hero — the two
 * read as one composed spread rather than two unrelated floating blocks.
 *
 * Every image gets a one-shot fade/rise as it scrolls into view
 * (see useRevealOnScroll) instead of the old scroll-scrubbed 3D carousel, so
 * there's no per-frame work at any screen size.
 */
function CategoryBlock({ label, description, images, index }: GalleryCategory & { index: number }) {
  const [hero, ...rest] = images;
  const reversed = index % 2 === 1;
  const accent = index === Math.floor(GALLERY.length / 2);
  const mosaicRows = Math.ceil(rest.length / 2);

  const heroRef = useRef<(HTMLDivElement | null)[]>([]);
  const mosaicRefs = useRef<(HTMLDivElement | null)[]>([]);

  useRevealOnScroll(heroRef, [], { translateY: 32, threshold: 0.15 });
  useRevealOnScroll(mosaicRefs, [], { translateY: 20, threshold: 0.2, stagger: 90 });

  return (
    <div
      className={`border-t pb-16 pt-16 first:border-t-0 first:pt-0 last:pb-0 ${
        accent ? "border-ivory/20 bg-brown py-16 text-ivory" : "border-ivory/10"
      }`}
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div
            className={`flex flex-col gap-4 border-ivory/20 md:col-span-3 md:self-center md:border-l md:pl-6 ${
              reversed ? "md:order-2 md:border-l-0 md:border-r md:pl-0 md:pr-6" : ""
            }`}
          >
            <p className={`eyebrow ${accent ? "text-ivory/60" : "text-ivory/50"}`}>
              {String(index + 1).padStart(2, "0")} — {label}
            </p>
            <h3 className="heading-display text-3xl sm:text-4xl">{label}</h3>
            <p className={`max-w-sm text-base leading-relaxed ${accent ? "text-ivory/75" : "text-ivory/70"}`}>
              {description}
            </p>
          </div>

          <div
            ref={(el) => {
              heroRef.current[0] = el;
            }}
            className={`relative aspect-[4/3] overflow-hidden rounded-sm md:col-span-6 ${
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

export default function SpaceShapedByPurpose() {
  return (
    <section id="projects" className="section bg-charcoal text-ivory">
      <div className="container-editorial">
        <p className="eyebrow text-ivory/50">Space Shaped by Purpose</p>
        <h1 className="heading-display mt-4 max-w-2xl text-4xl sm:text-5xl">
          ECR Residence Chennai
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/70">
          A look at the spaces we&apos;ve designed, the details we&apos;ve crafted, and
          the ideas we&apos;ve brought to life. Explore our work, one project at a
          time.
        </p>
      </div>

      <div className="mt-16 flex flex-col">
        {GALLERY.map((category, index) => (
          <CategoryBlock key={category.label} index={index} {...category} />
        ))}
      </div>
    </section>
  );
}
