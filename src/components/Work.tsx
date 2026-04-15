"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const getTheme = () =>
      (typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") as "light" | "dark" | null)) ||
      "dark";

    setTheme(getTheme());

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(() => setTheme(getTheme()));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => observer.disconnect();
    }
  }, []);

  return theme;
};

type Product = {
  id: string;
  name: string;
  description: string;
  shopDescription: string;
  detail: string;
  image: string;
  background: string;
  textColor: string;
  accentColor: string;
};

const products: Product[] = [
  {
    id: "aurora-lamp",
    name: "Aurora Bloom",
    description:
      "A gradient lamp shade with a soft spiral that diffuses light into a warm glow, bringing ambient color to desks and shelves.",
    shopDescription:
      "Aurora Bloom is a gradient lamp shade with a soft spiral that diffuses light into a warm glow. Printed in precision PLA with smooth layering, it brings ambient color to desks, shelves, and bedside tables.",
    detail:
      "The soft spiral diffuser creates beautiful ambient lighting effects, perfect for creating a cozy atmosphere in any space.",
    image: "/ablamp-nbg.webp",
    background: "#0a0a0a",
    textColor: "#FADE6A",
    accentColor: "#F59E0B",
  },
  {
    id: "nebula-owl",
    name: "Leeds Owl",
    description:
      "A compact guardian owl with gradient feathers and crisp silhouette, designed to sit proudly on desks and shelves.",
    shopDescription:
      "A Leeds-inspired owl with a warm gradient that fades from amber to blush. Crisp feather detail makes it a standout accent for studios and shelves.",
    detail:
      "The owl is a symbol woven through Leeds, appearing across the city and in the Leeds United crest, making this piece a small tribute to home.",
    image: "/owl-nbg.webp",
    background: "#0a0a0a",
    textColor: "#FADE6A",
    accentColor: "#F59E0B",
  },
  {
    id: "forest-dragon",
    name: "Forest Dragon",
    description:
      "An articulated dragon printed in emerald PLA, poised for display or as a dramatic tabletop companion.",
    shopDescription:
      "A detailed, articulated dragon with layered scales and a balanced pose. The green PLA blend shifts under light, making it feel alive on shelves, desks, or diorama bases.",
    detail:
      "Layered scales and a balanced stance give it a lifelike posture, perfect for collectors who want a mythic centerpiece.",
    image: "/dragon-nbg.webp",
    background: "#0a0a0a",
    textColor: "#FADE6A",
    accentColor: "#F59E0B",
  },
  {
    id: "dice-guardian",
    name: "Dice Guardian",
    description:
      "A sculpted dice cradle with bold angles and sturdy PETG layers for tabletop nights.",
    shopDescription:
      "A compact dragon head designed to cradle a full set of D&D dice. PETG adds toughness, and the sculpted form keeps it sharp and tabletop-ready.",
    detail:
      "The open jaw holds a full set of dice while the PETG build keeps it tough enough for regular game nights.",
    image: "/dice-dragon-nbg.webp",
    background: "#0a0a0a",
    textColor: "#FADE6A",
    accentColor: "#F59E0B",
  },
];

