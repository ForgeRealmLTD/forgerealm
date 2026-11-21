"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ───────── Data ───────── */

type BookKey = "pla" | "petg";

type BookMeta = {
  key: BookKey;
  title: string;
  subtitle: string;
  chip: string;
  bestFor: string;
  swatchFrom: string;
  swatchTo: string;
  accent: string; // accent color for cover details
  element: string; // RPG flavour: which element the tome belongs to
  stats: Array<[label: string, value: number]>; // out of 5, shown as pip bars
  coverGradient: string; // base background of the cover
  coverDark: string; // darker shade: the back board behind the pages
};

const BOOKS: Record<BookKey, BookMeta> = {
  pla: {
    key: "pla",
    title: "PLA",
    subtitle: "Polylactic Acid",
    chip: "Eco-friendly",
    bestFor: "Figurines, miniatures and display pieces",
    swatchFrom: "#a7e0a3",
    swatchTo: "#4f9b56",
    accent: "#34d399", // emerald
    element: "Earth",
    stats: [
      ["Detail", 5],
      ["Tough", 3],
      ["Heat", 2],
    ],
    // leaf green, flat and bright, so PLA reads as the "earth" book
    coverGradient: "linear-gradient(160deg, #2bb673 0%, #178a51 100%)",
    coverDark: "#0e5a34",
  },
  petg: {
    key: "petg",
    title: "PETG",
    subtitle: "Polyethylene Terephthalate Glycol",
    chip: "Recyclable",
    bestFor: "Functional prints and pieces that need to last",
    swatchFrom: "#a4c8ff",
    swatchTo: "#3b82f6",
    accent: "#60a5fa", // blue
    element: "Water",
    stats: [
      ["Detail", 4],
      ["Tough", 5],
      ["Heat", 4],
    ],
    // the owl's cobalt, so PETG reads as the "water" book
    coverGradient: "linear-gradient(160deg, #3d62ff 0%, #2039c9 100%)",
    coverDark: "#15237f",
  },
};

// Width of the cover board in em. Book pages use it to scale the same cover up.
const FACE_W_EM = 11.95;

const TYPE_COLORS: Record<string, string> = {
  Eco: "#27ae60",
  Biodegradable: "#16a085",
  Aesthetic: "#3498db",
  Recyclable: "#2980b9",
  Tough: "#e67e22",
};

/* ───────── Inline CSS (matches the sample's class names) ───────── */

