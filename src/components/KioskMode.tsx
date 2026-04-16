"use client";

import { useEffect, useState } from "react";
import { products } from "../data/products";

const envBase =
  typeof import.meta !== "undefined" && import.meta.env && typeof import.meta.env.PUBLIC_API_URL === "string"
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, "")
    : "";
const envLocal =
  typeof import.meta !== "undefined" && import.meta.env && typeof import.meta.env.PUBLIC_API_URL_LOCAL === "string"
    ? import.meta.env.PUBLIC_API_URL_LOCAL.trim().replace(/\/$/, "")
    : "";
const API_BASE =
  typeof window !== "undefined" && window.location.origin.startsWith("http://localhost")
    ? envLocal || ""
    : envBase || "";

export default function KioskMode() {
  const [auth, setAuth] = useState<"loading" | "denied" | "granted">("loading");
  const [active, setActive] = useState(false);

  // Check admin auth
  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem("forgerealm_admin_token");
        if (!token) { setAuth("denied"); return; }
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setAuth("denied"); return; }
        const data = await res.json();
        if (data?.user?.role === "admin") setAuth("granted");
        else setAuth("denied");
      } catch { setAuth("denied"); }
    };
    check();
  }, []);

  // Hide cursor and prevent sleep in kiosk mode
  useEffect(() => {
    if (!active) return;
    document.body.style.cursor = "none";
    // Try to keep screen awake
    let wakeLock: any = null;
    (async () => {
      try {
        wakeLock = await (navigator as any).wakeLock?.request("screen");
      } catch {}
    })();
    return () => {
      document.body.style.cursor = "";
      wakeLock?.release?.();
    };
  }, [active]);

  // Fullscreen toggle
  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.();
    setActive(true);
  };

  const exitKiosk = () => {
    document.exitFullscreen?.();
    setActive(false);
  };

  // Filter out banner-only products
  const displayProducts = products.filter((p) => !p.bannerOnly && p.stock !== 0);

  if (auth === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (auth === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Cinzel', serif" }}>Admin Required</h1>
          <p className="text-stone-400 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Kiosk mode is only available to admin users.</p>
          <a href="/shop/sign-in" className="rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 px-6 py-3 text-sm font-semibold text-black" style={{ fontFamily: "'Cinzel', serif" }}>
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white px-4">
        <div className="text-center max-w-md">
          <img src="/frlogorv.png" alt="ForgeRealm" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>Kiosk Mode</h1>
          <p className="text-stone-400 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            Display your products and prices on a tablet at your stall. Goes fullscreen with no navigation.
          </p>
          <button
            onClick={goFullscreen}
            className="rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 px-10 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Activate Kiosk
          </button>
          <p className="mt-4 text-xs text-stone-600">Tap anywhere 3 times quickly to exit</p>
        </div>
      </div>
    );
  }

  // ── KIOSK DISPLAY ──
  return <KioskDisplay products={displayProducts} onExit={exitKiosk} />;
}

function KioskDisplay({ products: items, onExit }: { products: typeof products; onExit: () => void }) {
  const [tapCount, setTapCount] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);

  // Triple-tap to exit
  useEffect(() => {
    if (tapCount >= 3) onExit();
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 800);
      return () => clearTimeout(timer);
    }
  }, [tapCount, onExit]);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPos((prev) => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#0a0a0a] overflow-hidden select-none"
      onClick={() => setTapCount((c) => c + 1)}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-10%] top-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.06] blur-[200px]" />
        <div className="absolute right-[-5%] bottom-[10%] w-[400px] h-[400px] rounded-full bg-amber-500/[0.04] blur-[180px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <img src="/frlogorv.png" alt="" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>ForgeRealm</h1>
            <p className="text-[11px] uppercase tracking-[0.3em] text-blue-300/50" style={{ fontFamily: "'Jost', sans-serif" }}>Leeds Artisan 3D Printing</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500" style={{ fontFamily: "'Jost', sans-serif" }}>Free delivery in Leeds</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/60 mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>Eco-friendly PLA</p>
        </div>
      </div>

      {/* Scrolling product grid */}
      <div className="relative z-10 px-6 py-6 h-[calc(100vh-100px)] overflow-hidden">
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-transform duration-100"
          style={{ transform: `translateY(-${scrollPos % (items.length * 60)}px)` }}
        >
          {/* Double the items for seamless scroll */}
          {[...items, ...items].map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-square bg-white">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                {/* Stock badge */}
                {product.stock !== null && product.stock <= 3 && product.stock > 0 && (
                  <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-amber-400 backdrop-blur-sm">
                    {product.stock} left
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 text-center">
                <h3 className="text-[13px] font-normal text-white truncate" style={{ fontFamily: "'Cinzel', serif" }}>
                  {product.name}
                </h3>
                <p className="text-[22px] font-bold mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#FADE6A' }}>
                  {product.displayPrice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pt-8 pb-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {['🌱 Plant-based PLA', '🏠 Made in Leeds', '♻️ Eco-friendly'].map((t) => (
              <span key={t} className="text-[11px] text-stone-500" style={{ fontFamily: "'Inter', sans-serif" }}>{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600" style={{ fontFamily: "'Jost', sans-serif" }}>forgerealm.co.uk</span>
            <img src="/headfrlogorv.png" alt="" className="h-5 w-5 rounded-full opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
