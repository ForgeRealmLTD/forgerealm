"use client";

import { useReveal } from "../hooks/useReveal";
import { ArrowKnob } from "./landing/ui";

/**
 * Stockist announcement: ForgeRealm prints are now carried at The Mini Mall,
 * Merrion Centre, Leeds.
 *
 * Design note: this is the first "paper" sheet on the page, a blush-cream
 * panel resting on the dark workbench, set like a magazine spread. The
 * headline and the practical details share the top row, then a bento of four
 * photos sits below. The grid is deliberately uneven, a tall portrait of our
 * shelves anchoring the left and the venue running wide along the bottom, so
 * it reads as a display rather than a row of thumbnails. The whole block
 * rests on an ink ledge, picking up the shelf the copy describes.
 */

/* Tiles are placed by the shape of the photo rather than by importance: the
   two portraits take the full-height cells, the two landscapes run wide
   beside them, so nothing is cropped against its grain. */
const TILES = [
  {
    src: "/blog/minimall-shelf-tower.jpg",
    alt: "A full ForgeRealm shelving tower at The Mini Mall, holding printed lamps, cats, a dragon and castle, cones and mermaid tails.",
    className: "col-span-1 row-span-2 lg:col-span-3 lg:row-span-2",
  },
  {
    src: "/blog/minimall-opening-2.jpg",
    alt: "ForgeRealm's shelves at The Mini Mall, stacked with printed dragons, dragon eggs, lamps and figurines.",
    className: "col-span-1 row-span-2 lg:col-span-3 lg:row-span-2",
  },
  {
    src: "/blog/minimall-opening-1.jpg",
    alt: "Inside The Mini Mall at the Merrion Centre in Leeds.",
    className: "col-span-2 lg:col-span-6",
  },
  {
    src: "/blog/minimall-shelf-detail.jpg",
    alt: "A close-up of one ForgeRealm shelf, lined with small printed figurines, mushrooms and trinkets.",
    className: "col-span-2 lg:col-span-6",
  },
];

export default function Stockist() {
  const section = useReveal<HTMLElement>();

  return (
    <section
      id="stockist"
      ref={section.ref}
      data-observe
      suppressHydrationWarning
      className={`reveal fr-paper fr-sheet relative mt-3 overflow-hidden py-16 sm:mt-4 sm:py-24 lg:py-28 ${section.isVisible ? "is-visible" : ""}`}
    >
      <div className="fr-wrap relative">
        {/* ── The announcement ────────────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-10">
          <h2 className="fr-h2 lg:col-span-7">
            Now on the shelf at{" "}
            <span className="fr-i whitespace-nowrap">The Mini Mall</span>
          </h2>

          <div className="lg:col-span-5">
            <p className="fr-body max-w-xl">
              You can pick up ForgeRealm prints in person at The Mini Mall
              inside the Merrion Centre, Leeds. Come and see the pieces up
              close, sharing the space with a load of other independent makers.
            </p>

            {/* Address, set as a labelled detail rather than another sentence */}
            <dl className="fr-line mt-7 grid grid-cols-2 gap-x-6 border-y py-5">
              <div>
                <dt className="fr-label fr-fg-3">Where</dt>
                <dd className="fr-px mt-2 text-[1.7rem] leading-[0.95] sm:text-[2rem]">
                  The Mini Mall
                </dd>
              </div>
              <div>
                <dt className="fr-label fr-fg-3">Inside</dt>
                <dd className="fr-px mt-2 text-[1.7rem] leading-[0.95] sm:text-[2rem]">
                  Merrion Centre, Leeds
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Merrion+Centre+Leeds"
                target="_blank"
                rel="noopener noreferrer"
                className="fr-btn fr-btn--solid"
              >
                Find the Merrion Centre
                <ArrowKnob />
              </a>
              <a href="/shop" className="fr-btn fr-btn--ghost">
                Browse the shop
                <ArrowKnob />
              </a>
            </div>
          </div>
        </div>

        {/* ── The bento, resting on a shelf ───────────────────────────── */}
        <div className="mt-12 sm:mt-16">
          <div className="grid auto-rows-[132px] grid-cols-2 gap-2 sm:auto-rows-[190px] sm:gap-3 lg:auto-rows-[250px] lg:grid-cols-12">
            {TILES.map((tile) => (
              <figure
                key={tile.src}
                className={`group relative overflow-hidden rounded-md bg-[#0f1433] ${tile.className}`}
              >
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </figure>
            ))}
          </div>

          {/* Shelf: an ink ledge with a cast shadow */}
          <div
            aria-hidden="true"
            className="mt-2 h-2.5 w-full rounded-b-[3px] sm:mt-3"
            style={{
              background: "var(--fg)",
              boxShadow: "0 18px 22px -14px rgba(15, 20, 51, 0.55)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