const BOOK_CSS = `
.forgerealm-book { contain: layout paint; }

/* ── Tome: a pixel-art RPG book. Everything is sized in em, so one font-size
   on the wrapper scales the whole thing (selector, phone, book covers). */
.tome-notch {
  --n: 0.375em;
  clip-path: polygon(
    0 var(--n), var(--n) var(--n), var(--n) 0,
    calc(100% - var(--n)) 0, calc(100% - var(--n)) var(--n), 100% var(--n),
    100% calc(100% - var(--n)), calc(100% - var(--n)) calc(100% - var(--n)), calc(100% - var(--n)) 100%,
    var(--n) 100%, var(--n) calc(100% - var(--n)), 0 calc(100% - var(--n))
  );
}
.tome-item {
  display: flex; flex-direction: column; align-items: center;
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  letter-spacing: 0.03em; line-height: 1.15; color: #f0e8d8;
}
.tome-book { position: relative; display: block; width: 12.5em; height: 15.75em; }

/* The cover board: spine on the hinge side, then the cover */
.tome-face {
  position: relative; box-sizing: border-box; width: 100%; height: 100%;
  display: flex; overflow: hidden;
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  letter-spacing: 0.03em; line-height: 1.15; color: #f0e8d8;
}
.tome-face--back { flex-direction: row-reverse; }
/* Closed book: stacked hard shadows draw the page edges, the back board and the drop shadow */
.tome-book .tome-face {
  position: absolute; inset: 0 0.55em 0.55em 0; width: auto; height: auto;
  box-shadow:
    0.14em 0.14em 0 #f0e8d8,
    0.26em 0.26em 0 #b7a892,
    0.4em 0.4em 0 #f0e8d8,
    0.55em 0.55em 0 var(--tome-dark),
    1em 1em 0 rgba(0,0,0,0.5);
}
/* faint pixel grid over the cover colour */
.tome-face::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px);
  background-size: 0.5em 0.5em;
}
.tome-spine {
  position: relative; flex: none; width: 1.4em;
  background:
    linear-gradient(#f0e8d8, #f0e8d8) 0 13% / 100% 0.22em no-repeat,
    linear-gradient(#f0e8d8, #f0e8d8) 0 50% / 100% 0.22em no-repeat,
    linear-gradient(#f0e8d8, #f0e8d8) 0 87% / 100% 0.22em no-repeat,
    rgba(0,0,0,0.32);
  box-shadow: 0.125em 0 0 rgba(0,0,0,0.22);
}
.tome-face--back .tome-spine { box-shadow: -0.125em 0 0 rgba(0,0,0,0.22); }
.tome-cover {
  position: relative; flex: 1; min-width: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1em 0.9em; text-align: center;
}
/* tooled border line */
.tome-cover::before {
  content: ""; position: absolute; inset: 0.45em; pointer-events: none;
  border: 0.125em solid rgba(240,232,216,0.32);
}
.tome-cover > * { position: relative; }
/* metal corner guards on the opening edge */
.tome-corner { position: absolute; right: 0; width: 1.3em; height: 1.3em; background: #f0e8d8; }
.tome-corner--top { top: 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 66.6% 100%, 66.6% 66.6%, 33.3% 66.6%, 33.3% 33.3%, 0 33.3%); }
.tome-corner--bottom { bottom: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 66.6%, 33.3% 66.6%, 33.3% 33.3%, 66.6% 33.3%, 66.6% 0); }
.tome-face--back .tome-corner { right: auto; left: 0; transform: scaleX(-1); }

.tome-slot {
  flex: none; width: 4.2em; height: 4.2em; background: #f0e8d8;
  display: grid; place-items: center;
}
.tome-slot img { width: 80%; height: 80%; display: block; }
.tome-title {
  font-family: var(--fr-font-pixel); font-size: 3.6em; line-height: 0.8;
  margin-top: 0.14em; letter-spacing: 0;
  text-shadow: 0.05em 0.05em 0 rgba(0,0,0,0.28);
}
.tome-sub {
  min-height: 2.2em; margin-top: 0.3em; display: flex; align-items: center;
  font-size: max(0.85em, 12px); line-height: 1.05; color: rgba(240,232,216,0.92);
}
.tome-chip {
  margin-top: 0.35em; padding: 0.06em 0.5em 0.2em;
  font-size: max(0.9em, 12px); white-space: nowrap;
  background: #f0e8d8; color: #15110a;
}
/* clasp strap over the page edges, and a ribbon hanging out the bottom */
.tome-clasp {
  position: absolute; right: 0; top: 47%; width: 1.75em; height: 1em;
  background:
    linear-gradient(#f0e8d8, #f0e8d8) 0.3em 50% / 0.42em 0.42em no-repeat,
    var(--tome-dark);
  box-shadow: 0 0.125em 0 rgba(0,0,0,0.3);
}
.tome-ribbon {
  position: absolute; left: 60%; top: 100%; width: 0.75em; height: 1em;
  background: #ffb224;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 62%, 0 100%);
}

/* Stat panel: under the book on phones, beside it on desktop */
.tome-stats {
  box-sizing: border-box; width: 12em; margin-top: 1.5em;
  display: flex; flex-direction: column; padding: 0.5em 0.65em 0.55em;
  background: rgba(240,232,216,0.05); border: 0.125em solid rgba(240,232,216,0.18);
  text-align: left; transition: border-color 0.12s;
}
.tome-stat-rows { display: grid; row-gap: 0.3em; }
.tome-stat {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5em;
  font-size: max(0.95em, 13px); line-height: 1;
}
.tome-el { display: inline-flex; align-items: center; gap: 0.4em; }
.tome-el svg { width: 0.7em; height: 0.7em; }
.tome-pips { display: flex; gap: 0.2em; }
.tome-pip { width: 0.8em; height: 0.55em; background: rgba(240,232,216,0.15); }
.tome-pip[data-on] { background: #f0e8d8; }

/* Desktop: book | stats, so two tomes make four columns */
.tome-item--wide { flex-direction: row; align-items: flex-start; gap: 1.1em; }
.tome-item--wide .tome-stats {
  width: 12.5em; height: 15.2em; margin-top: 0; padding: 0.75em 0.8em 0.8em;
}
.tome-item--wide .tome-stat-rows { row-gap: 0.55em; }
.tome-best {
  margin-top: 0.8em; padding-top: 0.7em; border-top: 0.125em solid rgba(240,232,216,0.14);
  display: grid; row-gap: 0.2em; font-size: 0.95em; line-height: 1.12;
}
.tome-best-label { color: rgba(240,232,216,0.55); }
.tome-open {
  margin-top: auto; display: flex; align-items: center; justify-content: center;
  padding: 0.22em 0 0.36em; background: #f0e8d8; color: #15110a;
  font-size: 1.05em; transition: background-color 0.12s;
}
.tome-open svg { width: 0.5em; height: 0.5em; margin-left: 0.5em; }

.tome-cursor {
  display: inline-block; width: 0.55em; height: 0.55em; margin-right: 0.5em;
  color: #ffb224; animation: tome-blink 1s steps(1) infinite;
}
@keyframes tome-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tome-cursor { animation: none; } }

/* Back cover */
.tome-end-title { font-family: var(--fr-font-pixel); font-size: 2.1em; line-height: 0.85; margin-top: 0.35em; letter-spacing: 0; }
.tome-end-note {
  font-family: var(--fr-font-body); font-size: 0.6em; line-height: 1.5; letter-spacing: 0;
  max-width: 15em; margin-top: 1em; color: rgba(240,232,216,0.92);
}

/* ── Inside pages: blush-cream paper with navy ink, like the site's cream sections */
.forgerealm-book .page {
  background: #f7ebe1;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.forgerealm-book .page-content {
  position: relative;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 26px; text-align: center; box-sizing: border-box;
  color: #0f1433;
  font-family: var(--fr-font-body);
}
/* RPG window frame: a thin rule with square studs on the corners */
.forgerealm-book .page-content:not(.cover)::before {
  content: ""; position: absolute; inset: 9px; pointer-events: none;
  border: 2px solid rgba(15,20,51,0.2);
  background-origin: border-box;
  background:
    linear-gradient(#0f1433, #0f1433) 0 0 / 7px 7px no-repeat border-box,
    linear-gradient(#0f1433, #0f1433) 100% 0 / 7px 7px no-repeat border-box,
    linear-gradient(#0f1433, #0f1433) 0 100% / 7px 7px no-repeat border-box,
    linear-gradient(#0f1433, #0f1433) 100% 100% / 7px 7px no-repeat border-box;
}
.forgerealm-book .cover { padding: 0; background: #0b0a08; }
.forgerealm-book .tome-page { width: 100%; height: 100%; }

.forgerealm-book .material-container {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; width: 100%;
}
.forgerealm-book .material-swatch {
  width: 42%; max-width: 140px; aspect-ratio: 1 / 1; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #0f1433;
  font-family: var(--fr-font-pixel); font-weight: 400; font-synthesis: none;
  font-size: clamp(1.15rem, 3.2vw, 1.5rem);
  box-shadow: inset -6px -8px 18px rgba(0,0,0,0.16), 5px 5px 0 rgba(15,20,51,0.18);
  transition: transform 0.25s ease;
}
@media (hover: hover) {
  .forgerealm-book .material-swatch:hover { transform: scale(1.05); }
}

.forgerealm-book .material-name {
  font-family: var(--fr-font-pixel); font-weight: 400; font-synthesis: none;
  font-size: clamp(1.9rem, 4.2vw, 2.5rem); line-height: 0.9;
  color: #0f1433; margin-top: 4px;
}
.forgerealm-book .material-sub {
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  font-size: 16px; letter-spacing: 0.03em; line-height: 1.1;
  color: rgba(15,20,51,0.6); margin-bottom: 4px;
}
/* Property chips: square trait tags */
.forgerealm-book .material-type {
  display: inline-block; padding: 2px 9px 4px;
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  font-size: 15px; letter-spacing: 0.03em;
  color: white; margin: 0 3px 4px 3px;
  box-shadow: 3px 3px 0 rgba(15,20,51,0.2);
}
.forgerealm-book .material-description {
  font-family: var(--fr-font-body); font-size: 13.5px; color: rgba(15,20,51,0.82);
  margin-top: 6px; line-height: 1.5;
}
.forgerealm-book .evidence-eyebrow {
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  font-size: 16px; letter-spacing: 0.03em; color: #2747e0;
}
.forgerealm-book .evidence-heading {
  font-family: var(--fr-font-pixel); font-weight: 400; font-synthesis: none;
  font-size: clamp(1.6rem, 3.6vw, 2rem); line-height: 0.95;
  color: #0f1433; margin-top: 6px; margin-bottom: 10px;
}
.forgerealm-book .evidence-quote {
  font-family: var(--fr-font-body); font-style: italic;
  font-size: 0.9rem; color: #0f1433; line-height: 1.5;
  text-align: left; padding: 4px 0 4px 12px; margin: 6px 0;
  border-left: 3px solid #2747e0;
}
.forgerealm-book .evidence-source {
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  font-size: 15px; letter-spacing: 0.02em; line-height: 1.15; color: rgba(15,20,51,0.6);
  margin-top: 6px; text-align: left; width: 100%;
}
.forgerealm-book .cta-row { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; width: 100%; }
/* Menu-style buttons: square, with a hard shadow that presses in */
.forgerealm-book .cta-primary,
.forgerealm-book .cta-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8px 18px 10px; border: 2px solid #0f1433;
  font-family: var(--fr-font-label); font-weight: 400; font-synthesis: none;
  font-size: 18px; letter-spacing: 0.03em;
  text-decoration: none; cursor: pointer;
  box-shadow: 4px 4px 0 rgba(15,20,51,0.25);
  transition: transform 0.1s, box-shadow 0.1s;
}
.forgerealm-book .cta-primary { background: #0f1433; color: #f7ebe1; }
.forgerealm-book .cta-secondary { background: transparent; color: #0f1433; }
.forgerealm-book .cta-primary:hover,
.forgerealm-book .cta-secondary:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0 rgba(15,20,51,0.25); }

/* ── Library (selector) */
.forgerealm-library {
  display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
  padding: 2px 0 4px;
}
.forgerealm-library .cover-card { cursor: pointer; background: none; }
/* a flex item, so it stretches to the height of the tallest tome */
.tome-divider { flex: none; width: 2px; background: #ffb224; transition: opacity 0.2s; }
/* Selection highlight: everything bone-white in the stat panel turns amber,
   like a menu cursor landing on an item. Same rules for hover and keyboard focus.
   No (hover: hover) guard: some touch-capable laptops report hover: none even
   with a mouse, and a tap opens the book anyway, so a sticky hover costs nothing. */
.tome-stats, .tome-pip, .tome-open, .tome-best-label {
  transition: color 0.12s, background-color 0.12s, border-color 0.12s;
}
.forgerealm-library .cover-card:is(:hover, :focus-visible) .tome-stats { border-color: #ffb224; color: #ffb224; }
.forgerealm-library .cover-card:is(:hover, :focus-visible) .tome-pip[data-on],
.forgerealm-library .cover-card:is(:hover, :focus-visible) .tome-open { background: #ffb224; }
.forgerealm-library .cover-card:is(:hover, :focus-visible) .tome-best-label { color: rgba(255,178,36,0.6); }
.forgerealm-library .cover-card:focus-visible { outline: 2px solid #ffb224; outline-offset: 6px; }

/* Panel around the selector / open book (tablet and up) */
@media (min-width: 768px) {
  .tome-window {
    padding: 26px 28px 24px;
    background: #141210;
    border: 2px solid rgba(240,232,216,0.14);
    box-shadow: 8px 8px 0 rgba(0,0,0,0.45);
  }
}
`;

