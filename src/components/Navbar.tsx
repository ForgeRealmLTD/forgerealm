"use client";

import { useEffect, useState } from "react";
import { ArrowKnob } from "./landing/ui";

const NAV_LINKS: Array<[string, string]> = [
  ["Services", "/#services"],
  ["Work", "/#work"],
  ["FAQ", "/#faq"],
  ["Blog", "/blog"],
  ["Contact", "/#contact"],
  ["Booths", "/subscribe"],
];

/**
 * Site header. A slim bar rather than a floating pill: transparent over the
 * hero, then a solid ink bar with a hairline once the page scrolls. Below
 * `lg` the links move into a full-screen menu set in large type.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // While the menu is open: Escape closes it and the page behind stays put.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className="fr-ink fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="border-b transition-[background-color,border-color] duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(11, 10, 8, 0.88)" : "transparent",
          borderColor: scrolled ? "var(--line)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(14px)" : undefined,
        }}
      >
        <div className="fr-wrap flex h-16 items-center justify-between gap-6">
          {/* Logo + wordmark */}
          <a
            href="/"
            className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb224]"
          >
            <img
              src="/headfrlogorv-128.webp"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full transition-transform duration-500 group-hover:rotate-[14deg]"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <span className="leading-none">
              <span className="fr-px fr-fg block text-[1.75rem] leading-[0.8]">
                ForgeRealm
              </span>
              <span className="fr-label fr-fg-3 mt-0.5 hidden !text-[13px] sm:block">
                Leeds, UK
              </span>
            </span>
          </a>

          {/* Desktop links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV_LINKS.map(([label, href]) => (
              <a key={label} href={href} className="fr-nav-link">
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/shop/sign-in" className="fr-nav-link hidden sm:block">
              Sign In
            </a>
            <a
              href="/shop"
              // Stays visible on phones (it is the main action); only the
              // very narrowest screens drop it to keep the bar on one line.
              className="fr-btn fr-btn--solid fr-btn--sm max-[359px]:hidden"
            >
              Shop
              <ArrowKnob />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="fr-fg fr-line-2 grid h-10 w-10 place-items-center rounded-full border lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <span className="relative block h-[9px] w-[18px]" aria-hidden>
                <span className="absolute inset-x-0 top-0 h-px bg-current" />
                <span className="absolute inset-x-0 bottom-0 h-px bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen menu (below lg) */}
      <div
        className={`fr-ink fr-plate fixed inset-0 z-50 flex flex-col transition-all duration-500 lg:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="fr-wrap flex h-16 flex-none items-center justify-between">
          <span className="inline-flex items-center gap-3">
            <img
              src="/headfrlogorv-128.webp"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full"
            />
            <span className="fr-px fr-fg text-[1.75rem] leading-none">
              ForgeRealm
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fr-fg fr-line-2 grid h-10 w-10 place-items-center rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224]"
            aria-label="Close menu"
          >
            <span className="relative block h-[18px] w-[18px]" aria-hidden>
              <span className="absolute left-0 right-0 top-1/2 h-px rotate-45 bg-current" />
              <span className="absolute left-0 right-0 top-1/2 h-px -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <nav
          className="fr-wrap flex flex-1 flex-col justify-center overflow-y-auto"
          aria-label="Mobile"
        >
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="fr-line group border-b py-3.5 first:border-t"
            >
              <span className="fr-px fr-fg text-[2.9rem] leading-[0.85] transition-colors group-hover:text-[#ffb224]">
                {label}
              </span>
            </a>
          ))}
        </nav>

        <div className="fr-wrap flex-none space-y-3 pb-8 pt-6">
          <a
            href="/shop"
            onClick={() => setOpen(false)}
            className="fr-btn fr-btn--solid w-full"
          >
            Enter the Shop
            <ArrowKnob />
          </a>
          <a
            href="/shop/sign-in"
            onClick={() => setOpen(false)}
            className="fr-btn fr-btn--ghost w-full"
          >
            Sign In
            <ArrowKnob />
          </a>
        </div>
      </div>
    </header>
  );
}
