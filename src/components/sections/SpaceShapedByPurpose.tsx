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

/** Hero tile leads each category at 2x2; the rest fill in around it, largest first. */
const SPAN_BY_INDEX = ["hero", "wide", "tall", "tall"] as const;

const SPAN_CLASSES: Record<(typeof SPAN_BY_INDEX)[number], string> = {
  hero: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-2 md:row-span-1",
  tall: "md:col-span-1 md:row-span-1",
};

export default function SpaceShapedByPurpose() {
  return (
    <section id="projects" className="section bg-charcoal text-ivory">
      <div className="container-editorial">
        <p className="eyebrow text-ivory/50">Space Shaped by Purpose</p>
        <h2 className="heading-display mt-4 max-w-2xl text-4xl sm:text-5xl">
          A portfolio built on purpose, not trend.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/70">
          Our completed projects will be presented here — each one a study in how
          a space is shaped by the life it needs to hold. A first look, room by
          room, while the full portfolio comes together.
        </p>

        <div className="mt-16 flex flex-col gap-16">
          {GALLERY.map((category) => (
            <div key={category.label}>
              <div className="flex items-baseline justify-between gap-4 border-b border-ivory/15 pb-4">
                <h3 className="heading-display text-3xl sm:text-4xl">{category.label}</h3>
                
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-flow-dense md:auto-rows-[15rem] md:grid-cols-4">
                {category.images.map((image, i) => {
                  const span = SPAN_BY_INDEX[i] ?? "tall";
                  const isHero = span === "hero";
                  const src = imageSrc(image);

                  return (
                    <div
                      key={src}
                      className={`group relative aspect-[4/3] overflow-hidden rounded-sm md:aspect-auto ${SPAN_CLASSES[span]}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${category.label} interior concept render`}
                        loading={isHero ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <span className="eyebrow pointer-events-none absolute right-4 top-4 text-ivory/0 transition-colors group-hover:text-ivory/80">
                        ↗
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="eyebrow mt-16 text-ivory/40">Project portfolio coming soon</p>
      </div>
    </section>
  );
}