/* One-time CSS injection so React doesn't re-parse the string every render */
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  // Reuse the tag if it is already there: a hot reload must replace the rules,
  // not stack a second copy on top of stale ones.
  let style = document.querySelector<HTMLStyleElement>(
    "style[data-forgerealm-book]",
  );
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("data-forgerealm-book", "");
    document.head.appendChild(style);
  }
  style.textContent = BOOK_CSS;
}

/* ───────── Cover content (used both in selector & inside the book) ───────── */

/** 8x8 pixel icons for the tome's element. */
function ElementIcon({ element }: { element: string }) {
  return (
    <svg
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {element === "Water" ? (
        <path d="M3 0h2v2h1v1h1v3h-1v1h-4v-1h-1v-3h1v-1h1z" />
      ) : (
        <path d="M5 0h3v3h-1v1h-1v1h-1v1h-4v-3h1v-1h1v-1h2zM0 6h1v1h-1z" />
      )}
    </svg>
  );
}

/**
 * The cover board of a tome: ribbed spine on the hinge side, corner guards on
 * the opening edge, a tooled border. Fills its parent; `back` mirrors it.
 */
function TomeFace({
  meta,
  back = false,
  children,
}: {
  meta: BookMeta;
  back?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`tome-face${back ? " tome-face--back" : ""}`}
      style={{ background: meta.coverGradient }}
    >
      <span className="tome-spine" />
      <span className="tome-cover">{children}</span>
      <span className="tome-corner tome-corner--top" />
      <span className="tome-corner tome-corner--bottom" />
    </span>
  );
}

