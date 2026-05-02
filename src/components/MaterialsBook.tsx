'use client';

import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ───────── Data ───────── */

type BookKey = 'pla' | 'petg';

type BookMeta = {
  key: BookKey;
  title: string;
  subtitle: string;
  chip: string;
  swatchFrom: string;
  swatchTo: string;
  accent: string; // accent color for cover details
  ribbonColor: string; // ribbon/spine color
  coverGradient: string; // base background of the cover
  innerFrame: string; // colour of the inner decorative frame
  spineAccent: string; // colour of the left spine highlight on selector cards
};

const BOOKS: Record<BookKey, BookMeta> = {
  pla: {
    key: 'pla',
    title: 'PLA',
    subtitle: 'Polylactic Acid',
    chip: 'Eco-friendly',
    swatchFrom: '#a7e0a3',
    swatchTo: '#4f9b56',
    accent: '#34d399', // emerald
    ribbonColor: 'rgba(16,185,129,0.7)',
    // forest / moss tinted depths so PLA reads as the "earth" book
    coverGradient: 'linear-gradient(135deg, #0a2418 0%, #143828 45%, #061810 100%)',
    innerFrame: 'rgba(52,211,153,0.32)',
    spineAccent: 'rgba(52,211,153,0.5)',
  },
  petg: {
    key: 'petg',
    title: 'PETG',
    subtitle: 'Polyethylene Terephthalate Glycol',
    chip: 'Recyclable',
    swatchFrom: '#a4c8ff',
    swatchTo: '#3b82f6',
    accent: '#60a5fa', // blue
    ribbonColor: 'rgba(59,130,246,0.7)',
    // deeper sapphire / indigo so PETG reads as the "water" book
    coverGradient: 'linear-gradient(135deg, #0a1842 0%, #14306a 45%, #04101f 100%)',
    innerFrame: 'rgba(96,165,250,0.32)',
    spineAccent: 'rgba(96,165,250,0.55)',
  },
};

const TYPE_COLORS: Record<string, string> = {
  Eco: '#27ae60',
  Biodegradable: '#16a085',
  Aesthetic: '#3498db',
  Recyclable: '#2980b9',
  Tough: '#e67e22',
};

/* ───────── Inline CSS (matches the sample's class names) ───────── */

