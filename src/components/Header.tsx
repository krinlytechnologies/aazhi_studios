import Link from "next/link";
import EnquiryModal from "@/components/EnquiryModal";

const NAV_LINKS = [
  { href: "#our-story", label: "Our Story" },
  { href: "#what-we-do", label: "What We Do" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brown/15 bg-stone/90 backdrop-blur-sm">
      <div className="container-editorial flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.png" alt="Aazhi Studio" className="h-10 w-auto sm:h-12" />
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
    </header>
  );
}