function OwlSlot() {
  return (
    <span className="tome-slot tome-notch">
      <img src="/frlogorv-384.webp" alt="" />
    </span>
  );
}

/* What is stamped on the front cover (selector and the book's own cover) */
function CoverContent({ meta }: { meta: BookMeta }) {
  return (
    <>
      <OwlSlot />
      <span className="tome-title">{meta.title}</span>
      <span className="tome-sub">{meta.subtitle}</span>
      <span className="tome-chip">{meta.chip}</span>
    </>
  );
}

const PIXEL_ARROW = "M0 0h2v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-2z";

/** `wide` is the desktop column: it has room for "best for" and an Open plate. */
function StatBlock({ meta, wide }: { meta: BookMeta; wide: boolean }) {
  return (
    <span className="tome-stats">
      <span className="tome-stat-rows">
        <span className="tome-stat">
          <span>Element</span>
          <span className="tome-el">
            <ElementIcon element={meta.element} />
            {meta.element}
          </span>
        </span>
        {meta.stats.map(([label, value]) => (
          <span className="tome-stat" key={label}>
            <span>{label}</span>
            <span
              className="tome-pips"
              role="img"
              aria-label={`${value} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="tome-pip"
                  data-on={n <= value ? "" : undefined}
                />
              ))}
            </span>
          </span>
        ))}
      </span>
      {wide && (
        <>
          <span className="tome-best">
            <span className="tome-best-label">Best for</span>
            <span>{meta.bestFor}</span>
          </span>
          <span className="tome-open">
            Open
            <svg
              viewBox="0 0 8 8"
              fill="currentColor"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <path d={PIXEL_ARROW} />
            </svg>
          </span>
        </>
      )}
    </span>
  );
}

/* ───────── The book selector (two cover cards) ───────── */

function BookSelector({
  onSelect,
  isMobile,
}: {
  onSelect: (k: BookKey) => void;
  isMobile: boolean;
}) {
  // Track which cover is being chosen so we can animate the others out + lift the chosen one
  const [pending, setPending] = useState<BookKey | null>(null);

  const handleSelect = (key: BookKey) => {
    if (pending) return;
    setPending(key);
    // Brief pause so the lift / fade reads as a deliberate selection, then hand off
    window.setTimeout(() => onSelect(key), 240);
  };

  return (
    <div
      className="forgerealm-library"
      style={{ columnGap: isMobile ? 10 : "clamp(22px, 2.6vw, 40px)" }}
    >
      {(["pla", "petg"] as BookKey[]).map((key, i) => {
        const meta = BOOKS[key];
        const isChosen = pending === key;
        const isFading = pending !== null && pending !== key;
        return (
          <Fragment key={key}>
            {/* Amber rule between the two tomes; it fades with the selection */}
            {i > 0 && (
              <span
                className="tome-divider"
                aria-hidden="true"
                style={{ opacity: pending ? 0 : 1 }}
              />
            )}
            <motion.button
              type="button"
              onClick={() => handleSelect(key)}
              className={`cover-card tome-item${isMobile ? "" : " tome-item--wide"}`}
              style={{
                // One font-size scales the whole tome. Phones fit two side by
                // side; desktop grows with the viewport so the row fills the panel.
                fontSize: isMobile
                  ? "clamp(11px, 3.2vw, 16px)"
                  : "clamp(14px, 1.45vw, 18px)",
                padding: 0,
                border: 0,
                cursor: pending ? "default" : "pointer",
              }}
              aria-label={`Open the ${meta.title} codex`}
              initial={false}
              animate={{
                opacity: isFading ? 0 : 1,
                scale: isChosen ? 1.04 : isFading ? 0.96 : 1,
                y: isChosen ? -4 : isFading ? 8 : 0,
              }}
              whileHover={!pending && !isMobile ? { y: -5 } : undefined}
              whileTap={!pending ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="tome-book"
                style={{ ["--tome-dark" as never]: meta.coverDark }}
              >
                <TomeFace meta={meta}>
                  <CoverContent meta={meta} />
                </TomeFace>
                <span className="tome-clasp" />
                <span className="tome-ribbon" />
              </span>
              <StatBlock meta={meta} wide={!isMobile} />
            </motion.button>
          </Fragment>
        );
      })}
    </div>
  );
}

/* ───────── Active book view (the flipbook) ───────── */

function BookView({
  material,
  onBack,
  HTMLFlipBook,
  isMobile,
}: {
  material: BookKey;
  onBack: () => void;
  HTMLFlipBook: ComponentType<Record<string, unknown>>;
  isMobile: boolean;
}) {
  const meta = BOOKS[material];
  const bookRef = useRef<{
    pageFlip: () => {
      turnToPage: (n: number) => void;
      flipPrev: () => void;
      flipNext: () => void;
    };
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasAutoOpenedRef = useRef(false);

  // Auto-open after entry on desktop only — on mobile the extra flip animation
  // right after the entry transition makes things feel sluggish, so the user
  // flips the cover themselves.
  useEffect(() => {
    if (isMobile) return;
    const t = window.setTimeout(() => {
      if (!hasAutoOpenedRef.current) {
        hasAutoOpenedRef.current = true;
        bookRef.current?.pageFlip?.().flipNext();
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [isMobile]);

  const pageW = isMobile ? 330 : 400;
  const pageH = isMobile ? 450 : 540;
  const coverScale = pageW / (FACE_W_EM * 16);

  const turnTo = (n: number) => bookRef.current?.pageFlip?.().turnToPage(n);
  const flipPrev = () => bookRef.current?.pageFlip?.().flipPrev();
  const flipNext = () => bookRef.current?.pageFlip?.().flipNext();

  /* Build the page list per material — memoized so BookView re-renders (e.g. on resize) don't rebuild the JSX tree */
  const pages: ReactNode[] = useMemo(() => {
    const built: ReactNode[] = [];

    // Front cover
    built.push(
      <div className="page" key="cover">
        <div className="page-content cover">
          <div className="tome-page" style={{ fontSize: 16 * coverScale }}>
            <TomeFace meta={meta}>
              <CoverContent meta={meta} />
            </TomeFace>
          </div>
        </div>
      </div>,
    );

    // Material page
    built.push(
      <div className="page" key="material">
        <div className="page-content">
          <div className="material-container">
            <div
              className="material-swatch"
              style={{
                background: `linear-gradient(135deg, ${meta.swatchFrom} 0%, ${meta.swatchTo} 100%)`,
              }}
            >
              {meta.title}
            </div>
            <h2 className="material-name">{meta.title}</h2>
            <p className="material-sub">{meta.subtitle}</p>
            <div>
              {(material === "pla"
                ? ["Eco", "Biodegradable"]
                : ["Recyclable", "Tough"]
              ).map((t) => (
                <span
                  key={t}
                  className="material-type"
                  style={{ background: TYPE_COLORS[t] || "#34495e" }}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="material-description">
              {material === "pla"
                ? "Made from fermented plant sugars rather than petroleum. Plant-derived, hand-finished, and engineered to return to nature when its time is up. Our go-to for figurines, miniatures, and most booth display work."
                : "Tougher and more impact-resistant than PLA, with better layer adhesion and chemical resistance. Same plastic family as the bottles you recycle every week. We use it for functional prints and pieces that need to last."}
            </p>
          </div>
        </div>
      </div>,
    );

    // Evidence page
    built.push(
      <div className="page" key="evidence">
        <div className="page-content">
          <p className="evidence-eyebrow">Evidence</p>
          <h2 className="evidence-heading">
            {material === "pla" ? "PLA returns to nature" : "PETG holds up"}
          </h2>
          <p
            className="evidence-quote"
            style={{
              borderLeftColor:
                material === "pla"
                  ? "rgba(16,185,129,0.6)"
                  : "rgba(59,130,246,0.6)",
            }}
          >
            {material === "pla"
              ? '"PLA will eventually fully hydrolyze and biodegrade, meaning no persistent particles should remain and accumulate in the environment."'
              : '"Improvements across multiple mechanical attributes including tensile strength, hardness, fatigue resistance, and impact strength."'}
          </p>
          <p className="evidence-source">
            {material === "pla"
              ? "Holland Bioplastics, meta-study by HYDRA Marine Sciences"
              : "Kuchampudi, Meena & Chekuri, Cogent Engineering, 2024"}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#34495e",
              marginTop: 14,
              lineHeight: 1.5,
              fontFamily: "var(--fr-font-body)",
            }}
          >
            {material === "pla" ? (
              <>
                PLA's building block, lactic acid, is recognised as{" "}
                <strong style={{ color: "#1a2842" }}>
                  Generally Recognized as Safe
                </strong>{" "}
                by the U.S. FDA.
              </>
            ) : (
              <>
                When tuned for print speed, layer height, and infill, PETG
                measurably outperforms on the metrics that matter for parts you
                actually use.
              </>
            )}
          </p>
        </div>
      </div>,
    );

    // PLA-only Silk PLA variant page
    if (material === "pla") {
      built.push(
        <div className="page" key="silk">
          <div className="page-content">
            <div className="material-container">
              <div
                className="material-swatch"
                style={{
                  background:
                    "linear-gradient(135deg, #c2f5ff 0%, #7dd3fc 100%)",
                }}
              >
                Silk
              </div>
              <h2 className="material-name">Silk PLA</h2>
              <p className="material-sub">Aesthetic variant</p>
              <div>
                {["Eco", "Aesthetic"].map((t) => (
                  <span
                    key={t}
                    className="material-type"
                    style={{ background: TYPE_COLORS[t] || "#34495e" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="material-description">
                Same plant-derived backbone as PLA, but the surface catches
                light like brushed metal, most striking in direct sunlight.
                Reach for it on lamps, statement pieces, and anything we want to
                glow.
              </p>
            </div>
          </div>
        </div>,
      );
    }

    // Closing CTA
    built.push(
      <div className="page" key="cta">
        <div className="page-content">
          <p className="evidence-eyebrow">Order in {meta.title}</p>
          <h2 className="evidence-heading">Tell us what it's for</h2>
          <p className="material-description">
            Every custom order specifies its filament. Let us know what the
            piece is for and we'll build it in {meta.title}.
          </p>
          <div className="cta-row">
            <a
              className="cta-primary"
              href={`/custom-order?material=${meta.key}`}
            >
              Get a custom quote
            </a>
            <a className="cta-secondary" href="/shop">
              Browse the shop
            </a>
          </div>
        </div>
      </div>,
    );

    // Back cover: the same board mirrored, signed off
    built.push(
      <div className="page" key="back">
        <div className="page-content cover">
          <div className="tome-page" style={{ fontSize: 16 * coverScale }}>
            <TomeFace meta={meta} back>
              <OwlSlot />
              <span className="tome-end-title">ForgeRealm</span>
              <span>Leeds, United Kingdom</span>
              <span className="tome-end-note">
                Designed, printed, and finished in-house, one layer at a time.
              </span>
            </TomeFace>
          </div>
        </div>
      </div>,
    );

    return built;
  }, [material, meta, coverScale]);

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Back to library link */}
      <button
        type="button"
        onClick={onBack}
        style={{
          marginBottom: 18,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(240,232,216,0.9)",
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "0.03em",
          fontFamily: "var(--fr-font-label)",
          cursor: "pointer",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to library
      </button>

      <div
        style={{
          // No drop-shadow filter on mobile: react-pageflip's internal shadows handle it, and GPU filters are expensive
          filter: isMobile
            ? undefined
            : "drop-shadow(0 26px 50px rgba(0,0,0,0.5))",
          willChange: "transform",
        }}
      >
        <HTMLFlipBook
          key={`${material}-${isMobile ? "m" : "d"}`}
          ref={bookRef as never}
          width={pageW}
          height={pageH}
          size="fixed"
          usePortrait={isMobile}
          maxShadowOpacity={isMobile ? 0.35 : 0.5}
          drawShadow
          showCover
          // false: stop intercepting touchmove so the page can scroll normally on mobile
          mobileScrollSupport={false}
          flippingTime={isMobile ? 550 : 800}
          useMouseEvents
          swipeDistance={30}
          showPageCorners={!isMobile}
          disableFlipByClick={false}
          autoSize={false}
          startPage={0}
          startZIndex={0}
          clickEventForward
          className="forgerealm-book"
          style={{}}
        >
          {pages}
        </HTMLFlipBook>
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={flipPrev}
          aria-label="Previous page"
          style={controlBtnStyle}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => turnTo(0)}
          style={{
            ...pillBtnStyle,
            border: `1px solid ${meta.accent}4D`,
            background: `${meta.accent}10`,
            color: meta.accent,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 17l-5-5 5-5" />
            <path d="M18 17l-5-5 5-5" />
          </svg>
          Back to cover
        </button>

        <button
          type="button"
          onClick={flipNext}
          aria-label="Next page"
          style={controlBtnStyle}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p
        style={{
          marginTop: 12,
          fontSize: 16,
          letterSpacing: "0.03em",
          color: "rgba(240,232,216,0.55)",
          fontFamily: "var(--fr-font-label)",
        }}
      >
        Tap or drag a page corner to turn
      </p>
    </div>
  );
}

const controlBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 38,
  height: 38,
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(240,232,216,0.9)",
  cursor: "pointer",
};

const pillBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 16px",
  borderRadius: 4,
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: "0.03em",
  fontFamily: "var(--fr-font-label)",
  cursor: "pointer",
};

/* ───────── Top-level component ───────── */

export default function MaterialsBook() {
  const [HTMLFlipBook, setHTMLFlipBook] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<BookKey | null>(null);

  useEffect(() => {
    injectCSS();
    import("react-pageflip").then((mod) => {
      setHTMLFlipBook(
        () => mod.default as unknown as ComponentType<Record<string, unknown>>,
      );
    });
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      className="forgerealm-book"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {!HTMLFlipBook ? (
        <div
          className="flex items-center justify-center"
          style={{ minHeight: 480 }}
        >
          <span
            style={{
              fontFamily: "var(--fr-font-label)",
              fontSize: 16,
              letterSpacing: "0.03em",
              color: "rgba(240,232,216,0.6)",
            }}
          >
            Opening the library…
          </span>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            width: "100%",
            // Each state (selector / open book) now has its own card around it, so
            // we size the parent's reserved height to the active state — keeps
            // page reflow minimal during the transition without leaving dead
            // space below the smaller closed-card state.
            minHeight: active ? (isMobile ? 520 : 640) : isMobile ? 330 : 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {active ? (
              <motion.div
                key={`book-${active}`}
                initial={
                  isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }
                }
                animate={
                  isMobile ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }
                }
                transition={{
                  duration: isMobile ? 0.18 : 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="tome-window"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <BookView
                  material={active}
                  onBack={() => setActive(null)}
                  HTMLFlipBook={HTMLFlipBook}
                  isMobile={isMobile}
                />
              </motion.div>
            ) : (
              <motion.div
                key="selector"
                initial={
                  isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }
                }
                animate={
                  isMobile ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }
                }
                transition={{
                  duration: isMobile ? 0.15 : 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="tome-window"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <BookSelector onSelect={setActive} isMobile={isMobile} />
                <p
                  style={{
                    marginTop: 14,
                    fontSize: 16,
                    letterSpacing: "0.03em",
                    color: "rgba(240,232,216,0.55)",
                    fontFamily: "var(--fr-font-label)",
                  }}
                >
                  <svg
                    className="tome-cursor"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                    shapeRendering="crispEdges"
                    aria-hidden="true"
                  >
                    <path d={PIXEL_ARROW} />
                  </svg>
                  Pick a codex to open
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
