"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, svg, scrambleText } from "animejs";
import type { JSAnimation } from "animejs";
import AnimatedHeading from "./anime/AnimatedHeading";
import ModelViewer from "./ModelViewer";
import type { AnchorPoint } from "./ModelViewer";
import { EASE, DUR, STEP, prefersReducedMotion } from "../hooks/motion";
import { useScrollScrub } from "../hooks/useScrollScrub";
import { useLoopGroup } from "../hooks/useLoopGroup";

/**
 * Exploded-diagram-style showcase, borrowed from the animejs.com toolbox
 * section: a central product image with thin leader lines drawing outward
 * to callout labels rendered as monospace pills.
 *
 * The line paths are computed at runtime from real DOM bounding boxes so
 * they always start at the correct label edge and land on the right point
 * of the image, at any container width. The assembly is scrubbed by scroll
 * position (not a one-shot trigger): as the section crosses the viewport
 *   1. the focal model converges (scale)
 *   2. the exploded label pills slide inward from either side
 *   3. each leader line stroke-draws in sequence
 *   4. hotspot dots resolve into place
 * Label text scrambles once on scroll into view, and the hotspot pulse
 * loops run only while the section is on screen. Under reduced motion the
 * diagram renders fully assembled and static.
 */

type Anchor = {
  key: string;
  label: string;
  side: "left" | "right";
  /** where on the image the leader line lands, expressed as % of the image box */
  hotXPct: number;
  hotYPct: number;
};

const LEFT: Anchor[] = [
  {
    key: "pla",
    label: "biodegradable PLA",
    side: "left",
    hotXPct: 36,
    hotYPct: 25,
  },
  {
    key: "layers",
    label: "0.2 mm layers",
    side: "left",
    hotXPct: 30,
    hotYPct: 55,
  },
  {
    key: "leeds",
    label: "made in Leeds",
    side: "left",
    hotXPct: 35,
    hotYPct: 84,
  },
];
const RIGHT: Anchor[] = [
  {
    key: "finish",
    label: "hand-finished",
    side: "right",
    hotXPct: 64,
    hotYPct: 25,
  },
  {
    key: "blend",
    label: "gradient blend",
    side: "right",
    hotXPct: 70,
    hotYPct: 55,
  },
  {
    key: "eco",
    label: "eco packaging",
    side: "right",
    hotXPct: 61,
    hotYPct: 87,
  },
];
const ANCHORS: Anchor[] = [...LEFT, ...RIGHT];