const BOOK_CSS = `
.forgerealm-book { contain: layout paint; }
.forgerealm-book .page {
  background: linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%);
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.forgerealm-book .page-content {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 24px; text-align: center; box-sizing: border-box;
}
.forgerealm-book .cover {
  background: linear-gradient(135deg, #0a1838 0%, #102a55 45%, #08111f 100%);
  color: #f4f5f8; font-weight: bold; position: relative;
}
.forgerealm-book .cover-frame-outer,
.forgerealm-book .cover-frame-inner {
  position: absolute; border-radius: 4px; pointer-events: none;
}
.forgerealm-book .cover-frame-outer { inset: 12px; border: 1px solid rgba(250,222,106,0.3); }
.forgerealm-book .cover-frame-inner { inset: 20px; border: 1px solid rgba(34,211,238,0.18); }

.forgerealm-book .material-container {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; width: 100%;
}
.forgerealm-book .material-swatch {
  width: 60%; max-width: 200px; aspect-ratio: 1 / 1; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #0c1726;
  font-family: 'Cinzel', serif; font-weight: 600;
  font-size: clamp(0.95rem, 3vw, 1.4rem); letter-spacing: 0.06em;
  box-shadow: inset -6px -8px 18px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.14);
  transition: transform 0.25s ease;
}
@media (hover: hover) {
  .forgerealm-book .material-swatch {
    box-shadow: inset -10px -14px 32px rgba(0,0,0,0.20), 0 8px 22px rgba(0,0,0,0.18);
  }
  .forgerealm-book .material-swatch:hover { transform: scale(1.05); }
}

.forgerealm-book .material-name {
  font-family: 'Cinzel', serif; font-size: clamp(1.1rem, 3.2vw, 1.9rem);
  font-weight: 600; color: #2c3e50; margin-bottom: 2px;
}
.forgerealm-book .material-sub {
  font-family: 'Jost', sans-serif; font-size: clamp(0.65rem, 1.6vw, 0.8rem);
  color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 6px;
}
.forgerealm-book .material-type {
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  font-size: clamp(0.6rem, 1.4vw, 0.78rem); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: white; margin: 0 3px 6px 3px; font-family: 'Jost', sans-serif;
}
.forgerealm-book .material-description {
  font-family: 'Inter', sans-serif; font-size: 13.5px; color: #34495e;
  margin-top: 8px; line-height: 1.5;
}
.forgerealm-book .evidence-eyebrow {
  font-family: 'Jost', sans-serif; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.3em; color: #9c8e76;
}
.forgerealm-book .evidence-heading {
  font-family: 'Cinzel', serif; font-size: clamp(1.05rem, 3vw, 1.5rem);
  color: #1a2842; margin-top: 8px; margin-bottom: 12px;
}
.forgerealm-book .evidence-quote {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(0.9rem, 2.2vw, 1.05rem); color: #1a2842; line-height: 1.55;
  text-align: left; padding: 4px 0 4px 14px; margin: 6px 0;
  border-left: 2px solid rgba(16,185,129,0.6);
}
.forgerealm-book .evidence-source {
  font-family: 'Jost', sans-serif; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.18em; color: #7b6e58;
  margin-top: 6px; text-align: left; width: 100%;
}
.forgerealm-book .cta-row { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; width: 100%; }
.forgerealm-book .cta-primary,
.forgerealm-book .cta-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 18px; border-radius: 999px;
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em;
  text-decoration: none; cursor: pointer; transition: transform 0.2s;
}
.forgerealm-book .cta-primary {
  background: linear-gradient(90deg, #1d4ed8, #06b6d4);
  color: white; box-shadow: 0 6px 16px rgba(29,78,216,0.25);
  font-family: 'Cinzel', serif;
}
.forgerealm-book .cta-secondary {
  background: rgba(255,255,255,0.5); border: 1px solid rgba(26,40,66,0.18);
  color: #1a2842; font-family: 'Jost', sans-serif;
}
.forgerealm-book .cta-primary:hover,
.forgerealm-book .cta-secondary:hover { transform: translateY(-1px); }

/* Library (selector) covers */
.forgerealm-library {
  display: flex; gap: 28px; flex-wrap: wrap; justify-content: center;
  perspective: 1400px;
}
.forgerealm-library .cover-card {
  position: relative; cursor: pointer;
  background: linear-gradient(135deg, #0a1838 0%, #102a55 45%, #08111f 100%);
  border-radius: 6px; overflow: hidden;
  color: #f4f5f8;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
  box-shadow: 0 18px 40px rgba(0,0,0,0.45), 0 4px 14px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.06);
}
.forgerealm-library .cover-card::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 14px;
  background: linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0));
  pointer-events: none;
}
.forgerealm-library .cover-card::after {
  content: ""; position: absolute; left: 14px; top: 0; bottom: 0; width: 1px;
  background: var(--spine-accent, rgba(250,222,106,0.18));
  pointer-events: none;
}
@media (hover: hover) {
  .forgerealm-library .cover-card:hover {
    transform: translateY(-6px) rotateX(2deg) rotateY(-2deg);
    box-shadow: 0 28px 60px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.35);
  }
}
`;

/* One-time CSS injection so React doesn't re-parse the string every render */
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-forgerealm-book', '');
  style.textContent = BOOK_CSS;
  document.head.appendChild(style);
}

/* ───────── Cover content (used both in selector & inside the book) ───────── */

