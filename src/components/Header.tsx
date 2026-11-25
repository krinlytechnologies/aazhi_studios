import Link from "next/link";
import EnquiryModal from "@/components/EnquiryModal";

const NAV_LINKS = [
  { href: "#philosophy", label: "Philosophy" },
  { href: "#what-we-do", label: "What We Do" },
  { href: "#projects", label: "Space Journal" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header
      id="site-header"
      // Hidden by default so it doesn't sit on top of the opening cinematic
      // hero; VillaJourneyExperience fades it in once that scene finishes
      // (or immediately, for reduced-motion/low-power visitors who skip the
      // scroll-scrubbed hero entirely). `fixed` (not `sticky`) so it never
      // reserves its own height in normal flow — otherwise, while hidden, it
      // would still leave an empty gap pushing the hero down from the true
      // top of the viewport.
      className="pointer-events-none fixed top-0 z-50 w-full border-b border-brown/15 bg-stone/95 opacity-0 transition-opacity duration-500 md:bg-stone/90 md:backdrop-blur-sm"
    >
      <div className="container-editorial flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.png" alt="Hash Theory" className="h-10 w-auto sm:h-12" />
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="eyebrow text-brown/80 transition-colors hover:text-brown"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <EnquiryModal />
      </div>
      {/* Without JS, nothing ever reveals the header — keep it usable regardless. */}
      <noscript>
        <style>{"#site-header{opacity:1!important;pointer-events:auto!important;}"}</style>
      </noscript>
    </header>
  );
}
