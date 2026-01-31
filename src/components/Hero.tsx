"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import Lottie from "lottie-react";
import { FiStar } from "react-icons/fi";
import { RiLeafFill } from "react-icons/ri";
import { MdBrush } from "react-icons/md";
import { GiDragonHead } from "react-icons/gi";
import { RiEarthLine } from "react-icons/ri";
import { HiOutlineLightBulb } from "react-icons/hi";
import { FaRecycle, FaShoppingBag } from "react-icons/fa";

interface HeroProps {
  onLoadComplete?: () => void;
}

type SplineComponent = ComponentType<{
  scene: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}>;

const useSaveDataPreference = () => {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = typeof navigator !== "undefined" ? (navigator as any).connection : null;
    const update = () => setSaveData(Boolean(connection?.saveData));

    update();
    connection?.addEventListener?.("change", update);
    return () => connection?.removeEventListener?.("change", update);
  }, []);

  return saveData;
};

const useIdle = (timeoutMs = 800) => {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const idleCallback = (window as any).requestIdleCallback;

    if (typeof idleCallback === "function") {
      const handle = idleCallback(() => setIdle(true), { timeout: timeoutMs });
      return () => (window as any).cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(() => setIdle(true), timeoutMs);
    return () => clearTimeout(handle);
  }, [timeoutMs]);

  return idle;
};

const useFirstInteraction = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const trigger = () => setReady(true);
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, trigger, { passive: true }));
    return () => events.forEach((evt) => window.removeEventListener(evt, trigger));
  }, []);

  return ready;
};

const useIntersectionOnce = (rootMargin = "200px") => {
  const targetRef = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!targetRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { targetRef, isIntersecting };
};

const useSplineScene = (timeoutMs = 4000, enabled = true) => {
  const [useFallback, setUseFallback] = useState(false);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setUseFallback(false);
      setVisible(false);
      clearTimer();
      return;
    }

    const effectiveTimeout = Math.min(timeoutMs, 2500);
    timeoutRef.current = setTimeout(() => setUseFallback(true), effectiveTimeout);
    return () => clearTimer();
  }, [timeoutMs, enabled]);

  return {
    useFallback,
    splineVisible: visible,
    markLoaded: useCallback(() => {
      clearTimer();
      setUseFallback(false);
      setVisible(true);
    }, [clearTimer]),
    markError: useCallback(() => {
      clearTimer();
      setUseFallback(true);
    }, [clearTimer]),
  };
};

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

const darkParticlePositions = [
  { left: "6%", top: "12%" },
  { left: "18%", top: "28%" },
  { left: "32%", top: "18%" },
  { left: "44%", top: "36%" },
  { left: "58%", top: "22%" },
  { left: "72%", top: "30%" },
  { left: "84%", top: "16%" },
  { left: "12%", top: "58%" },
  { left: "26%", top: "72%" },
  { left: "40%", top: "62%" },
  { left: "54%", top: "70%" },
  { left: "68%", top: "58%" },
  { left: "82%", top: "74%" },
  { left: "8%", top: "88%" },
  { left: "36%", top: "90%" },
  { left: "64%", top: "88%" },
  { left: "92%", top: "56%" },
  { left: "78%", top: "44%" },
];

const lightParticleConfig = [
  { left: "5%", top: "12%", size: 1.4, colorClass: "from-amber-300/80 to-orange-300/70" },
  { left: "18%", top: "22%", size: 1.2, colorClass: "from-yellow-300/80 to-amber-300/70" },
  { left: "30%", top: "14%", size: 1.6, colorClass: "from-orange-300/75 to-amber-300/65" },
  { left: "42%", top: "28%", size: 1.1, colorClass: "from-amber-300/70 to-yellow-300/60" },
  { left: "55%", top: "18%", size: 1.8, colorClass: "from-orange-300/65 to-yellow-300/55" },
  { left: "70%", top: "26%", size: 1.3, colorClass: "from-yellow-300/60 to-orange-300/50" },
  { left: "84%", top: "12%", size: 1.5, colorClass: "from-amber-300/80 to-orange-300/70" },
  { left: "12%", top: "46%", size: 1.2, colorClass: "from-yellow-300/80 to-amber-300/70" },
  { left: "26%", top: "58%", size: 1.6, colorClass: "from-orange-300/75 to-amber-300/65" },
  { left: "40%", top: "50%", size: 1.1, colorClass: "from-amber-300/70 to-yellow-300/60" },
  { left: "54%", top: "62%", size: 1.7, colorClass: "from-orange-300/65 to-yellow-300/55" },
  { left: "68%", top: "54%", size: 1.3, colorClass: "from-yellow-300/60 to-orange-300/50" },
  { left: "82%", top: "60%", size: 1.5, colorClass: "from-amber-300/80 to-orange-300/70" },
  { left: "8%", top: "78%", size: 1.2, colorClass: "from-yellow-300/80 to-amber-300/70" },
  { left: "24%", top: "88%", size: 1.6, colorClass: "from-orange-300/75 to-amber-300/65" },
  { left: "48%", top: "84%", size: 1.1, colorClass: "from-amber-300/70 to-yellow-300/60" },
  { left: "66%", top: "88%", size: 1.8, colorClass: "from-orange-300/65 to-yellow-300/55" },
  { left: "90%", top: "78%", size: 1.3, colorClass: "from-yellow-300/60 to-orange-300/50" },
];

