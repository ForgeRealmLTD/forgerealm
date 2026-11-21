"use client";

import { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import { animate, createTimeline, stagger, svg } from "animejs";
import type { JSAnimation, Timeline } from "animejs";
import ScrambleLabel from "./anime/ScrambleLabel";
import {
  DUR,
  EASE,
  STEP,
  clearWillChange,
  interactiveSpring,
  prefersReducedMotion,
  setWillChange,
} from "../hooks/motion";
import { createPausedLoops } from "../hooks/useLoopGroup";
import type { LoopLike } from "../hooks/useLoopGroup";
import { useAnimeReveal } from "../hooks/useAnimeReveal";
import { useScrollScrub } from "../hooks/useScrollScrub";
import { ArrowKnob } from "./landing/ui";

function useTypewriter(words: string[]) {
  const [text, setText] = useState(words[0]);
  const stateRef = useRef({
    wordIdx: 0,
    charIdx: words[0].length,
    phase: "pause" as "typing" | "pause" | "deleting",
  });

  useEffect(() => {
    // Reduced motion: hold the first word statically — no cycling.
    if (prefersReducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = stateRef.current;
      const word = words[s.wordIdx];

      if (s.phase === "pause") {
        timer = setTimeout(() => {
          s.phase = "deleting";
          tick();
        }, 2500);
      } else if (s.phase === "deleting") {
        if (s.charIdx > 0) {
          s.charIdx--;
          setText(word.slice(0, s.charIdx));
          timer = setTimeout(tick, 40);
        } else {
          s.wordIdx = (s.wordIdx + 1) % words.length;
          s.phase = "typing";
          tick();
        }
      } else {
        const target = words[s.wordIdx];
        if (s.charIdx < target.length) {
          s.charIdx++;
          setText(target.slice(0, s.charIdx));
          timer = setTimeout(tick, 80);
        } else {
          s.phase = "pause";
          timer = setTimeout(tick, 2500);
        }
      }
    };
    timer = setTimeout(tick, 2500);
    return () => clearTimeout(timer);
  }, [words]);

  return text;
}

// Anime.js-powered count-up with intersection trigger. Odometer feel + eased.
function useAnimatedCount(target: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(target);
      return;
    }
    let anim: JSAnimation | null = null;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const state = { n: 0 };
        anim = animate(state, {
          n: target,
          duration,
          ease: EASE.out,
          onUpdate: () => {
            if (el) el.textContent = String(Math.round(state.n));
          },
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      anim?.cancel();
    };
  }, [target, duration]);
  return ref;
}

const WORDS = [
  "Imagination",
  "Precision",
  "Passion",
  "Purpose",
  "Detail",
  "Heart",
  "Vision",
  "Soul",
];