function CoverContent({ meta }: { meta: BookMeta }) {
  return (
    <>
      <div className="cover-frame-outer" />
      <div className="cover-frame-inner" style={{ borderColor: meta.innerFrame }} />

      {/* Radial glow tinted with the material accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 38%, ${meta.accent}26, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top flourish */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <span style={{ height: 1, width: 32, background: 'rgba(250,222,106,0.4)' }} />
        <span style={{ color: 'rgba(250,222,106,0.7)', fontSize: 10, letterSpacing: '0.4em', fontFamily: "'Jost', sans-serif" }}>✦</span>
        <span style={{ height: 1, width: 32, background: 'rgba(250,222,106,0.4)' }} />
      </div>

      {/* Sigil */}
      <div
        style={{
          position: 'relative',
          marginTop: 18,
          width: 96,
          height: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(250,222,106,0.35)' }} />
        <span style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `1px solid ${meta.accent}40` }} />
        <img
          src="/headfrlogorv.png"
          alt="ForgeRealm"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            boxShadow: `0 0 24px rgba(250,222,106,0.35), 0 0 48px ${meta.accent}30`,
          }}
        />
      </div>

      {/* House name */}
      <p
        style={{
          marginTop: 20,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.5em',
          color: 'rgba(103,232,249,0.7)',
          fontFamily: "'Jost', sans-serif",
        }}
      >
        ForgeRealm
      </p>

      {/* Material title */}
      <h1
        style={{
          marginTop: 12,
          fontSize: 'clamp(2rem, 5.4vw, 3rem)',
          lineHeight: 1.0,
          color: 'white',
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.05em',
        }}
      >
        {meta.title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          marginTop: 6,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: 'rgba(203,213,225,0.7)',
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {meta.subtitle}
      </p>

      {/* Volume marker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <span style={{ height: 1, width: 32, background: 'linear-gradient(90deg, transparent, rgba(250,222,106,0.5), transparent)' }} />
        <span
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5em',
            color: 'rgba(250,222,106,0.85)',
            fontFamily: "'Jost', sans-serif",
          }}
        >
          The Codex
        </span>
        <span style={{ height: 1, width: 32, background: 'linear-gradient(90deg, transparent, rgba(250,222,106,0.5), transparent)' }} />
      </div>

      {/* Chip */}
      <span
        style={{
          marginTop: 14,
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          background: `${meta.accent}1A`,
          border: `1px solid ${meta.accent}66`,
          color: meta.accent,
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {meta.chip}
      </span>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.4em',
          color: 'rgba(148,163,184,0.75)',
          fontFamily: "'Jost', sans-serif",
        }}
      >
        <span>Forged in Leeds</span>
        <span style={{ height: 1, width: 22, background: 'rgba(148,163,184,0.5)' }} />
        <span>MMXXVI</span>
      </div>
    </>
  );
}

/* ───────── The book selector (two cover cards) ───────── */

