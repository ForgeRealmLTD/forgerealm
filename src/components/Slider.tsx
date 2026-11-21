"use client";

import { useReveal } from "../hooks/useReveal";
import { Spark } from "./landing/ui";

const ITEMS = [
  "Fidget Toys",
  "White Vases",
  "Halloween Trinkets",
  "D&D Dice Holders",
  "Phone Stands",
  "Keychains",
  "Book Stands",
  "Figurines (Dragons, Cats)",
  "Cosplay Props",
  "...and more",
];

/**
 * "What we make" band: a slim full-bleed amber strip in pixel type, running
 * between the hero and the stockist sheet. The list is rendered twice so the
 * -50% marquee loop is seamless; the second copy is hidden from assistive
 * tech. Pauses on hover and holds still under reduced motion.
 */
export default function ProductsMarquee() {
  const marquee = useReveal<HTMLDivElement>();

  const row = (duplicate: boolean) => (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={duplicate || undefined}
    >
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-4 sm:px-6">{item}</span>
          <Spark className="fr-fg-3 text-[0.42em]" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-label="What we make"
      ref={marquee.ref}
      data-observe
      suppressHydrationWarning
      className={`reveal fr-amber fr-marquee-host relative overflow-hidden py-2.5 sm:py-3 ${marquee.isVisible ? "is-visible" : ""}`}
    >
      <div className="fr-marquee fr-px text-[clamp(1.25rem,1.9vw,1.7rem)] leading-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