export default function AnatomyShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [hotspots, setHotspots] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Live geometry for the per-frame anchor updates (no React renders there).
  const geomRef = useRef({
    left: 0,
    top: 0,
    w: 0,
    h: 0,
    origins: {} as Record<string, { x: number; y: number }>,
  });
  const lastPinsRef = useRef<Record<string, AnchorPoint> | null>(null);
  const leaderRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const hotPosRefs = useRef<Map<string, SVGGElement>>(new Map());

  // Recompute line paths + hotspot coordinates whenever the layout changes.
  // The label pills converge via transforms on their inner spans, so the
  // outer (measured) divs never carry a transform and these rects stay
  // valid even when a resize lands mid-scrub.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    const img = imageRef.current;
    if (!root || !img) return;

    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      if (rootRect.width === 0 || imgRect.width === 0) return;

      const nextPaths: Record<string, string> = {};
      const nextHotspots: Record<string, { x: number; y: number }> = {};
      const geom = geomRef.current;
      geom.left = imgRect.left - rootRect.left;
      geom.top = imgRect.top - rootRect.top;
      geom.w = imgRect.width;
      geom.h = imgRect.height;

      ANCHORS.forEach((a) => {
        const labelEl = labelRefs.current.get(a.key);
        if (!labelEl) return;
        const lRect = labelEl.getBoundingClientRect();

        // Hotspot: percentage of image box, translated to root-space.
        const hotX =
          imgRect.left - rootRect.left + (a.hotXPct / 100) * imgRect.width;
        const hotY =
          imgRect.top - rootRect.top + (a.hotYPct / 100) * imgRect.height;

        // Straight line: from the inner edge of the label directly to the
        // hotspot on the owl. Overlap over the image is intentional.
        const originX =
          a.side === "left"
            ? lRect.right - rootRect.left
            : lRect.left - rootRect.left;
        const originY = lRect.top - rootRect.top + lRect.height / 2;

        geom.origins[a.key] = { x: originX, y: originY };
        nextPaths[a.key] = `M ${originX} ${originY} L ${hotX} ${hotY}`;
        nextHotspots[a.key] = { x: hotX, y: hotY };
      });

      setPaths(nextPaths);
      setHotspots(nextHotspots);
      setSize({ w: rootRect.width, h: rootRect.height });
      // Re-apply the model's current pose after React paints the front pose.
      requestAnimationFrame(() => {
        if (lastPinsRef.current) applyPins(lastPinsRef.current);
      });
    };

    measure();

    // The focal box is a fixed-aspect square, so its size is known before
    // any image or model loads; observing both boxes covers every reflow.
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(img);
    return () => ro.disconnect();
  }, []);

  // Scroll-scrubbed assembly: progress is driven by the section's viewport
  // crossing (fully assembled once the diagram is centered). `paths` is a dep
  // so every re-measure (resize / image load) tears the timeline down and
  // rebuilds it against the freshly computed geometry — createDrawable path
  // lengths are recomputed and the scroll observer bounds refresh with it.
  const { ref: scrubRef } = useScrollScrub<HTMLDivElement>(
    (root) => {
      const tl = createTimeline({
        autoplay: false,
        defaults: { ease: EASE.inOut },
      });

      // Scale only: fading the focal with scroll left the 3D owl ghostly at
      // partial scroll while the labels were already fully shown.
      const focal = root.querySelector<HTMLElement>(".anatomy-focal");
      if (focal) tl.add(focal, { scale: [0.92, 1], duration: DUR.md }, 0);

      // Exploded pills converge inward from either side.
      const leftPills = root.querySelectorAll<HTMLElement>(
        '.anatomy-label-text[data-side="left"]',
      );
      const rightPills = root.querySelectorAll<HTMLElement>(
        '.anatomy-label-text[data-side="right"]',
      );
      if (leftPills.length) {
        tl.add(
          leftPills,
          {
            opacity: [0, 1],
            translateX: [-28, 0],
            duration: DUR.sm,
            delay: stagger(STEP.base),
          },
          250,
        );
      }
      if (rightPills.length) {
        tl.add(
          rightPills,
          {
            opacity: [0, 1],
            translateX: [28, 0],
            duration: DUR.sm,
            delay: stagger(STEP.base),
          },
          250,
        );
      }

      // Leader lines stroke-draw as the pills arrive.
      const pathEls = root.querySelectorAll<SVGPathElement>(".anatomy-leader");
      if (pathEls.length) {
        const drawable = svg.createDrawable(pathEls);
        tl.add(
          drawable,
          {
            draw: ["0 0", "0 1"],
            duration: DUR.md,
            ease: EASE.linear,
            delay: stagger(STEP.loose),
          },
          500,
        );
      }

      // Hotspot dots resolve last.
      const hotspotEls = root.querySelectorAll<SVGGElement>(".anatomy-hotspot");
      if (hotspotEls.length) {
        tl.add(
          hotspotEls,
          {
            opacity: [0, 1],
            scale: [0.4, 1],
            duration: DUR.sm,
            delay: stagger(STEP.base),
          },
          1000,
        );
      }

      return tl;
    },
    {
      enter: "bottom top",
      leave: "center center",
      willChange: ".anatomy-focal, .anatomy-label-text",
    },
    [paths],
  );

  // Hotspot pulse loops (transform/opacity only) — paused whenever the
  // section is offscreen, never built under reduced motion. The dep flips
  // once the overlay SVG has been measured into existence.
  const hotspotCount = Object.keys(hotspots).length;
  const pulseRef = useLoopGroup<HTMLDivElement>(
    (root) => {
      const pulses = root.querySelectorAll<SVGCircleElement>(".anatomy-pulse");
      if (!pulses.length) return;
      return [
        animate(pulses, {
          scale: [0.75, 1.5],
          opacity: [0.8, 0.1],
          duration: 1300,
          ease: EASE.inOut,
          loop: true,
          alternate: true,
          delay: stagger(160),
        }),
      ];
    },
    [hotspotCount],
  );

  // One-shot label scramble on scroll into view (independent of the scrub).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;

    const anims: JSAnimation[] = [];
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        root
          .querySelectorAll<HTMLElement>(".anatomy-label-text")
          .forEach((textEl, i) => {
            anims.push(
              animate(textEl, {
                text: scrambleText({ chars: "lowercase" }),
                duration: 900,
                delay: 200 + i * 120,
                ease: "linear",
              }),
            );
          });
      },
      { threshold: 0.25 },
    );

    obs.observe(root);
    return () => {
      obs.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, []);

  // Called by the 3D viewer every frame the owl turns: slide each leader
  // line's end and its hotspot onto the pinned point on the model, and fade
  // the ones that have turned away from the viewer.
  function applyPins(pins: Record<string, AnchorPoint>) {
    lastPinsRef.current = pins;
    const g = geomRef.current;
    if (!g.w) return;
    for (const a of ANCHORS) {
      const p = pins[a.key];
      const o = g.origins[a.key];
      if (!p || !o) continue;
      const x = g.left + (p.xPct / 100) * g.w;
      const y = g.top + (p.yPct / 100) * g.h;
      const fade = String(0.15 + 0.85 * p.facing);
      const path = leaderRefs.current.get(a.key);
      if (path) {
        path.setAttribute("d", `M ${o.x} ${o.y} L ${x} ${y}`);
        path.style.opacity = fade;
      }
      const dot = hotPosRefs.current.get(a.key);
      if (dot) {
        dot.setAttribute("transform", `translate(${x} ${y})`);
        dot.style.opacity = String(p.facing);
      }
    }
  }

  const setMapRef =
    <T,>(map: Map<string, T>, key: string) =>
    (el: T | null) => {
      if (el) map.set(key, el);
      else map.delete(key);
    };

  const setLabelRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) labelRefs.current.set(key, el);
    else labelRefs.current.delete(key);
  };

  // The measure effect, the scrub and the loop group all observe the same
  // diagram root.
  const setDiagramRef = (el: HTMLDivElement | null) => {
    rootRef.current = el;
    scrubRef.current = el;
    pulseRef.current = el;
  };

  return (
    <section className="safari-drop-backdrop fr-ink fr-plate relative overflow-hidden py-20 sm:py-28 md:flex md:min-h-screen md:flex-col md:justify-center md:py-16">
      <div className="fr-wrap relative">
        {/* Header: centred and bare. The callout labels on the diagram below
            carry the detail, so the heading does not repeat them. */}
        <div className="mb-10 text-center sm:mb-12">
          <AnimatedHeading as="h2" className="fr-h2" from="center">
            Every piece, <em className="fr-i not-italic">engineered</em>
          </AnimatedHeading>
        </div>

        {/* Diagram — same structure at every width, only sizing/spacing changes. */}
        <div
          ref={setDiagramRef}
          className="relative mx-auto"
          style={{ maxWidth: "1100px" }}
        >
          <div className="grid grid-cols-[minmax(0,80px)_minmax(180px,1fr)_minmax(0,80px)] sm:grid-cols-[minmax(120px,200px)_minmax(220px,1fr)_minmax(120px,200px)] md:grid-cols-[minmax(160px,220px)_minmax(320px,1fr)_minmax(160px,220px)] xl:grid-cols-[minmax(160px,220px)_minmax(460px,1fr)_minmax(160px,220px)] items-center gap-x-1.5 sm:gap-x-6 md:gap-x-10 lg:gap-x-16">
            {/* Left labels */}
            <div className="flex flex-col justify-between h-[420px] sm:h-[440px] md:h-[min(72vh,720px)] xl:h-[min(78vh,860px)] py-3 sm:py-5 items-end">
              {LEFT.map((a) => (
                <div
                  key={a.key}
                  ref={setLabelRef(a.key)}
                  className="anatomy-label max-w-full relative z-10"
                >
                  <span
                    data-side={a.side}
                    className="anatomy-label-text fr-tag"
                  >
                    {a.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Focal model — the owl photo until the 3D owl loads (or if it
                can't). Big enough on mobile that labels overlap; grows further
                at each breakpoint. */}
            <div className="flex justify-center">
              <ModelViewer
                ref={imageRef}
                src="/models/owl.glb"
                poster="/owlPrint.png"
                anchors={ANCHORS.map((a) => ({
                  key: a.key,
                  xPct: a.hotXPct,
                  yPct: a.hotYPct,
                }))}
                onAnchors={applyPins}
                alt="A ForgeRealm printed owl figurine"
                className="anatomy-focal h-[420px] max-w-none shrink-0 sm:h-[440px] md:h-[min(72vh,720px)] xl:h-[min(78vh,860px)]"
              />
            </div>

            {/* Right labels */}
            <div className="flex flex-col justify-between h-[420px] sm:h-[440px] md:h-[min(72vh,720px)] xl:h-[min(78vh,860px)] py-3 sm:py-5 items-start">
              {RIGHT.map((a) => (
                <div
                  key={a.key}
                  ref={setLabelRef(a.key)}
                  className="anatomy-label max-w-full relative z-10"
                >
                  <span
                    data-side={a.side}
                    className="anatomy-label-text fr-tag"
                  >
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Overlay SVG — leader lines + pulsing hotspot dots, drawn in real coordinates. */}
          {size.w > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="anatomyLineGradLeft"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="rgba(240, 232, 216, 0.18)" />
                  <stop offset="100%" stopColor="rgba(255, 178, 36, 0.95)" />
                </linearGradient>
                <linearGradient
                  id="anatomyLineGradRight"
                  x1="100%"
                  y1="0%"
                  x2="0%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="rgba(240, 232, 216, 0.18)" />
                  <stop offset="100%" stopColor="rgba(255, 178, 36, 0.95)" />
                </linearGradient>
              </defs>

              {ANCHORS.map((a) =>
                paths[a.key] ? (
                  <path
                    key={a.key}
                    ref={setMapRef(leaderRefs.current, a.key)}
                    className="anatomy-leader"
                    d={paths[a.key]}
                    stroke={`url(#anatomyLineGrad${a.side === "left" ? "Left" : "Right"})`}
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                  />
                ) : null,
              )}

              {ANCHORS.map((a) => {
                const h = hotspots[a.key];
                if (!h) return null;
                // Outer group carries the position (moved per frame by
                // applyPins); the inner one is what the scrub/pulse animate,
                // scaling about its own centre.
                return (
                  <g
                    key={`${a.key}-hot`}
                    ref={setMapRef(hotPosRefs.current, a.key)}
                    transform={`translate(${h.x} ${h.y})`}
                  >
                    <g
                      className="anatomy-hotspot"
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "center",
                      }}
                    >
                      <circle
                        className="anatomy-pulse"
                        r="8"
                        fill="rgba(255, 178, 36, 0.18)"
                        style={{
                          transformBox: "fill-box",
                          transformOrigin: "center",
                        }}
                      />
                      <circle r="3.2" fill="#ffb224" />
                    </g>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}