function BookSelector({ onSelect, isMobile }: { onSelect: (k: BookKey) => void; isMobile: boolean }) {
  const cardW = isMobile ? 280 : 340;
  const cardH = isMobile ? 400 : 480;
  // Track which cover is being chosen so we can animate the others out + lift the chosen one
  const [pending, setPending] = useState<BookKey | null>(null);

  const handleSelect = (key: BookKey) => {
    if (pending) return;
    setPending(key);
    // Brief pause so the lift / fade reads as a deliberate selection, then hand off
    window.setTimeout(() => onSelect(key), 240);
  };

  return (
    <div className="forgerealm-library">
      {(['pla', 'petg'] as BookKey[]).map((key) => {
        const meta = BOOKS[key];
        const isChosen = pending === key;
        const isFading = pending !== null && pending !== key;
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => handleSelect(key)}
            className="cover-card"
            style={{
              width: cardW,
              height: cardH,
              padding: 0,
              border: 0,
              cursor: pending ? 'default' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              background: meta.coverGradient,
              ['--spine-accent' as never]: meta.spineAccent,
            }}
            aria-label={`Open the ${meta.title} codex`}
            initial={false}
            animate={{
              opacity: isFading ? 0 : 1,
              scale: isChosen ? 1.05 : isFading ? 0.94 : 1,
              y: isChosen ? -6 : isFading ? 12 : 0,
            }}
            whileTap={!pending ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 22px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <CoverContent meta={meta} />
            </div>
          </motion.button>
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
  const bookRef = useRef<{ pageFlip: () => { turnToPage: (n: number) => void; flipPrev: () => void; flipNext: () => void } } | null>(null);
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

  const pageW = isMobile ? 360 : 500;
  const pageH = isMobile ? 500 : 680;

  const turnTo = (n: number) => bookRef.current?.pageFlip?.().turnToPage(n);
  const flipPrev = () => bookRef.current?.pageFlip?.().flipPrev();
  const flipNext = () => bookRef.current?.pageFlip?.().flipNext();

  /* Build the page list per material — memoized so BookView re-renders (e.g. on resize) don't rebuild the JSX tree */
  const pages: ReactNode[] = useMemo(() => {
    const built: ReactNode[] = [];

    // Front cover
    built.push(
    <div className="page" key="cover">
      <div className="page-content cover" style={{ background: meta.coverGradient }}>
        <CoverContent meta={meta} />
      </div>
    </div>
  );

  // Material page
  built.push(
    <div className="page" key="material">
      <div className="page-content">
        <div className="material-container">
          <div
            className="material-swatch"
            style={{ background: `linear-gradient(135deg, ${meta.swatchFrom} 0%, ${meta.swatchTo} 100%)` }}
          >
            {meta.title}
          </div>
          <h2 className="material-name">{meta.title}</h2>
          <p className="material-sub">{meta.subtitle}</p>
          <div>
            {(material === 'pla' ? ['Eco', 'Biodegradable'] : ['Recyclable', 'Tough']).map((t) => (
              <span key={t} className="material-type" style={{ background: TYPE_COLORS[t] || '#34495e' }}>
                {t}
              </span>
            ))}
          </div>
          <p className="material-description">
            {material === 'pla'
              ? 'Made from fermented plant sugars rather than petroleum. Plant-derived, hand-finished, and engineered to return to nature when its time is up. Our go-to for figurines, miniatures, and most booth display work.'
              : 'Tougher and more impact-resistant than PLA, with better layer adhesion and chemical resistance. Same plastic family as the bottles you recycle every week. We use it for functional prints and pieces that need to last.'}
          </p>
        </div>
      </div>
    </div>
  );

  // Evidence page
    built.push(
    <div className="page" key="evidence">
      <div className="page-content">
        <p className="evidence-eyebrow">Evidence</p>
        <h2 className="evidence-heading">
          {material === 'pla' ? 'PLA returns to nature' : 'PETG holds up'}
        </h2>
        <p
          className="evidence-quote"
          style={{ borderLeftColor: material === 'pla' ? 'rgba(16,185,129,0.6)' : 'rgba(59,130,246,0.6)' }}
        >
          {material === 'pla'
            ? '"PLA will eventually fully hydrolyze and biodegrade, meaning no persistent particles should remain and accumulate in the environment."'
            : '"Improvements across multiple mechanical attributes including tensile strength, hardness, fatigue resistance, and impact strength."'}
        </p>
        <p className="evidence-source">
          {material === 'pla'
            ? 'Holland Bioplastics, meta-study by HYDRA Marine Sciences'
            : 'Kuchampudi, Meena & Chekuri, Cogent Engineering, 2024'}
        </p>
        <p
          style={{
            fontSize: 13,
            color: '#34495e',
            marginTop: 14,
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {material === 'pla' ? (
            <>
              PLA's building block, lactic acid, is recognised as{' '}
              <strong style={{ color: '#1a2842' }}>Generally Recognized as Safe</strong> by the U.S. FDA.
            </>
          ) : (
            <>
              When tuned for print speed, layer height, and infill, PETG measurably outperforms on the metrics that matter for parts you actually
              use.
            </>
          )}
        </p>
      </div>
    </div>
  );

  // PLA-only Silk PLA variant page
  if (material === 'pla') {
      built.push(
      <div className="page" key="silk">
        <div className="page-content">
          <div className="material-container">
            <div
              className="material-swatch"
              style={{ background: 'linear-gradient(135deg, #c2f5ff 0%, #7dd3fc 100%)' }}
            >
              Silk
            </div>
            <h2 className="material-name">Silk PLA</h2>
            <p className="material-sub">Aesthetic variant</p>
            <div>
              {['Eco', 'Aesthetic'].map((t) => (
                <span key={t} className="material-type" style={{ background: TYPE_COLORS[t] || '#34495e' }}>
                  {t}
                </span>
              ))}
            </div>
            <p className="material-description">
              Same plant-derived backbone as PLA, but the surface catches light like brushed metal, most striking in direct sunlight. Reach for it on
              lamps, statement pieces, and anything we want to glow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Closing CTA
    built.push(
    <div className="page" key="cta">
      <div className="page-content">
        <p className="evidence-eyebrow">Order in {meta.title}</p>
        <h2 className="evidence-heading">Tell us what it's for</h2>
        <p className="material-description">
          Every custom order specifies its filament. Let us know what the piece is for and we'll build it in {meta.title}.
        </p>
        <div className="cta-row">
          <a className="cta-primary" href={`/custom-order?material=${meta.key}`}>
            Get a custom quote
          </a>
          <a className="cta-secondary" href="/shop">
            Browse the shop
          </a>
        </div>
      </div>
    </div>
  );

  // Back cover
    built.push(
    <div className="page" key="back">
      <div className="page-content cover" style={{ background: meta.coverGradient }}>
        <div className="cover-frame-outer" />
        <div className="cover-frame-inner" style={{ borderColor: meta.innerFrame }} />
        <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg, transparent, rgba(250,222,106,0.6), transparent)' }} />
        <p style={{ marginTop: 18, fontSize: 'clamp(1.4rem, 3.6vw, 2rem)', color: 'white', fontFamily: "'Cinzel', serif" }}>
          ForgeRealm
        </p>
        <p
          style={{
            marginTop: 6,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.4em',
            color: 'rgba(103,232,249,0.7)',
            fontFamily: "'Jost', sans-serif",
          }}
        >
          Leeds, United Kingdom
        </p>
        <p
          style={{
            marginTop: 14,
            fontSize: 13,
            color: 'rgba(203,213,225,0.85)',
            fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', serif",
            maxWidth: 220,
            lineHeight: 1.5,
          }}
        >
          Designed, printed, and finished in-house, one layer at a time.
        </p>
        <div
          style={{
            position: 'absolute',
            bottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.4em',
            color: 'rgba(148,163,184,0.7)',
            fontFamily: "'Jost', sans-serif",
          }}
        >
          <span>End</span>
          <span style={{ height: 1, width: 28, background: 'rgba(148,163,184,0.5)' }} />
          <span>{meta.title} Codex</span>
        </div>
      </div>
    </div>
  );

    return built;
  }, [material, meta]);

  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Back to library link */}
      <button
        type="button"
        onClick={onBack}
        style={{
          marginBottom: 18,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(226,232,240,0.85)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          fontFamily: "'Jost', sans-serif",
          cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to library
      </button>

      <div
        style={{
          // No drop-shadow filter on mobile: react-pageflip's internal shadows handle it, and GPU filters are expensive
          filter: isMobile ? undefined : 'drop-shadow(0 26px 50px rgba(0,0,0,0.5))',
          willChange: 'transform',
        }}
      >
        <HTMLFlipBook
          key={`${material}-${isMobile ? 'm' : 'd'}`}
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
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={flipPrev}
          aria-label="Previous page"
          style={controlBtnStyle}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p
        style={{
          marginTop: 12,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: 'rgba(110,231,183,0.55)',
          fontFamily: "'Jost', sans-serif",
        }}
      >
        Tap or drag a page corner to turn
      </p>
    </div>
  );
}

const controlBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(226,232,240,0.85)',
  cursor: 'pointer',
};

const pillBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 16px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.22em',
  fontFamily: "'Jost', sans-serif",
  cursor: 'pointer',
};

/* ───────── Top-level component ───────── */

export default function MaterialsBook() {
  const [HTMLFlipBook, setHTMLFlipBook] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<BookKey | null>(null);

  useEffect(() => {
    injectCSS();
    import('react-pageflip').then((mod) => {
      setHTMLFlipBook(() => mod.default as unknown as ComponentType<Record<string, unknown>>);
    });
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="forgerealm-book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {!HTMLFlipBook ? (
        <div className="flex items-center justify-center" style={{ minHeight: 480 }}>
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              color: 'rgba(148,163,184,0.7)',
            }}
          >
            Opening the library…
          </span>
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            // Hold the parent height steady through the transition so the page doesn't reflow / scroll-jump
            minHeight: isMobile ? 720 : 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {active ? (
              <motion.div
                key={`book-${active}`}
                initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
                animate={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: isMobile ? 0.18 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <BookView material={active} onBack={() => setActive(null)} HTMLFlipBook={HTMLFlipBook} isMobile={isMobile} />
              </motion.div>
            ) : (
              <motion.div
                key="selector"
                initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
                animate={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }}
                transition={{ duration: isMobile ? 0.15 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <BookSelector onSelect={setActive} isMobile={isMobile} />
                <p
                  style={{
                    marginTop: 22,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.28em',
                    color: 'rgba(110,231,183,0.55)',
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
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
