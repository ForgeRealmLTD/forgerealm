"use client";

import { useEffect, useState } from "react";
import { HiOutlineMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    ["Services", "#services"],
    ["Work", "#work"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
    ["Booths", "/subscribe"],
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`flex items-center justify-between transition-all duration-500 rounded-2xl border ${scrolled ? 'py-2 px-4 bg-[#080c16]/95 backdrop-blur-2xl border-white/[0.06] shadow-xl shadow-black/30' : 'py-3 border-transparent'}`}>

          {/* Left: Logo + brand in a pill */}
          <a href="/" className="inline-flex items-center gap-3 group">
            <div className={`relative rounded-full p-1.5 transition-all duration-500 border ${scrolled ? 'bg-black/60 backdrop-blur-xl border-white/10' : 'border-transparent'}`}>
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-blue-400/0 group-hover:bg-blue-400/20 blur-xl transition-all duration-500" />
                <img src="/headfrlogorv.png" alt="ForgeRealm" width={36} height={36} className="relative h-9 w-9 rounded-full transition-transform duration-300 group-hover:rotate-12 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]" loading="eager" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-[15px] font-semibold text-white block leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                ForgeRealm
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-blue-300/50" style={{ fontFamily: "'Jost', sans-serif" }}>Leeds, UK</span>
            </div>
          </a>

          {/* Centre: Nav links in a floating glass bar */}
          <nav className={`hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500 ${scrolled ? 'bg-black/50 backdrop-blur-xl border border-white/[0.08]' : 'bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]'}`}>
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="px-4 py-2 rounded-full text-[10px] font-medium uppercase tracking-[0.18em] text-stone-400 transition-all duration-300 hover:text-white hover:bg-white/[0.08]"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/shop"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
              style={{ fontFamily: "'Cinzel', serif", background: 'linear-gradient(to top, #F59E0B, #FADE6A)' }}
            >
              Shop
            </a>
            <a
              href="/shop/sign-in"
              className={`hidden sm:inline-flex items-center rounded-full px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 transition-all hover:text-white border border-white/20 hover:border-white/40 ${scrolled ? 'bg-black/40 backdrop-blur-xl' : 'bg-white/[0.04]'}`}
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Sign In
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(true)}
              className={`md:hidden rounded-full p-2.5 transition-all ${scrolled ? 'bg-black/50 backdrop-blur-xl border border-white/10' : 'bg-white/[0.06] border border-white/[0.08]'}`}
              aria-label="Open menu"
            >
              <HiOutlineMenu className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer - full screen takeover */}
      <div
        className={`fixed inset-0 z-50 flex flex-col transform transition-all duration-500 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(180deg, #080c16 0%, #0c1222 50%, #080c16 100%)' }}
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <img src="/headfrlogorv.png" alt="" className="h-8 w-8 rounded-full" />
            <span className="text-[13px] font-semibold text-white" style={{ fontFamily: "'Cinzel', serif" }}>ForgeRealm</span>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full bg-white/[0.06] border border-white/10 p-2.5 text-white/60 hover:text-white transition" aria-label="Close menu">
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links - large, centred */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-8">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="w-full text-center rounded-xl px-6 py-4 text-[18px] text-stone-300 transition hover:bg-blue-500/[0.08] hover:text-white"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-6 space-y-3">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent mb-4" />
          <a
            href="/shop"
            onClick={() => setOpen(false)}
            className="block w-full rounded-full py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-black shadow-lg shadow-amber-500/20"
            style={{ fontFamily: "'Cinzel', serif", background: 'linear-gradient(to top, #F59E0B, #FADE6A)' }}
          >
            Enter the Shop
          </a>
          <a
            href="/shop/sign-in"
            onClick={() => setOpen(false)}
            className="block w-full rounded-full border border-white/20 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/40 hover:text-white"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Sign In
          </a>
        </div>
      </div>
    </header>
  );
}
