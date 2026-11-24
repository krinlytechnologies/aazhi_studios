import EnquiryModal from "@/components/EnquiryModal";

export default function Contact() {
  return (
    <section id="contact" className="section bg-ivory">
      <div className="container-editorial grid gap-10 md:grid-cols-[0.6fr_1fr] md:gap-16">
        <p className="eyebrow text-brown/60">Contact</p>
        <div className="max-w-xl">
          <h2 className="heading-display text-4xl text-brown sm:text-5xl">
            Start a conversation about your space.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
            Share a few details about your project and we&apos;ll get back to you
            over WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-2 text-charcoal/80">
            <a href="mailto:theoryhash@gmail.com" className="eyebrow transition-colors hover:text-brown">
              theoryhash@gmail.com
            </a>
            <a href="tel:+916381284831" className="eyebrow transition-colors hover:text-brown">
              +91 63812 84831
            </a>
          </div>
          <div className="mt-8">
            <EnquiryModal triggerClassName="eyebrow rounded-full bg-brown px-6 py-3 text-ivory transition-colors hover:bg-charcoal" />
          </div>
        </div>
      </div>
    </section>
  );
}