export default function Work() {
  const isLight = false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
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
  const autoScrollTimerRef = useRef<number | null>(null);
  const autoIndexRef = useRef(0);

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
      { threshold: 0.35 }
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
      const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      let target = storedScrollLeftRef.current ?? carousel.scrollLeft;
      if (storedViewportWidthRef.current) {
        target = (target * carousel.clientWidth) / storedViewportWidthRef.current;
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
    if (!carousel || isExpanded) return;
    let ticking = false;
    const handleScroll = () => {
      if (isExpanded) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const width = carousel.clientWidth || 1;
        const approxPanelWidth = isCoarsePointer && isNarrowScreen ? width * 0.8 : width * 0.2;
        const index = Math.round(carousel.scrollLeft / approxPanelWidth);
        const nextIndex = clampIndex(index);
        autoIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      });
    };
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, [clampIndex, isCoarsePointer, isExpanded, isNarrowScreen]);

  useEffect(() => {
    if (!isExpanded) return;
    setHoveredIndex(null);
  }, [isExpanded]);

  useEffect(() => {
    if (!(isCoarsePointer && isNarrowScreen) || isExpanded || !isCarouselInView) return;
    autoIndexRef.current = 0;
    const startTimer = window.setTimeout(() => {
      const carousel = carouselRef.current;
      const panel = panelRefs.current[0];
      if (!carousel || !panel) return;
      const target = panel.offsetLeft - (carousel.clientWidth - panel.offsetWidth) / 2;
      carousel.scrollTo({ left: Math.max(0, target), behavior: "auto" });
    }, 60);
    const step = () => {
      const carousel = carouselRef.current;
      const nextIndex = clampIndex(autoIndexRef.current + 1);
      autoIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      const panel = panelRefs.current[nextIndex];
      if (!carousel || !panel) return;
      const target = panel.offsetLeft - (carousel.clientWidth - panel.offsetWidth) / 2;
      carousel.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    };
    autoScrollTimerRef.current = window.setInterval(step, 4200);
    return () => {
      window.clearTimeout(startTimer);
      if (autoScrollTimerRef.current) {
        window.clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };
  }, [clampIndex, isCarouselInView, isCoarsePointer, isExpanded, isNarrowScreen]);

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

  const getPanelWidth = (index: number) => {
    if (isCoarsePointer && isNarrowScreen) {
      return "72vw";
    }
    if (isExpanded && activeIndex === index) {
      return "100vw";
    }
    return hoveredIndex === index ? "28vw" : "20vw";
  };


  const getImageScale = (index: number) => {
    if (isCoarsePointer && isNarrowScreen) return "scale(1.05)";
    return hoveredIndex === index ? "scale(1.06)" : "scale(1)";
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
    setDirection(index > activeIndex ? 1 : -1);
    panelRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    requestAnimationFrame(() => setIsExpanded(true));
  };

  const handleClose = () => {
    setIsExpanded(false);
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
      className="relative h-screen w-full overflow-hidden text-white" style={{ background: 'linear-gradient(180deg, #080c14 0%, #0a0e18 50%, #080c14 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" />
      {/* Yellow gradient borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FADE6A]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FADE6A]/40 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="max-w-2xl">
          <div className="relative">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gradient-to-r from-blue-400 to-purple-400" />
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-blue-300/60" style={{ fontFamily: "'Jost', sans-serif" }}>Curated</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              Featured <em style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#FADE6A' }}>Prints</em>
            </h2>
          </div>
          <p className="work-text-force mt-2 text-sm text-stone-400" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
            ForgeRealm originals, designed and printed in Leeds
          </p>
        </div>
      </div>
      <div ref={containerRef} className="relative z-10 mx-auto mt-6 h-[70vh] w-full max-w-[90vw] px-0">
        <div
          ref={carouselRef}
          className={`flex h-full w-full overflow-y-hidden scrollbar-hidden scroll-smooth ${
            isExpanded ? "overflow-hidden snap-none" : "snap-x snap-mandatory overflow-x-auto"
          } ${isCoarsePointer && isNarrowScreen ? "justify-start px-[8vw]" : "justify-center"}`}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: isExpanded ? "none" : "auto",
            scrollPaddingLeft: isCoarsePointer && isNarrowScreen ? "8vw" : undefined,
            scrollPaddingRight: isCoarsePointer && isNarrowScreen ? "8vw" : undefined,
          }}
        >
          {products.map((product, index) => {
            const isActive = isExpanded && activeIndex === index;
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
                  handleOpen(index);
                }}
                className={`relative flex h-full shrink-0 ${
                  isCoarsePointer && isNarrowScreen ? "snap-center snap-always" : "snap-start"
                } items-center justify-center overflow-hidden border transition-[width] duration-500 ease-out focus:outline-none`}
                style={{
                  width: getPanelWidth(index),
                  background: product.background,
                  borderColor: '#FADE6A40',
                }}
                aria-label={`Open ${product.name}`}
              >
                <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30" aria-hidden />
                <span className="absolute inset-0 opacity-0 transition duration-500 ease-out group-hover:opacity-100" aria-hidden />
                <span className="work-text-force absolute right-6 top-10 text-6xl font-semibold sm:text-7xl" style={{ fontFamily: "'Cinzel', serif", color: product.textColor, opacity: 0.15 }}>
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="work-text-force absolute left-6 top-8 rotate-180 text-[10px] uppercase tracking-[0.45em] [writing-mode:vertical-rl] sm:text-xs z-10" style={{ fontFamily: "'Cinzel', serif", color: product.textColor }}>
                  {product.name}
                </span>
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className={`${
                    isCoarsePointer && isNarrowScreen
                      ? "max-h-[52vh] max-w-[70vw]"
                      : "max-h-[40vh] max-w-[34vw] sm:max-h-[44vh] sm:max-w-[36vw]"
                  } w-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.4)]`}
                  animate={{
                    scale: isActive ? 1.18 : hoveredIndex === index && !isCoarsePointer ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.35em] bg-black/50 text-white/60 backdrop-blur-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
          Swipe to explore
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
              if (touchStartXRef.current === null || touchStartYRef.current === null) return;
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
              const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
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
              style={isNarrowScreen ? { WebkitOverflowScrolling: "touch" } : undefined}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 160, damping: 22 } }}
              exit={{ scale: 0.98, opacity: 0, transition: { duration: 0.2 } }}
              onClick={(event) => event.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id}
                  className="relative flex h-full w-full"
                  custom={direction}
                  initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } }}
                  exit={{ opacity: 0, x: direction >= 0 ? -60 : 60, transition: { duration: 0.25, ease: "easeIn" } }}
                >
                  {isNarrowScreen ? (
                    <div className="relative z-10 w-full max-w-md space-y-6 text-left">
                      <div className="flex w-full justify-center pt-4">
                        <motion.img
                          src={activeProduct.image}
                          alt={activeProduct.name}
                          className="h-[45vh] w-[85vw] max-h-[45vh] max-w-[92vw] object-contain drop-shadow-[0_45px_90px_rgba(0,0,0,0.55)]"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
                        />
                      </div>
                      <p className={`work-text-force text-[10px] uppercase tracking-[0.35em] ${isLight ? "text-slate-700" : "text-white/80"}`}>
                        Featured print
                      </p>
                      <h3 className="work-text-force text-3xl font-bold sm:text-4xl" style={{ fontFamily: "'Cinzel', serif", color: activeProduct.textColor }}>
                        {activeProduct.name}
                      </h3>
                      <p className="work-text-force text-sm sm:text-base" style={{ fontFamily: "'Inter', sans-serif", color: activeProduct.textColor, opacity: 0.9 }}>
                        {activeProduct.description}
                      </p>
                      <p className="work-text-force text-sm sm:text-base" style={{ fontFamily: "'Inter', sans-serif", color: activeProduct.textColor, opacity: 0.7 }}>
                        {activeProduct.shopDescription}
                      </p>
                      <p className="work-text-force text-xs sm:text-sm" style={{ fontFamily: "'Inter', sans-serif", color: activeProduct.textColor, opacity: 0.6 }}>
                        {activeProduct.detail}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button className={`work-text-force inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}>
                          View in store
                        </button>
                        <button
                          type="button"
                          onClick={handleClose}
                          className={`work-text-force inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}
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
                          className="h-[85vh] w-[80vw] max-h-[85vh] max-w-[90vw] sm:h-[85vh] sm:w-[75vw] sm:max-w-[85vw] object-contain drop-shadow-[0_55px_110px_rgba(0,0,0,0.6)]"
                        />
                      </div>

                      <div className="relative z-10 w-full max-w-md space-y-6 text-left lg:w-[45%] lg:ml-[6vw] lg:my-auto">
                        <p className="work-text-force text-[10px] uppercase tracking-[0.35em]" style={{ fontFamily: "'Jost', sans-serif", color: activeProduct.accentColor }}>
                          Featured print
                        </p>
                        <h3 className="work-text-force text-3xl font-bold sm:text-4xl" style={{ fontFamily: "'Cinzel', serif", color: activeProduct.textColor }}>
                          {activeProduct.name}
                        </h3>
                        <p className="work-text-force text-sm sm:text-base" style={{ fontFamily: "'Inter', sans-serif", color: activeProduct.textColor, opacity: 0.9 }}>
                          {activeProduct.description}
                        </p>
                        <p className="work-text-force text-sm sm:text-base" style={{ fontFamily: "'Inter', sans-serif", color: activeProduct.textColor, opacity: 0.7 }}>
                          {activeProduct.shopDescription}
                        </p>
                        <p className="work-text-force text-xs sm:text-sm" style={{ fontFamily: "'Inter', sans-serif", color: activeProduct.textColor, opacity: 0.6 }}>
                          {activeProduct.detail}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <button className={`work-text-force inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}>
                            View in store
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            className={`work-text-force inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            onClick={handleClose}
                            className={`work-text-force inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}
                          >
                            Close
                          </button>
                        </div>
                      </div>

                  <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden lg:block lg:w-1/2">
                    <div className="h-full w-full overflow-hidden border-l border-white/10 bg-white/10">
                          {activeProduct.id === "aurora-lamp" ? (
                            <img
                              src="/ablamp2side.png"
                              alt="Aurora Bloom Lamp lifestyle"
                              className="h-full w-full object-cover"
                            />
                          ) : activeProduct.id === "nebula-owl" ? (
                            <img
                              src="/reg.png"
                              alt="Leeds Owl lifestyle"
                              className="h-full w-full object-cover"
                            />
                          ) : activeProduct.id === "forest-dragon" ? (
                            <img
                              src="/dragonforestbg.jpg"
                              alt="Forest Dragon lifestyle"
                              className="h-full w-full object-cover"
                            />
                          ) : activeProduct.id === "dice-guardian" ? (
                            <img
                              src="/dicedragonbg.jpg"
                              alt="Dice Guardian lifestyle"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/70">
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
              className={`absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition pointer-events-auto ${isLight ? "border-slate-300 bg-white/80 text-slate-700 hover:bg-white" : "border-white/60 bg-white/10 text-white hover:bg-white/20"}`}
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
                  className="absolute bottom-8 left-8 z-10 rounded-full border border-white/40 bg-black/40 px-5 py-2 text-[10px] uppercase tracking-[0.4em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition hover:bg-black/60"
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
                  className="absolute bottom-8 right-8 z-10 rounded-full border border-white/40 bg-black/40 px-5 py-2 text-[10px] uppercase tracking-[0.4em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition hover:bg-black/60"
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
