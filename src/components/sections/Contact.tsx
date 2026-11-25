import EnquiryModal from "@/components/EnquiryModal";

export default function Contact() {
  return (
    <section id="contact" className="section bg-charcoal text-ivory">
      <div className="container-editorial grid gap-12 md:grid-cols-[0.6fr_1fr] md:gap-16">
        <p className="eyebrow text-terracotta">Begin Your Story</p>
        <div className="max-w-xl">
          <h2 className="heading-display text-balance text-4xl sm:text-5xl md:text-6xl">
            Let&apos;s Design Your Next Chapter.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ivory/75">
            Tell us about your space, your life, your vision — share a few
            details and we&apos;ll get back to you over WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-2 text-ivory/80">
            <a href="mailto:theoryhash@gmail.com" className="eyebrow w-fit transition-colors hover:text-terracotta">
              theoryhash@gmail.com
            </a>
            <a href="tel:+916381284831" className="eyebrow w-fit transition-colors hover:text-terracotta">
              +91 63812 84831
            </a>
          </div>
          <div className="mt-10">
            <EnquiryModal triggerClassName="eyebrow rounded-full bg-terracotta px-7 py-3 text-ivory transition-colors hover:bg-ivory hover:text-charcoal" />
          </div>
        </div>
      </div>
    </section>
  );
}
