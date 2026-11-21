"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

type Product = {
  id: string;
  name: string;
  description: string;
  shopDescription: string;
  detail: string;
  image: string;
  background: string;
  /** Image URL shown in the right half of the expanded (clicked) panel
   *  as a lifestyle / mood backdrop. */
  lifestyleImage?: string;
  /** Multiplier applied to the thumbnail image size. 1 is default. */
  thumbnailScale?: number;
  /** Multiplier applied to the hero image inside the expanded (clicked)
   *  overlay. 1 is default. */
  expandedScale?: number;
  /** Optional shop deep-link. When set, a "View in store" anchor renders
   *  in the expanded overlay. When absent, the button is not rendered. */
  shopUrl?: string;
  textColor: string;
  accentColor: string;
};

const AUTO_ADVANCE_MS = 4200;

const products: Product[] = [
  {
    id: "ivysaur-planter",
    name: "Ivysaur Planter",
    description:
      "Our new unofficial mascot at The Mini Mall, Merrion Centre: a large Ivysaur planter made in collaboration with the plant trader next door.",
    shopDescription:
      "One of the other traders at The Mini Mall sells plants, so we teamed up: a large-scale Ivysaur planter, printed to actually hold a real one. It's turned into a bit of a showcase piece, a look at what happens when our prints meet their greenery, and it's quietly become the unofficial mascot of the shop.",
    detail:
      "It sits in the shop's front window at Merrion Centre, so it's the first thing people see walking past The Mini Mall. If you're after something that mixes a print with something living, that's exactly the kind of commission we love.",
    image: "/featured1.jpg",
    background: "#141210",
    lifestyleImage: "/featured1bg.jpg",
    thumbnailScale: 1.1,
    expandedScale: 0.8,
    textColor: "#f0e8d8",
    accentColor: "#ffb224",
  },
  {
    id: "blackthorn-manor",
    name: "Blackthorn Manor",
    description:
      "A hand-finished half-timbered manor, all steep gables and turrets, straight out of old English storybook country.",
    shopDescription:
      "Every panel of timber framing, brickwork and roof tile on this one was sculpted and printed by hand, channelling that unmistakable Tudor look, half history and half fairytale. It's on display at The Mini Mall, Merrion Centre, in the same front window as Ivysaur, so it's one of the first things people see walking past.",
    detail:
      "If turrets, timber framing and old English charm are your thing, this is the kind of build we could happily spend a week on. Get in touch if you want your own version.",
    image: "/featured2.jpg",
    background: "#141210",
    lifestyleImage: "/featured2bg.jpg",
    expandedScale: 0.7,
    textColor: "#f0e8d8",
    accentColor: "#ffb224",
  },
  {
    id: "tala",
    name: "Tala",
    description:
      "A miniature statue of Tala, Paul's dog, sculpted from his photos and hand-finished so the character still reads at a few inches tall. Shared here with Paul's blessing.",
    shopDescription:
      "This one wasn't a shop piece. Paul came to us wanting a mini statue of Tala, his dog, small enough to sit on a desk and still be unmistakably Tala. We worked from his photos, then sculpted, printed, sanded and hand-finished every last layer until the markings and the stance felt right.",
    detail:
      "Pets are some of our favourite commissions. There's a lot of character to catch, and you know the moment you've got it. If you'd like your own, get in touch.",
    image: "/featured3.jpg",
    background: "#141210",
    lifestyleImage: "/featured3bg.jpg",
    thumbnailScale: 0.7,
    expandedScale: 0.55,
    textColor: "#f0e8d8",
    accentColor: "#ffb224",
  },
];

