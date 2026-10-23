interface GalleryCategory {
  label: string;
  images: string[];
}

const GALLERY: GalleryCategory[] = [
  {
    label: "Living",
    images: ["/LIVING/liv-1.webp", "/LIVING/liv-2.webp", "/LIVING/liv-3.webp", "/LIVING/liv-4.webp"],
  },
  {
    label: "Kitchen",
    images: ["/KITCHEN/kit-1.webp", "/KITCHEN/kit-2.webp", "/KITCHEN/kit-3.webp"],
  },
  {
    label: "Bedroom",
    images: ["/BEDROOM/Bed-1.webp", "/BEDROOM/Bed-2.webp", "/BEDROOM/Bed-3.webp"],
  },
  {
    label: "Kid's Room",
    images: [
      "/KID%20ROOM/kid-1.webp",
      "/KID%20ROOM/kid-2.webp",
      "/KID%20ROOM/kid-3.webp",
      "/KID%20ROOM/kid-4.webp",
    ],
  },
  {
    label: "Bathroom",
    images: ["/BATHROOM/bath-1.webp", "/BATHROOM/bath-2.webp", "/BATHROOM/bath-3.webp", "/BATHROOM/bath-4.webp"],
  },
];

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

        <div className="mt-14 flex flex-col gap-12">
          {GALLERY.map((category) => (
            <div key={category.label}>
              <div className="flex items-baseline justify-between">
                <h3 className="heading-display text-2xl text-ivory">{category.label}</h3>
                
              </div>

              <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
                {category.images.map((src, i) => (
                  <div
                    key={src}
                    className="group relative aspect-[4/3] w-[78vw] flex-shrink-0 snap-start overflow-hidden rounded-sm sm:w-[360px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${category.label} interior concept render ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/0 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="eyebrow mt-12 text-ivory/40">Project portfolio coming soon</p>
      </div>
    </section>
  );
}
