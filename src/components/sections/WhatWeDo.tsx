const SERVICES = [
  {
    title: "Residential Interiors",
    description: "End-to-end interior design for homes, from spatial planning to final styling.",
  },
  {
    title: "Space Planning",
    description: "Layouts that resolve flow, light, and function before a single material is chosen.",
  },
  {
    title: "Material & Finish Direction",
    description: "Considered palettes of material, texture, and finish tailored to each project.",
  },
  {
    title: "Bespoke Furniture & Styling",
    description: "Custom pieces and final styling that bring a space to its finished state.",
  },
];

export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="section bg-stone/30">
      <div className="container-editorial">
        <p className="eyebrow text-brown/60">What We Do</p>
        <h2 className="heading-display mt-4 max-w-xl text-4xl text-brown sm:text-5xl">
          A full-service design practice.
        </h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <div key={service.title} className="border-t border-brown/20 pt-6">
              <h3 className="heading-display text-xl text-brown">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