export default function Hero({ festive = false }: { festive?: boolean }) {
  const [printAnim, setPrintAnim] = useState<any>(null);
  const typed = useTypewriter(WORDS);
  const printsRef = useAnimatedCount(783, 2200);
  const designsRef = useAnimatedCount(65, 1800);
  const mobileLottieRef = useRef<LottieRefCurrentProps>(null);
  const desktopLottieRef = useRef<LottieRefCurrentProps>(null);

  // Exit parallax — as the hero scrolls out, copy / visual card / glows recede
  // upward at different rates with a gentle opacity falloff. Transform/opacity
  // only, scrubbed by the hero's own viewport crossing; no data-ar on targets.
  const { ref: heroRef } = useScrollScrub<HTMLElement>(
    (root) => {
      const tl = createTimeline({
        autoplay: false,
        defaults: { ease: EASE.linear, duration: 1000 },
      });
      // Reduced motion: an empty timeline keeps the hero fully static/visible.
      if (prefersReducedMotion()) return tl;
      const layers: Array<[string, number, number]> = [
        [".hero-copy", -80, 0.3],
        [".hero-visual", -140, 0.2],
        [".hero-glows", -36, 0.45],
      ];
      layers.forEach(([sel, y, fade]) => {
        const el = root.querySelector<HTMLElement>(sel);
        // Skip layers display:none at this breakpoint (mobile hides glows/visual).
        if (el && el.getClientRects().length)
          tl.add(el, { translateY: [0, y], opacity: [1, fade] }, 0);
      });
      return tl;
    },
    {
      enter: "top top", // scrub starts the moment the hero begins to leave
      leave: "top bottom", // …and completes once it has fully scrolled out
      willChange: ".hero-copy, .hero-visual, .hero-glows",
      rebuildOnResize: true, // the layer set changes across breakpoints
    },
  );

  // Stats reveal — data-ar targets rise in once when the row scrolls into view.
  const statsRef = useAnimeReveal<HTMLDivElement>({
    selector: ".hero-stat",
    y: 18,
    duration: DUR.md,
    step: STEP.loose,
    threshold: 0.4,
  });

  useEffect(() => {
    // Delay Lottie load to prioritise LCP content
    const timer = setTimeout(() => {
      fetch("/print.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setPrintAnim(data);
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // The looping Lottie printers are infinite animations too — pause them when
  // the hero is offscreen, and hold a static frame under reduced motion.
  useEffect(() => {
    if (!printAnim) return;
    const root = heroRef.current;
    const players = [mobileLottieRef.current, desktopLottieRef.current].filter(
      (p): p is LottieRefCurrentProps => p !== null,
    );
    if (!players.length) return;
    if (prefersReducedMotion()) {
      players.forEach((p) => p.pause());
      return;
    }
    if (!root) return;
    return createPausedLoops(
      root,
      players.map<LoopLike>((p) => ({
        pause: () => p.pause(),
        resume: () => p.play(),
        cancel: () => p.pause(),
      })),
    );
  }, [printAnim]);

  // Anime.js choreography — mount sequence, SVG draw, paused loops, divider.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = heroRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      // Static final state — nothing may stay hidden behind a skipped animation.
      root.querySelectorAll<HTMLElement>(".hero-divider-line").forEach((el) => {
        el.style.transform = "none";
      });
      const emblem = root.querySelector<HTMLElement>(".hero-divider-emblem");
      if (emblem) emblem.style.opacity = "1";
      return;
    }

    const cleanups: Array<() => void> = [];

    // 1. SVG signature flourish beneath h1 — draws in stroke-by-stroke.
    const sigPaths = root.querySelectorAll(".hero-signature path");
    if (sigPaths.length) {
      const drawable = svg.createDrawable(sigPaths);
      const draw = animate(drawable, {
        draw: ["0 0", "0 1"],
        duration: 1600,
        ease: EASE.inOut,
        delay: stagger(180, { start: 250 }),
      });
      cleanups.push(() => draw.cancel());
    }

    // 2. Infinite loops — ring rotations + ambient glow drift. All transform-
    //    only, all paused whenever the hero is offscreen. Targets that are
    //    display:none at this breakpoint are skipped entirely.
    const loopTarget = (sel: string) => {
      const el = root.querySelector<HTMLElement>(sel);
      return el && el.getClientRects().length ? el : null;
    };
    const loops: LoopLike[] = [];
    const ringOuter = loopTarget(".hero-ring-outer");
    const ringInner = loopTarget(".hero-ring-inner");
    if (ringOuter)
      loops.push(
        animate(ringOuter, {
          rotate: "1turn",
          duration: 60000,
          loop: true,
          ease: EASE.linear,
        }),
      );
    if (ringInner)
      loops.push(
        animate(ringInner, {
          rotate: "-1turn",
          duration: 80000,
          loop: true,
          ease: EASE.linear,
        }),
      );
    const glowDrift: Array<[string, number, number, number]> = [
      [".hero-glow-a", -30, -20, 18000],
      [".hero-glow-b", 25, 15, 22000],
      [".hero-glow-c", -20, 15, 26000],
      [".hero-glow-d", 20, -20, 20000],
    ];
    glowDrift.forEach(([sel, x, y, duration]) => {
      const el = loopTarget(sel);
      if (el)
        loops.push(
          animate(el, {
            translateX: [x, -x],
            translateY: [y, -y],
            duration,
            loop: true,
            alternate: true,
            ease: "inOutSine",
          }),
        );
    });
    if (loops.length) cleanups.push(createPausedLoops(root, loops));

    // 3. Emblem divider — waits for scroll into view, then scans lines outward + pops emblem.
    const divider = root.querySelector(".hero-emblem-divider");
    if (divider) {
      const lines = Array.from(
        root.querySelectorAll<HTMLElement>(".hero-divider-line"),
      );
      const dividerEmblem = root.querySelector<HTMLElement>(
        ".hero-divider-emblem",
      );
      const targets = dividerEmblem ? [...lines, dividerEmblem] : lines;
      let dividerTl: Timeline | null = null;
      const play = () => {
        setWillChange(targets);
        const tl = createTimeline({
          defaults: { ease: EASE.out },
          onComplete: () => clearWillChange(targets),
        });
        if (lines.length) tl.add(lines, { scaleX: [0, 1], duration: DUR.lg });
        if (dividerEmblem) {
          tl.add(
            dividerEmblem,
            {
              opacity: [0, 1],
              scale: [0.4, 1],
              rotate: ["-120deg", "0deg"],
              duration: DUR.md,
              ease: "outBack",
            },
            "-=600",
          );
        }
        dividerTl = tl;
      };
      const dObs = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          dObs.disconnect();
          play();
        },
        { threshold: 0.4 },
      );
      dObs.observe(divider);
      cleanups.push(() => {
        dObs.disconnect();
        dividerTl?.cancel();
        clearWillChange(targets);
      });
    }

    // 4. Emblem click spin — springy full rotation on the brand emblem.
    //    (The hover glow stays a CSS transition; JS only handles the click.)
    const emblemMain =
      root.querySelector<HTMLImageElement>(".hero-emblem-main");
    if (emblemMain) {
      let spinAnim: JSAnimation | null = null;
      const spin = () => {
        setWillChange(emblemMain);
        spinAnim = animate(emblemMain, {
          rotate: "+=1turn",
          ease: interactiveSpring(),
          onComplete: () => clearWillChange(emblemMain),
        });
      };
      emblemMain.addEventListener("click", spin);
      cleanups.push(() => {
        emblemMain.removeEventListener("click", spin);
        spinAnim?.cancel();
        clearWillChange(emblemMain);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={heroRef}
      // `fr-festive` swaps the accent token for the seasonal red.
      className={`fr-ink fr-plate ${festive ? "fr-festive" : ""} relative flex min-h-[100svh] flex-col overflow-hidden`}
    >
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes santa-bob { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-5px) rotate(1deg)} }
        .hero-santa { animation: santa-bob 3.2s ease-in-out infinite; transform-origin: 50% 90%; }
        @media (prefers-reduced-motion: reduce) {
          .typewriter-cursor { animation: none !important; opacity: 1 !important; }
          .hero-santa { animation: none !important; }
        }
      `}</style>

      <div className="fr-wrap relative flex flex-1 flex-col pt-[5.5rem]">
        {/* Eyebrow row: emblem, label, a rule out to the workshop coordinates */}
        <div className="flex items-center gap-4">
          <img
            src="/frlogorv-384.webp"
            alt="ForgeRealm Emblem"
            className="hero-emblem-main h-10 w-10 cursor-pointer sm:h-11 sm:w-11"
            decoding="async"
          />
          <ScrambleLabel
            className="fr-label fr-accent-text block"
            chars="lowercase"
            duration={1500}
          >
            3D Printed in Leeds
          </ScrambleLabel>
          <span
            className="h-px flex-1"
            style={{ background: "var(--line)" }}
            aria-hidden="true"
          />
          <span className="fr-label fr-fg-3 hidden sm:block" aria-hidden="true">
            53.80° N / 1.55° W
          </span>
        </div>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="hero-copy lg:col-span-7 xl:col-span-8">
            {/* The headline "prints" in bottom-up (CSS only, see landing.css) */}
            <h1 className="fr-h1 fr-print text-[clamp(3.2rem,16vw,7.5rem)] lg:text-[clamp(5rem,min(9.6vw,17svh),9rem)] xl:text-[clamp(6rem,min(10.6vw,18.5svh),10.5rem)]">
              <span className="fr-print__body block">
                Crafted with
                <br />
                <span className="fr-i">
                  {typed}
                  <span
                    aria-hidden="true"
                    className="typewriter-cursor ml-[0.06em] inline-block h-[0.6em] w-[0.26em] bg-current align-baseline"
                    style={{ animation: "blink 1s step-end infinite" }}
                  />
                </span>
              </span>
            </h1>

            {/* Signature flourish: anime.js stroke-draws this on mount */}
            <svg
              className="hero-signature fr-accent-text mt-4"
              viewBox="0 0 260 22"
              width="260"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 13 C 40 3, 80 21, 130 11 S 220 3, 256 11" />
            </svg>

            {/* Side by side only where the copy column is wide enough: md
                (single column, full width) and xl. At lg it is narrow, so
                the paragraph and buttons stack. */}
            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,30rem)_auto] md:items-end md:gap-12 lg:grid-cols-1 lg:gap-8 xl:grid-cols-[minmax(0,30rem)_auto] xl:gap-12">
              <p className="fr-body">
                From articulated dragons to ambient lamps, every piece is
                designed, printed, and hand-finished in our Leeds workshop.
                Eco-friendly PLA, no compromise on detail.
              </p>

              <div className="flex flex-wrap gap-3">
                <a href="/shop" className="fr-btn fr-btn--solid">
                  Enter the Shop
                  <ArrowKnob />
                </a>
                <a href="/#work" className="fr-btn fr-btn--ghost">
                  See Our Work
                  <ArrowKnob />
                </a>
              </div>
            </div>

            {/* Mobile: the printer panel sits between the CTAs and the stats */}
            <div className="mt-10 lg:hidden">
              <div className="relative mx-auto max-w-[24rem]">
                <div className="fr-amber fr-layers relative h-[210px] overflow-hidden rounded-[22px]">
                  {printAnim ? (
                    <Lottie
                      lottieRef={mobileLottieRef}
                      animationData={printAnim}
                      loop
                      className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2"
                    />
                  ) : (
                    <img
                      src="/frlogorv-384.webp"
                      alt="ForgeRealm"
                      className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 opacity-40"
                    />
                  )}
                  <span
                    className="fr-label absolute left-4 top-4 !text-[14px]"
                    aria-hidden="true"
                  >
                    Job FR-0783
                  </span>
                  <span
                    className="fr-label absolute right-4 top-4 flex items-center gap-2 !text-[14px]"
                    aria-hidden="true"
                  >
                    <i className="fr-blink h-1.5 w-1.5 rounded-full bg-current" />
                    Printing
                  </span>
                </div>
                {festive && (
                  <img
                    src="/christmas/santa.webp"
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    className="hero-santa absolute -bottom-4 -left-2 h-[72px] w-[72px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Printer panel (desktop): an amber device face with a job readout */}
          <div className="hero-visual relative hidden lg:col-span-5 lg:block xl:col-span-4">
            <div className="relative">
              {/* Registration rings: anime.js rotates these continuously */}
              <div
                className="hero-ring-outer absolute -inset-10 rounded-full border border-dashed"
                style={{ borderColor: "var(--line)" }}
              />
              <div
                className="hero-ring-inner absolute -inset-20 rounded-full border border-dashed"
                style={{ borderColor: "rgba(240, 232, 216, 0.07)" }}
              />

              <div className="fr-amber relative overflow-hidden rounded-[28px]">
                <div className="fr-layers relative flex h-[min(54svh,540px)] min-h-[340px] items-center justify-center overflow-hidden">
                  {printAnim ? (
                    <Lottie
                      lottieRef={desktopLottieRef}
                      animationData={printAnim}
                      loop
                      className="h-[120%] w-[120%]"
                    />
                  ) : (
                    <img
                      src="/frlogorv-384.webp"
                      alt=""
                      aria-hidden="true"
                      width={180}
                      height={180}
                      className="opacity-40"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>

                {/* Readout along the top */}
                <div
                  className="absolute inset-x-0 top-0 flex items-center justify-between p-5"
                  aria-hidden="true"
                >
                  <span className="fr-label">Job FR-0783</span>
                  <span className="fr-label flex items-center gap-2">
                    <i className="fr-blink h-1.5 w-1.5 rounded-full bg-current" />
                    Printing
                  </span>
                </div>

                {/* Panel footer */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div
                    className="mb-4 h-px w-full"
                    style={{ background: "var(--line-2)" }}
                    aria-hidden="true"
                  />
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="fr-label fr-fg-3 block">ForgeRealm</span>
                      <p className="fr-px mt-1.5 text-[1.75rem] leading-none">
                        Every piece, a story
                      </p>
                    </div>
                    <img
                      src="/headfrlogorv-128.webp"
                      alt=""
                      className="h-9 w-9 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {festive && (
                <img
                  src="/christmas/santa.webp"
                  alt=""
                  aria-hidden="true"
                  width={140}
                  height={140}
                  className="hero-santa absolute -left-16 bottom-24 h-[140px] w-[140px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
                  decoding="async"
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats strip: pixel numerals on a ruled row */}
        <div
          ref={statsRef}
          className="hero-stats-row fr-line grid grid-cols-3 border-t"
        >
          <div data-ar className="hero-stat py-5 pr-3">
            <p className="fr-dot text-[clamp(2.6rem,8vw,5.5rem)]">
              <span ref={printsRef}>0</span>+
            </p>
            <p className="fr-label fr-fg-3 mt-2 !text-[14px] sm:!text-[17px]">
              Prints Sold
            </p>
          </div>
          <div
            data-ar
            className="hero-stat fr-line border-l py-5 pl-4 pr-3 sm:pl-8"
          >
            <p className="fr-dot text-[clamp(2.6rem,8vw,5.5rem)]">
              <span ref={designsRef}>0</span>+
            </p>
            <p className="fr-label fr-fg-3 mt-2 !text-[14px] sm:!text-[17px]">
              Designs
            </p>
          </div>
          <div data-ar className="hero-stat fr-line border-l py-5 pl-4 sm:pl-8">
            <p className="fr-dot text-[clamp(2.6rem,8vw,5.5rem)]">100%</p>
            <p className="fr-label fr-fg-3 mt-2 !text-[14px] sm:!text-[17px]">
              Eco friendly
            </p>
          </div>
        </div>

        {/* Emblem divider: lines scan outward, emblem pops in on scroll */}
        <div className="hero-emblem-divider flex items-center justify-center gap-4 pb-5">
          <div
            className="hero-divider-line h-px flex-1"
            style={{
              background: "var(--line-2)",
              transform: "scaleX(0)",
              transformOrigin: "right",
            }}
          />
          <img
            src="/frlogorv-384.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="hero-divider-emblem h-6 w-6"
            style={{ opacity: 0 }}
          />
          <div
            className="hero-divider-line h-px flex-1"
            style={{
              background: "var(--line-2)",
              transform: "scaleX(0)",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </section>
  );
}
