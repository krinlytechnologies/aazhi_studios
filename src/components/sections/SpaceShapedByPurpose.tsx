"use client";

import { useEffect, useRef } from "react";

interface GalleryImage {
  folder: string;
  file: string;
}

interface GalleryCategory {
  label: string;
  images: GalleryImage[];
}

const GALLERY: GalleryCategory[] = [
  {
    label: "Living",
    images: [
      { folder: "LIVING", file: "liv-1.webp" },
      { folder: "LIVING", file: "liv-2.webp" },
      { folder: "LIVING", file: "liv-3.webp" },
      { folder: "LIVING", file: "liv-4.webp" },
    ],
  },
  {
    label: "Kitchen",
    images: [
      { folder: "KITCHEN", file: "kit-1.webp" },
      { folder: "KITCHEN", file: "kit-2.webp" },
      { folder: "KITCHEN", file: "kit-3.webp" },
    ],
  },
  {
    label: "Bedroom",
    images: [
      { folder: "BEDROOM", file: "Bed-1.webp" },
      { folder: "BEDROOM", file: "Bed-2.webp" },
      { folder: "BEDROOM", file: "Bed-3.webp" },
    ],
  },
  {
    label: "Kid's Room",
    images: [
      { folder: "KID ROOM", file: "kid-1.webp" },
      { folder: "KID ROOM", file: "kid-2.webp" },
      { folder: "KID ROOM", file: "kid-3.webp" },
      { folder: "KID ROOM", file: "kid-4.webp" },
    ],
  },
  {
    label: "Bathroom",
    images: [
      { folder: "BATHROOM", file: "bath-1.webp" },
      { folder: "BATHROOM", file: "bath-2.webp" },
      { folder: "BATHROOM", file: "bath-3.webp" },
      { folder: "BATHROOM", file: "bath-4.webp" },
    ],
  },
  {
    label: "Cafes",
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
 * A horizontally-scrolling, uniform-size "cover flow": whichever card sits
 * nearest the track's center scales up and comes forward (translateZ under a
 * perspective), while cards further toward the edges shrink back and dim.
 * Driven by the track's own horizontal `scroll` event, not page scroll, so it
 * needs no ScrollTrigger/matchMedia and works identically with mouse drag,
 * trackpad, or touch swipe.
 */
function CategoryCarousel({ label, images }: GalleryCategory) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;
      const half = trackRect.width / 2 || 1;

      for (const item of itemRefs.current) {
        if (!item) continue;
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const signed = Math.max(-1, Math.min(1, (itemCenter - centerX) / half));
        const normalized = Math.abs(signed);

        // Stronger depth swing: the centered card scales up and pops forward;
        // off-center cards shrink back, tilt away in 3D, and recede.
        const scale = 1.22 - normalized * 0.45;
        const translateZ = (1 - normalized) * 180;
        const rotateY = -signed * 28;
        const opacity = 1 - normalized * 0.55;

        item.style.transform = `translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        item.style.opacity = String(opacity);
        item.style.zIndex = String(Math.round((1 - normalized) * 100));
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [images.length]);

  return (
    <div>
      <div className="container-editorial border-b border-ivory/15 pb-4">
        <h3 className="heading-display text-3xl sm:text-4xl">{label}</h3>
      </div>

      <div
        ref={trackRef}
        className="mt-10 flex snap-x snap-mandatory gap-10 overflow-x-auto px-[18vw] pb-12 [perspective:1800px] [scrollbar-width:thin] sm:gap-14 sm:px-[26vw]"
      >
        {images.map((image, i) => {
          const src = imageSrc(image);
          return (
            <div
              key={src}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative aspect-[4/3] w-[320px] flex-shrink-0 snap-center overflow-hidden rounded-sm shadow-2xl transition-[transform,opacity] duration-200 ease-out sm:w-[460px] lg:w-[560px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${label} interior concept render`}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}
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

      <div className="mt-16 flex flex-col gap-20">
        {GALLERY.map((category) => (
          <CategoryCarousel key={category.label} {...category} />
        ))}
      </div>

      <div className="container-editorial">
        <p className="eyebrow mt-16 text-ivory/40"></p>
      </div>
    </section>
  );
}