export default function Work() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  // Narrow screens show the strip as an accordion: one panel open wide, the
  // rest as slim spines. `focusIndex` is the open one; it advances on a timer
  // until the visitor takes over.
  const [focusIndex, setFocusIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const stripTouchRef = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCarouselInView, setIsCarouselInView] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const storedScrollLeftRef = useRef<number | null>(null);
  const wasExpandedRef = useRef(false);
  const storedViewportWidthRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchMovedRef = useRef(false);

  const activeProduct = useMemo(() => products[activeIndex], [activeIndex]);

  const clampIndex = useCallback((index: number) => {
    const max = products.length;
    return ((index % max) + max) % max;
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const element = containerRef.current;
    const update = () => {
      const width = element.clientWidth || 0;
      setIsNarrowScreen(width < 900);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsCarouselInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );
    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isExpanded) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isExpanded]);

  useEffect(() => {
    const wasExpanded = wasExpandedRef.current;
    wasExpandedRef.current = isExpanded;
    if (!wasExpanded || isExpanded) return;
    const carousel = carouselRef.current;
    if (!carousel) return;
    const recenter = () => {
      const maxScroll = Math.max(
        0,
        carousel.scrollWidth - carousel.clientWidth,
      );
      let target = storedScrollLeftRef.current ?? carousel.scrollLeft;
      if (storedViewportWidthRef.current) {
        target =
          (target * carousel.clientWidth) / storedViewportWidthRef.current;
      }
      const clamped = Math.min(Math.max(target, 0), maxScroll);
      carousel.scrollTo({ left: clamped, behavior: "auto" });
    };
    requestAnimationFrame(() => {
      recenter();
      storedScrollLeftRef.current = null;
      storedViewportWidthRef.current = null;
    });
    const settleTimer = window.setTimeout(recenter, 320);
    return () => window.clearTimeout(settleTimer);
  }, [activeIndex, isExpanded]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || isExpanded || isNarrowScreen) return;
    let ticking = false;
    const handleScroll = () => {
      if (isExpanded) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const width = carousel.clientWidth || 1;
        const approxPanelWidth = width * 0.2;
        const index = Math.round(carousel.scrollLeft / approxPanelWidth);
        const nextIndex = clampIndex(index);
        setActiveIndex(nextIndex);
      });
    };
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, [clampIndex, isExpanded, isNarrowScreen]);

  useEffect(() => {
    if (!isExpanded) return;
    setHoveredIndex(null);
  }, [isExpanded]);

  // Accordion auto-advance. Stops for good once the visitor taps or swipes,
  // and never runs under reduced motion.
  useEffect(() => {
    if (!isNarrowScreen || isExpanded || !isCarouselInView || !autoPlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setFocusIndex((prev) => clampIndex(prev + 1)),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearInterval(timer);
  }, [autoPlay, clampIndex, isCarouselInView, isExpanded, isNarrowScreen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!isExpanded) return;
      if (event.key === "Escape") {
        setIsExpanded(false);
        return;
      }
      if (event.key === "ArrowRight") {
        setDirection(1);
        setActiveIndex((prev) => clampIndex(prev + 1));
      }
      if (event.key === "ArrowLeft") {
        setDirection(-1);
        setActiveIndex((prev) => clampIndex(prev - 1));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isExpanded]);

  // Toggle a body class while the featured-print overlay is open so global
  // CSS can hide the Brevo chat widget (whose z-index is 2^31 and outranks
  // anything we can set on the overlay itself).
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("work-modal-open", isExpanded);
    return () => document.body.classList.remove("work-modal-open");
  }, [isExpanded]);

  const getPanelWidth = (index: number) => {
    // Accordion panels are sized by flex-grow instead (see the panel style).
    if (isNarrowScreen) return undefined;
    if (isExpanded && activeIndex === index) {
      return "100vw";
    }
    // 3 panels resting = 81vw, occupies the same footprint the previous
    // 4 x 20vw layout did. Hovered panel expands the strip to ~88vw.
    return hoveredIndex === index ? "34vw" : "27vw";
  };

  const handleOpen = (index: number) => {
    if (isExpanded && activeIndex === index) return;
    const carousel = carouselRef.current;
    if (carousel && storedScrollLeftRef.current === null) {
      storedScrollLeftRef.current = carousel.scrollLeft;
      storedViewportWidthRef.current = carousel.clientWidth;
    }
    setActiveIndex(index);
    setHoveredIndex(null);
    setAutoPlay(false);
    setDirection(index > activeIndex ? 1 : -1);
    panelRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    requestAnimationFrame(() => setIsExpanded(true));
  };

  const handleClose = () => {
    // Come back to the print that was last on screen in the overlay.
    setFocusIndex(activeIndex);
    setIsExpanded(false);
  };

  const focusPanel = (index: number) => {
    setAutoPlay(false);
    setFocusIndex(clampIndex(index));
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => clampIndex(prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => clampIndex(prev - 1));
  };

  return (
    <section
      id="work"
      className="fr-ink relative h-screen w-full overflow-hidden"
    >
      <div className="fr-wrap relative z-10 pt-10 lg:pt-12">
        <div className="flex items-end justify-between gap-6">
          <h2 className="fr-h2 !text-[clamp(2.4rem,5vw,4.25rem)]">
            Featured <span className="fr-i">Prints</span>
          </h2>
          <p className="work-text-force fr-label fr-fg-3 pb-2">
            Recently forged
          </p>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative z-10 mx-auto mt-6 h-[70vh] w-full max-w-[90vw] px-0"
      >
        <div
          ref={carouselRef}
          className={`flex h-full w-full overflow-y-hidden scrollbar-hidden scroll-smooth ${
            isExpanded || isNarrowScreen
              ? "overflow-hidden snap-none"
              : "snap-x snap-mandatory overflow-x-auto"
          } ${isNarrowScreen ? "justify-start" : "justify-center"}`}
          style={{
            WebkitOverflowScrolling: "touch",
            // pan-y: the page still scrolls, sideways swipes are ours.
            touchAction: isExpanded
              ? "none"
              : isNarrowScreen
                ? "pan-y"
                : "auto",
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            stripTouchRef.current = touch
              ? { x: touch.clientX, y: touch.clientY }
              : null;
          }}
          onTouchEnd={(event) => {
            const start = stripTouchRef.current;
            const touch = event.changedTouches[0];
            stripTouchRef.current = null;
            if (!isNarrowScreen || isExpanded || !start || !touch) return;
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;
            // A deliberate sideways swipe, not a scroll or a tap.
            if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            focusPanel(focusIndex + (dx < 0 ? 1 : -1));
          }}
        >
          {products.map((product, index) => {
            const isActive = isExpanded && activeIndex === index;
            const isFocused = isNarrowScreen && focusIndex === index;
            // "Lit" is the desktop hover look; the accordion's open panel wears it too.
            const isLit = hoveredIndex === index || isFocused;
            return (
              <motion.button
                key={product.id}
                ref={(el) => {
                  panelRefs.current[index] = el;
                }}
                type="button"
                onMouseEnter={() => {
                  if (!isCoarsePointer && !isExpanded) setHoveredIndex(index);
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  // Accordion: the first tap opens the spine, the second opens the print.
                  if (isNarrowScreen && !isFocused) {
                    focusPanel(index);
                    return;
                  }
                  handleOpen(index);
                }}
                className={`relative flex h-full shrink-0 ${
                  isNarrowScreen ? "" : "snap-start"
                } items-center justify-center overflow-hidden border transition-[width,flex-grow] duration-500 ease-out focus:outline-none`}
                style={{
                  width: getPanelWidth(index),
                  // Every panel starts from the same slim basis; only the open
                  // one grows, and flex-grow animates where width: auto cannot.
                  flexBasis: isNarrowScreen ? "3.25rem" : undefined,
                  flexGrow: isNarrowScreen ? (isFocused ? 1 : 0) : undefined,
                  background: product.background,
                  borderColor: "var(--line)",
                }}
                aria-label={
                  isNarrowScreen && !isFocused
                    ? `Show ${product.name}`
                    : `Open ${product.name}`
                }
              >
                <span
                  className="fr-layers--light absolute inset-0"
                  aria-hidden
                />
                <span
                  className="absolute inset-0 opacity-0 transition duration-500 ease-out group-hover:opacity-100"
                  aria-hidden
                />
                <span
                  className={`work-text-force fr-dot absolute transition-[color,opacity,font-size] duration-500 ${
                    isNarrowScreen
                      ? "right-3 top-4 leading-none"
                      : "right-4 top-5 text-[clamp(2.6rem,6vw,5.5rem)] sm:right-5"
                  }`}
                  style={{
                    color: isLit ? product.accentColor : product.textColor,
                    opacity: isLit ? 0.95 : isNarrowScreen ? 0.45 : 0.2,
                    fontSize: isNarrowScreen
                      ? isFocused
                        ? "3.4rem"
                        : "1.7rem"
                      : undefined,
                  }}
                >
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span
                  className={`work-text-force fr-label absolute z-10 rotate-180 whitespace-nowrap [writing-mode:vertical-rl] ${
                    isNarrowScreen ? "left-4 top-16" : "left-5 top-7"
                  }`}
                  style={{ color: product.textColor, opacity: 0.75 }}
                >
                  {product.name}
                </span>
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className={`${
                    isNarrowScreen
                      ? "max-h-[46vh] max-w-[58vw]"
                      : "max-h-[40vh] max-w-[34vw] sm:max-h-[44vh] sm:max-w-[36vw]"
                  } w-auto object-contain drop-shadow-[0_0_35px_rgba(0,0,0,0.55)] drop-shadow-[0_40px_80px_rgba(0,0,0,0.4)]`}
                  animate={{
                    // A spine has no room for the print, so it fades out there.
                    opacity: isNarrowScreen && !isFocused ? 0 : 1,
                    scale:
                      (product.thumbnailScale ?? 1) *
                      (isActive
                        ? 1.18
                        : hoveredIndex === index && !isCoarsePointer
                          ? 1.08
                          : isNarrowScreen && !isFocused
                            ? 0.9
                            : 1),
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {isNarrowScreen && (
                  <span
                    className="work-text-force fr-label absolute bottom-5 left-5 right-5 flex items-center justify-between whitespace-nowrap transition-opacity duration-300"
                    style={{
                      color: product.textColor,
                      opacity: isFocused ? 0.8 : 0,
                    }}
                    aria-hidden
                  >
                    Tap to open
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 8 8"
                      fill={product.accentColor}
                      shapeRendering="crispEdges"
                    >
                      <path d="M0 0h2v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-2z" />
                    </svg>
                  </span>
                )}
                {isFocused && autoPlay && isCarouselInView && !isExpanded && (
                  <span
                    // Remounting restarts the bar whenever the timer restarts.
                    key={`${focusIndex}-${isCarouselInView}`}
                    className="fr-autobar"
                    style={{
                      background: product.accentColor,
                      animationDuration: `${AUTO_ADVANCE_MS}ms`,
                    }}
                    aria-hidden
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="fr-label fr-fg-3 whitespace-nowrap !text-[15px]">
          {isNarrowScreen ? "Swipe or tap to browse" : "Swipe to explore"}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-[60] flex h-full w-full items-center justify-center"
            style={{ background: activeProduct.background }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            onTouchStart={(event) => {
              touchStartXRef.current = event.touches[0]?.clientX ?? null;
              touchStartYRef.current = event.touches[0]?.clientY ?? null;
              touchMovedRef.current = false;
            }}
            onTouchMove={(event) => {
              if (
                touchStartXRef.current === null ||
                touchStartYRef.current === null
              )
                return;
              const moveX = event.touches[0]?.clientX ?? touchStartXRef.current;
              const moveY = event.touches[0]?.clientY ?? touchStartYRef.current;
              const deltaX = Math.abs(moveX - touchStartXRef.current);
              const deltaY = Math.abs(moveY - touchStartYRef.current);
              if (deltaX > 10 || deltaY > 10) {
                touchMovedRef.current = true;
              }
            }}
            onTouchEnd={(event) => {
              if (touchStartXRef.current === null) return;
              const endX =
                event.changedTouches[0]?.clientX ?? touchStartXRef.current;
              const deltaX = endX - touchStartXRef.current;
              const wasMoved = touchMovedRef.current;
              touchStartXRef.current = null;
              touchStartYRef.current = null;
              touchMovedRef.current = false;
              if (Math.abs(deltaX) > 50) {
                event.stopPropagation();
                if (deltaX < 0) {
                  setDirection(1);
                  handleNext();
                } else {
                  setDirection(-1);
                  handlePrev();
                }
                return;
              }
              if (wasMoved) return;
            }}
          >
            <motion.div
              className="absolute inset-0 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden
            />
            <motion.div
              className={`relative flex h-full w-full px-6 sm:px-12 lg:pr-0 ${
                isNarrowScreen
                  ? "flex-col items-start justify-start overflow-y-auto"
                  : "flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-start lg:gap-0"
              }`}
              style={
                isNarrowScreen
                  ? { WebkitOverflowScrolling: "touch" }
                  : undefined
              }
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { type: "spring", stiffness: 160, damping: 22 },
              }}
              exit={{ scale: 0.98, opacity: 0, transition: { duration: 0.2 } }}
              onClick={(event) => event.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id}
                  className="relative flex h-full w-full"
                  custom={direction}
                  initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.35, ease: "easeOut" },
                  }}
                  exit={{
                    opacity: 0,
                    x: direction >= 0 ? -60 : 60,
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}
                >
                  {isNarrowScreen ? (
                    <div className="relative z-10 w-full max-w-md space-y-6 text-left">
                      <div className="flex w-full justify-center pt-4">
                        <motion.img
                          src={activeProduct.image}
                          alt={activeProduct.name}
                          className="h-[45vh] w-[85vw] max-h-[45vh] max-w-[92vw] object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.6)] drop-shadow-[0_45px_90px_rgba(0,0,0,0.55)]"
                          style={{
                            transform: `scale(${activeProduct.expandedScale ?? 1})`,
                            transformOrigin: "center",
                          }}
                          animate={{ y: [0, -10, 0] }}
                          transition={{
                            duration: 3.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        />
                      </div>
                      <p
                        className="work-text-force fr-label"
                        style={{ color: activeProduct.accentColor }}
                      >
                        Featured print
                      </p>
                      <h3
                        className="work-text-force fr-h2 !text-[clamp(2.6rem,10vw,3.75rem)]"
                        style={{ color: activeProduct.textColor }}
                      >
                        {activeProduct.name}
                      </h3>
                      <p
                        className="work-text-force text-sm sm:text-base"
                        style={{
                          color: activeProduct.textColor,
                          opacity: 0.9,
                        }}
                      >
                        {activeProduct.description}
                      </p>
                      <p
                        className="work-text-force text-sm sm:text-base"
                        style={{
                          color: activeProduct.textColor,
                          opacity: 0.7,
                        }}
                      >
                        {activeProduct.shopDescription}
                      </p>
                      <p
                        className="work-text-force text-xs sm:text-sm"
                        style={{
                          color: activeProduct.textColor,
                          opacity: 0.6,
                        }}
                      >
                        {activeProduct.detail}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        {activeProduct.shopUrl && (
                          <a
                            href={activeProduct.shopUrl}
                            className="work-text-force fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain"
                          >
                            View in store
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleClose}
                          className="work-text-force fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                        <img
                          src={activeProduct.image}
                          alt={activeProduct.name}
                          className="h-[85vh] w-[80vw] max-h-[85vh] max-w-[90vw] sm:h-[85vh] sm:w-[75vw] sm:max-w-[85vw] object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.65)] drop-shadow-[0_55px_110px_rgba(0,0,0,0.6)]"
                          style={{
                            transform: `scale(${activeProduct.expandedScale ?? 1})`,
                            transformOrigin: "center",
                          }}
                        />
                      </div>

                      <div className="relative z-10 w-full max-w-md space-y-6 text-left lg:w-[45%] lg:ml-[6vw] lg:my-auto">
                        <p
                          className="work-text-force fr-label"
                          style={{ color: activeProduct.accentColor }}
                        >
                          Featured print
                        </p>
                        <h3
                          className="work-text-force fr-h2 !text-[clamp(3rem,5.2vw,5rem)]"
                          style={{ color: activeProduct.textColor }}
                        >
                          {activeProduct.name}
                        </h3>
                        <p
                          className="work-text-force text-sm sm:text-base"
                          style={{
                            color: activeProduct.textColor,
                            opacity: 0.9,
                          }}
                        >
                          {activeProduct.description}
                        </p>
                        <p
                          className="work-text-force text-sm sm:text-base"
                          style={{
                            color: activeProduct.textColor,
                            opacity: 0.7,
                          }}
                        >
                          {activeProduct.shopDescription}
                        </p>
                        <p
                          className="work-text-force text-xs sm:text-sm"
                          style={{
                            color: activeProduct.textColor,
                            opacity: 0.6,
                          }}
                        >
                          {activeProduct.detail}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          {activeProduct.shopUrl && (
                            <a
                              href={activeProduct.shopUrl}
                              className="work-text-force fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain"
                            >
                              View in store
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={handleNext}
                            className="work-text-force fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain"
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            onClick={handleClose}
                            className="work-text-force fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden lg:block lg:w-1/2">
                        <div className="h-full w-full overflow-hidden border-l border-white/10 bg-white/10">
                          {activeProduct.lifestyleImage ? (
                            <img
                              src={activeProduct.lifestyleImage}
                              alt={`${activeProduct.name} lifestyle`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs tracking-[0.05em] text-white/70">
                              Lifestyle image
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <button
              type="button"
              aria-label="Close"
              className="fr-fg fr-line-2 pointer-events-auto absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-[#0b0a08] transition-colors hover:border-[color:var(--fg)]"
              onClick={(event) => {
                event.stopPropagation();
                handleClose();
              }}
            >
              <FiX className="h-5 w-5" />
            </button>
            {!isNarrowScreen && (
              <>
                <button
                  type="button"
                  aria-label="Previous product"
                  className="fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain absolute bottom-8 left-8 z-10 bg-[#0b0a08]"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePrev();
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  aria-label="Next product"
                  className="fr-btn fr-btn--ghost fr-btn--sm fr-btn--plain absolute bottom-8 right-8 z-10 bg-[#0b0a08]"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNext();
                  }}
                >
                  Next
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
