const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-brown/10 bg-charcoal text-ivory">
      <div className="container-editorial flex flex-col gap-8 py-14 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-transparent.png" alt="Aazhi Studio" className="h-10 w-10" />
            <p className="heading-display text-xl">Aazhi Studio</p>
          </div>
          <p className="mt-2 max-w-sm text-sm text-ivory/70">
            Interior design that shapes space around how you actually live.
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-ivory/50">Studio</span>
            <a href="#our-story" className="text-ivory/80 hover:text-ivory">
              Our Story
            </a>
            <a href="#what-we-do" className="text-ivory/80 hover:text-ivory">
              What We Do
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-ivory/50">Connect</span>
            <a href="#contact" className="text-ivory/80 hover:text-ivory">
              Contact
            </a>
          </div>
        </div>
      </div>
      <div className="container-editorial border-t border-ivory/10 py-6 text-xs text-ivory/50">
        © {currentYear} Aazhi Studio. All rights reserved.
      </div>
    </footer>
  );
}