export default function Hero({ onLoadComplete }: HeroProps) {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineEverLoaded, setSplineEverLoaded] = useState(false);
  const [lightVideoStarted, setLightVideoStarted] = useState(false);
  const [printAnimation, setPrintAnimation] = useState<object | null>(null);
  const buttonsRef = useRef(null);
  const saveData = useSaveDataPreference();
  const idleReady = useIdle();
  const interactionReady = useFirstInteraction();
  const { targetRef: heroRef, isIntersecting } = useIntersectionOnce();
  const isLighthouse =
    typeof navigator !== "undefined" &&
    /Lighthouse|Chrome-Lighthouse|Page Speed Insights/i.test(navigator.userAgent || "");
  const [SplineComponent, setSplineComponent] = useState<SplineComponent | null>(null);
  const allowHeavy = !isLighthouse;
  const enableSpline = false;
  const shouldLoadHeavy = enableSpline && allowHeavy && isIntersecting;
  const { useFallback, splineVisible, markLoaded, markError } = useSplineScene(4000, shouldLoadHeavy);
  const theme = useTheme();
  const [ecoAnimation, setEcoAnimation] = useState(null);
  const [paintAnimation, setPaintAnimation] = useState(null);
  const [fantasyAnimation, setFantasyAnimation] = useState(null);
  const isLight = theme === "light";
  const lightPanelStyle = undefined;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = (path, setter) => {
      fetch(path)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setter(data);
        })
        .catch(() => {});
    };
    load("/print.json", setPrintAnimation);
    load("/eco.json", setEcoAnimation);
    load("/paint.json", setPaintAnimation);
    load("/fantasy.json", setFantasyAnimation);
  }, []);

  const handleSplineLoad = () => {
    setSplineLoaded(true);
    setSplineEverLoaded(true);
    markLoaded();
    onLoadComplete?.();
  };

  // const heroVisible = isLight || !shouldLoadHeavy || splineLoaded || useFallback;

  // Keep hero content visible on all devices; we only swap backgrounds when heavy assets are ready.
  const heroVisible = true;
  const showDarkSpline = false;
  const showLightVideo = isLight && (lightVideoStarted || shouldLoadHeavy);

  useEffect(() => {
    if (!shouldLoadHeavy || SplineComponent) return;

    let cancelled = false;
    import("@splinetool/react-spline")
      .then((mod) => {
        if (!cancelled) {
          setSplineComponent(() => mod.default);
        }
      })
      .catch(() => {
        if (!cancelled) {
          markError();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldLoadHeavy, SplineComponent, markError]);

  return (
    <section
      id="homepage"
      ref={heroRef}
      className={`relative min-h-[100svh] lg:min-h-[100vh] overflow-hidden z-0 ${isLight ? "bg-white" : "bg-transparent"}`}
    >
      {/* Background fixed to viewport to avoid iOS visual viewport resizes */}
      {!isLight && (
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-[#0a1222] bg-[radial-gradient(circle_at_18%_12%,rgba(10,18,34,0.9),transparent_60%),radial-gradient(circle_at_78%_18%,rgba(30,58,138,0.22),transparent_50%),radial-gradient(circle_at_55%_80%,rgba(8,47,73,0.28),transparent_60%)]" />
        </div>
      )}

      {/* Enhanced Ambient lighting with more depth */}
      {!isLight && (
        <div className="hidden lg:block absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-[10%] h-80 w-80 bg-gradient-to-r from-blue-500/30 to-cyan-400/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-[10%] h-96 w-96 bg-gradient-to-r from-indigo-400/25 to-purple-500/20 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-0 left-1/2 h-64 w-64 bg-gradient-to-r from-fuchsia-500/15 to-pink-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 right-1/4 h-48 w-48 bg-gradient-to-r from-emerald-500/20 to-teal-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      )}
      {isLight && (
        <div className="hidden lg:block absolute inset-0 -z-10">
          {/* Warm golden orbs */}
          <div className="absolute top-1/4 left-[15%] h-72 w-72 bg-gradient-to-r from-amber-300/80 to-orange-200/70 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-1/3 right-[12%] h-80 w-80 bg-gradient-to-r from-pink-300/75 to-rose-200/65 rounded-full blur-[190px] animate-pulse" style={{ animationDelay: '1.2s' }} />
          
          {/* Golden accent lights */}
          <div className="absolute top-1/6 right-1/3 h-56 w-56 bg-gradient-to-r from-yellow-300/75 to-amber-200/65 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-1/6 left-1/3 h-64 w-64 bg-gradient-to-r from-orange-300/70 to-amber-200/60 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2.1s' }} />
          
          {/* Warm sunset accents */}
          <div className="absolute top-1/2 left-[8%] h-48 w-48 bg-gradient-to-r from-amber-300/60 to-yellow-200/50 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-3/4 right-[8%] h-40 w-40 bg-gradient-to-r from-orange-300/55 to-amber-200/45 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      )}

      {/* Floating particles for extra magic */}
      {!isLight && (
        <div className="absolute inset-0 -z-5 overflow-hidden">
          {darkParticlePositions.map((spot, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
              style={{
                left: spot.left,
                top: spot.top,
              }}
            />
          ))}
        </div>
      )}

      {/* Light mode floating particles - more vibrant and dynamic */}
      {isLight && (
        <div className="absolute inset-0 -z-5 overflow-hidden">
          {lightParticleConfig.map((spot, i) => (
            <div
              key={i}
              className={`absolute rounded-full bg-gradient-to-r ${spot.colorClass} shadow-[0_0_8px_rgba(251,191,36,0.4)]`}
              style={{
                width: `${spot.size}px`,
                height: `${spot.size}px`,
                left: spot.left,
                top: spot.top,
              }}
            />
          ))}
        </div>
      )}

      {/* Mobile ambient lighting - more visible */}
      {!isLight && (
        <div className="lg:hidden absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-[5%] h-64 w-64 bg-gradient-to-r from-blue-500/40 to-cyan-400/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-[5%] h-72 w-72 bg-gradient-to-r from-indigo-400/35 to-purple-500/25 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-48 w-48 bg-gradient-to-r from-fuchsia-500/25 to-pink-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )}

      {/* Mobile light mode ambient lighting - vibrant and warm */}
      {isLight && (
        <div className="lg:hidden absolute inset-0 -z-10">
          <div className="absolute top-1/5 left-[8%] h-60 w-60 bg-gradient-to-r from-amber-300/70 to-orange-200/60 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-[8%] h-64 w-64 bg-gradient-to-r from-pink-300/65 to-rose-200/55 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1.3s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-52 w-52 bg-gradient-to-r from-yellow-300/60 to-amber-200/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-3/4 left-[15%] h-48 w-48 bg-gradient-to-r from-orange-300/55 to-amber-200/45 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '2.1s' }} />
          <div className="absolute bottom-1/6 right-[20%] h-40 w-40 bg-gradient-to-r from-amber-300/50 to-yellow-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.7s' }} />
        </div>
      )}

      {/* Main Hero */}
      <div
        className={`relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 lg:pb-32 gap-12 lg:gap-36 xl:gap-40 transition-opacity duration-700 ${heroVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Left side */}
        <div className="" style={lightPanelStyle}>
          <div className="flex items-center gap-6 mb-2 justify-center lg:justify-start">
            <img
              src="/notitlefrwatermark.webp"
              alt="ForgeRealm Logo"
              width={90}
              height={90}
              className={`object-contain ${isLight ? "bg-black rounded-full p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-2 ring-black/20" : "drop-shadow-[0_0_40px_rgba(59,130,246,0.55)]"} hidden sm:block`}
              loading="lazy"
            />
            {/* Mobile logo */}
            <img
              src="/notitlefrwatermark.webp"
              alt="ForgeRealm Logo"
              width={60}
              height={60}
              className={`object-contain ${isLight ? "bg-black rounded-full p-2 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-2 ring-black/20" : "drop-shadow-[0_0_40px_rgba(59,130,246,0.55)]"} sm:hidden`}
              loading="lazy"
            />
            <div className="relative inline-block max-w-full">
              <span className={`absolute -inset-3 ${isLight ? "bg-gradient-to-r from-amber-300/40 via-orange-200/30 to-pink-200/40" : "bg-gradient-to-r from-blue-500/30 to-cyan-400/30"} blur-3xl rounded-lg block animate-pulse`} />
              <h1
                className={`relative max-w-full font-display leading-tight lg:leading-normal ${isLight ? "text-3xl sm:text-6xl lg:text-6xl" : "text-4xl sm:text-6xl lg:text-7xl"} font-bold tracking-tight break-words ${isLight ? "text-slate-900 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]" : "bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"}`}
              >
                Forge<span className={isLight ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 drop-shadow-[0_2px_8px_rgba(251,146,60,0.45)]" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"}>Realm</span>
              </h1>
            </div>
          </div>

          <p className={`mt-4 text-lg sm:text-2xl ${isLight ? "text-slate-900 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]" : "text-blue-200"} text-center lg:text-left font-semibold drop-shadow-lg`}>
            Your vision, printed with purpose.
          </p>

          <p className={`mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl ${isLight ? "text-slate-800 drop-shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "text-gray-300"} max-w-lg leading-relaxed text-center lg:text-left mx-auto lg:mx-0 px-4 sm:px-0 drop-shadow-md`}>
            Slick sculptures, modular accents, and daily essentials engineered with planet-first materials.
          </p>

          {/* Buttons */}
          <div
            ref={buttonsRef}
            className="mt-10 flex flex-wrap justify-center text-center lg:justify-start gap-3"
          >
            <a
              href="/shop"
              className={`items-center px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg lg:text-xl uppercase tracking-wide hover:scale-105 transition-all duration-300 inline-flex gap-2 sm:gap-3 shadow-lg hover:shadow-2xl ${isLight ? "bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white hover:shadow-[0_12px_40px_rgba(251,191,36,0.4)] border-2 border-white/20" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(96,165,250,0.7)]"}`}
            >
              <FaShoppingBag className="text-lg sm:text-xl" />
              <span>Shop</span>
            </a>
            <a
              href="/subscribe"
              className={`items-center px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg lg:text-xl uppercase tracking-wide hover:scale-105 transition-all duration-300 border-2 ${isLight ? "border-gradient-to-r from-purple-500 to-pink-500 bg-white/90 text-slate-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-[0_12px_40px_rgba(168,85,247,0.3)] backdrop-blur-sm" : "border border-blue-400 text-blue-300 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(96,165,250,0.5)]"}`}
            >
              Join Us!
            </a>
          </div>

          {printAnimation && (
            <div className="mt-8 flex justify-center lg:hidden w-full">
              <div className={`relative w-full max-w-[30rem] mx-auto overflow-hidden rounded-[2rem] p-[1px] ${isLight ? "shadow-[0_25px_80px_rgba(251,191,36,0.4)]" : "shadow-[0_25px_80px_rgba(78,71,229,0.4)]"}`}>
                <span className={`absolute inset-[-1000%] animate-[spin_2s_linear_infinite] ${isLight ? "bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#f59e0b_50%,#ffffff_100%)]" : "bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#4e47e5_50%,#ffffff_100%)]"}`} />
                <div className={`relative rounded-[2rem] ${isLight ? "bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500" : "bg-[#4e47e5]"} p-5 sm:p-6`}>
                  <div className={`pointer-events-none absolute inset-0 rounded-[2rem] ${isLight ? "bg-gradient-to-br from-white/40 via-amber-100/20 to-white/10" : "bg-gradient-to-br from-white/30 via-transparent to-white/5"}`} />
                  <div className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full ${isLight ? "bg-amber-200/20" : "bg-white/15"} blur-2xl`} />
                  <div className={`pointer-events-none absolute -bottom-8 left-6 h-24 w-24 rounded-full ${isLight ? "bg-pink-300/25" : "bg-indigo-300/25"} blur-3xl`} />
                  <div className={`pointer-events-none absolute left-5 top-12 h-2 w-20 rounded-full ${isLight ? "bg-amber-200/40" : "bg-white/35"}`} />
                  <div className={`pointer-events-none absolute left-5 top-16 h-1 w-14 rounded-full ${isLight ? "bg-orange-200/30" : "bg-white/25"}`} />
                  <div className={`pointer-events-none absolute right-6 top-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                    <span className={`h-2 w-2 rounded-full ${isLight ? "bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]" : "bg-emerald-300/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]"}`} />
                    Live
                  </div>
                  <div className={`pointer-events-none absolute bottom-5 left-5 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                    <span className={`h-2 w-2 rounded-full ${isLight ? "bg-amber-300/70" : "bg-white/70"}`} />
                    Production View
                  </div>
                  <div className={`pointer-events-none absolute bottom-12 right-6 rounded-full border ${isLight ? "border-amber-300/40 bg-amber-50/20" : "border-white/30 bg-white/10"} px-3 py-1 text-[9px] uppercase tracking-[0.25em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                    Showcase Ready
                  </div>
                  <div className={`pointer-events-none absolute inset-x-6 bottom-4 h-px ${isLight ? "bg-amber-200/20" : "bg-white/15"}`} />
                  <div className={`pointer-events-none absolute left-5 top-5 rounded-full border ${isLight ? "border-amber-300/60 bg-amber-50/30" : "border-white/50 bg-white/10"} px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] ${isLight ? "text-amber-900/80" : "text-white/80"}`}>
                    ForgeRealm Workshop
                  </div>
                  <div className={`pointer-events-none absolute bottom-5 right-5 text-[9px] uppercase tracking-[0.3em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                    ForgeRealm Lab
                  </div>
                  <div className="flex items-center justify-center">
                    <Lottie animationData={printAnimation} loop className="h-80 w-80 sm:h-[22rem] sm:w-[22rem]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="hidden lg:flex gap-3 mt-10">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 border-2 backdrop-blur-sm ${isLight ? "bg-white/95 border-emerald-300/60 hover:border-emerald-400 hover:bg-emerald-50/80 shadow-[0_4px_16px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.25)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
              {ecoAnimation ? (
                <Lottie animationData={ecoAnimation} loop className="h-7 w-7" />
              ) : (
                <RiLeafFill className="text-green-400 text-xl" />
              )}
              <span className={`text-base font-semibold ${isLight ? "text-slate-800" : "text-gray-300"}`}>Eco-Friendly</span>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 border-2 backdrop-blur-sm ${isLight ? "bg-white/95 border-pink-300/60 hover:border-pink-400 hover:bg-pink-50/80 shadow-[0_4px_16px_rgba(236,72,153,0.15)] hover:shadow-[0_8px_32px_rgba(236,72,153,0.25)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
              {paintAnimation ? (
                <Lottie animationData={paintAnimation} loop className="h-7 w-7" />
              ) : (
                <MdBrush className="text-pink-400 text-xl" />
              )}
              <span className={`text-base font-semibold ${isLight ? "text-slate-800" : "text-gray-300"}`}>Paint Ready</span>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 border-2 backdrop-blur-sm ${isLight ? "bg-white/95 border-indigo-300/60 hover:border-indigo-400 hover:bg-indigo-50/80 shadow-[0_4px_16px_rgba(99,102,241,0.15)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.25)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
              {fantasyAnimation ? (
                <Lottie animationData={fantasyAnimation} loop className="h-7 w-7" />
              ) : (
                <GiDragonHead className="text-indigo-400 text-xl" />
              )}
              <span className={`text-base font-semibold ${isLight ? "text-slate-800" : "text-gray-300"}`}>Fantasy Figurines</span>
            </div>
          </div>

          <div className="mt-8 hidden lg:grid gap-6 transition-all duration-700 ease-out translate-x-0 opacity-100">
            <div className={`rounded-3xl border-2 backdrop-blur-sm ${isLight ? "border-slate-200/60 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:scale-[1.02]" : "border-white/10 bg-white/5"} p-8 transition-all duration-300`}>
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl ${isLight ? "bg-gradient-to-br from-amber-100 to-orange-200 shadow-[0_4px_16px_rgba(251,191,36,0.2)]" : "bg-blue-500/20"}`}>
                  <HiOutlineLightBulb className="text-blue-500 text-5xl" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-3 ${isLight ? "text-slate-900 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-white"}`}>
                    Designed for Creativity
                  </h3>
                  <p className={`leading-relaxed max-w-sm text-base ${isLight ? "text-slate-700" : "text-gray-400"}`}>
                    A solid base for your ideas, built to be clean, minimal, and ready for customization.
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border-2 backdrop-blur-sm ${isLight ? "border-slate-200/60 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:scale-[1.02]" : "border-white/10 bg-white/5"} p-8 transition-all duration-300`}>
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl ${isLight ? "bg-gradient-to-br from-pink-100 to-purple-200 shadow-[0_4px_16px_rgba(236,72,153,0.2)]" : "bg-blue-400/20"}`}>
                  <FiStar className="text-blue-500 text-4xl" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-3 ${isLight ? "text-slate-900 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-white"}`}>
                    Built to Inspire
                  </h3>
                  <p className={`leading-relaxed max-w-sm text-base ${isLight ? "text-slate-700" : "text-gray-400"}`}>
                    From bold figurines to fine details, every piece is designed to spark imagination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center justify-center">
          {printAnimation && (
            <div className={`relative overflow-hidden rounded-[2.75rem] p-[1px] ${isLight ? "shadow-[0_50px_140px_rgba(251,191,36,0.4)]" : "shadow-[0_50px_140px_rgba(78,71,229,0.4)]"}`}>
              <span className={`absolute inset-[-1000%] animate-[spin_2s_linear_infinite] ${isLight ? "bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#f59e0b_50%,#ffffff_100%)]" : "bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#4e47e5_50%,#ffffff_100%)]"}`} />
              <div className={`relative rounded-[2.75rem] ${isLight ? "bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500" : "bg-[#4e47e5]"} p-7`}>
                <div className={`pointer-events-none absolute inset-0 rounded-[2.75rem] ${isLight ? "bg-gradient-to-br from-white/40 via-amber-100/20 to-white/10" : "bg-gradient-to-br from-white/35 via-transparent to-white/5"}`} />
                <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full ${isLight ? "bg-amber-200/20" : "bg-white/15"} blur-2xl`} />
                <div className={`pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full ${isLight ? "bg-pink-300/25" : "bg-indigo-300/25"} blur-3xl`} />
                <div className={`pointer-events-none absolute left-8 top-16 h-2 w-28 rounded-full ${isLight ? "bg-amber-200/40" : "bg-white/35"}`} />
                <div className={`pointer-events-none absolute left-8 top-20 h-1 w-20 rounded-full ${isLight ? "bg-orange-200/30" : "bg-white/25"}`} />
                <div className={`pointer-events-none absolute right-10 top-16 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                  <span className={`h-2 w-2 rounded-full ${isLight ? "bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]" : "bg-emerald-300/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]"}`} />
                  Live
                </div>
                <div className={`pointer-events-none absolute bottom-6 left-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                  <span className={`h-2 w-2 rounded-full ${isLight ? "bg-amber-300/70" : "bg-white/70"}`} />
                  Production View
                </div>
                <div className={`pointer-events-none absolute right-8 top-28 grid gap-2 text-[10px] uppercase tracking-[0.25em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                  <span className={`rounded-full border ${isLight ? "border-amber-300/40 bg-amber-50/20" : "border-white/30 bg-white/10"} px-3 py-1`}>Engineered Accuracy</span>
                  <span className={`rounded-full border ${isLight ? "border-amber-300/40 bg-amber-50/20" : "border-white/30 bg-white/10"} px-3 py-1`}>Polished Detail</span>
                </div>
                <div className={`pointer-events-none absolute bottom-16 right-10 rounded-full border ${isLight ? "border-amber-300/40 bg-amber-50/20" : "border-white/30 bg-white/10"} px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                  Showcase Ready
                </div>
                <div className={`pointer-events-none absolute inset-x-8 bottom-4 h-px ${isLight ? "bg-amber-200/20" : "bg-white/15"}`} />
                <div className={`pointer-events-none absolute left-6 top-6 rounded-full border ${isLight ? "border-amber-300/60 bg-amber-50/30" : "border-white/50 bg-white/10"} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${isLight ? "text-amber-900/80" : "text-white/80"}`}>
                  ForgeRealm Workshop
                </div>
                <div className={`pointer-events-none absolute bottom-6 right-6 text-[10px] uppercase tracking-[0.3em] ${isLight ? "text-amber-800/70" : "text-white/70"}`}>
                  ForgeRealm Lab
                </div>
                <div className="flex items-center justify-center">
                  <Lottie animationData={printAnimation} loop className="h-[34rem] w-[34rem] xl:h-[40rem] xl:w-[40rem]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase hidden sm:block ${isLight ? "text-slate-800" : "text-white/70"}`}>
        <a href="#services" className={`flex items-center gap-2 transition-colors ${isLight ? "hover:text-slate-600" : "hover:text-white"}`}>
          <span>Scroll</span>
          <span className="inline-block animate-bounce">▾</span>
        </a>
      </div>
    </section>
  );
}
