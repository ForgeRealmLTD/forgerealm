"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function Hero() {
  const [printAnim, setPrintAnim] = useState<any>(null);

  useEffect(() => {
    fetch("/print.json")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setPrintAnim(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #080c14 0%, #0c1222 40%, #0e1428 70%, #080c14 100%)' }}>
      {/* Multi-colour ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[15%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.1] blur-[200px]" />
        <div className="absolute right-[-5%] top-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.08] blur-[180px]" />
        <div className="absolute right-[20%] bottom-[10%] w-[350px] h-[350px] rounded-full bg-cyan-500/[0.07] blur-[160px]" />
        <div className="absolute left-[30%] bottom-[5%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.05] blur-[150px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Mobile: Lottie at top, then content */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          {printAnim ? (
            <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(to top, #F59E0B 0%, #F5B731 40%, #FADE6A 100%)' }}>
              <div className="absolute inset-0" />
              <Lottie animationData={printAnim} loop className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] -mt-[40px] -ml-[40px] sm:-mt-[50px] sm:-ml-[50px]" />
            </div>
          ) : (
            <img src="/frlogorv.png" alt="ForgeRealm" className="w-24 h-24 opacity-40" />
          )}
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            {/* Mobile brand name */}
            <div className="lg:hidden mb-4 text-center">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>ForgeRealm</span>
            </div>

            {/* Emblem + eyebrow */}
            <div className="mb-6 flex items-center gap-4 justify-center lg:justify-start">
              <img src="/frlogorv.png" alt="ForgeRealm Emblem" className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-500 cursor-pointer" />
              <div>
                <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-blue-300/70 block" style={{ fontFamily: "'Jost', sans-serif" }}>
                  3D Printed in Leeds
                </span>
                <div className="w-16 h-px bg-gradient-to-r from-blue-400 to-purple-400 mt-1" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[5rem] font-bold leading-[0.9] text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              Crafted with
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '1.1em' }}>
                Imagination
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 max-w-lg text-stone-400 leading-relaxed mx-auto lg:mx-0 text-[13px] sm:text-base lg:text-lg" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
              From articulated dragons to ambient lamps, every piece is designed, printed, and hand-finished in our Leeds workshop. Eco-friendly PLA, no compromise on detail.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <a
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white border border-white/30 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Enter the Shop
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.05] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition-all hover:border-white/50 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                See Our Work
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap gap-8 justify-center lg:justify-start">
              {[
                { value: '238+', label: 'Prints Sold' },
                { value: '30+', label: 'Designs' },
                { value: '100%', label: 'Eco PLA' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>{s.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mt-0.5" style={{ fontFamily: "'Jost', sans-serif" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Lottie in glass card (desktop only) */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute -inset-12 rounded-full border border-blue-500/[0.05]" />
              <div className="absolute -inset-20 rounded-full border border-purple-500/[0.03]" />

              {/* Colour glow behind */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/15 via-purple-500/8 to-cyan-500/12 blur-3xl scale-110" />

              {/* Lottie card container */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-300/30" style={{ background: 'linear-gradient(to top, #F59E0B 0%, #F5B731 40%, #FADE6A 100%)' }}>
                <div className="relative aspect-[4/5] flex items-center justify-center overflow-hidden">
                  {printAnim ? (
                    <Lottie animationData={printAnim} loop className="h-[120%] w-[120%]" />
                  ) : (
                    <img src="/frlogorv.png" alt="ForgeRealm" width={180} height={180} className="opacity-40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>

                {/* Card footer */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-px bg-black/30" />
                        <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-black/50" style={{ fontFamily: "'Jost', sans-serif" }}>ForgeRealm</span>
                      </div>
                      <p className="text-[13px] text-black/70" style={{ fontFamily: "'Inter', sans-serif" }}>Every piece, a story</p>
                    </div>
                    <img src="/headfrlogorv.png" alt="" className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emblem divider */}
        <div className="flex items-center justify-center gap-4 mt-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
          <img src="/frlogorv.png" alt="" className="h-8 w-8 opacity-15" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
        </div>
      </div>
    </section>
  );
}
