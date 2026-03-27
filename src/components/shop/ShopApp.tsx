import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, CATEGORIES, CATEGORY_STYLES, type Product, type Category } from '../../data/products';

/* ═══════════════════════════ Cart Context ═══════════════════════════ */

interface CartItem { product: Product; qty: number }
interface CartCtx {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);
const useCart = () => useContext(CartContext)!;

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { const s = localStorage.getItem('fr_cart'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('fr_cart', JSON.stringify(items)); }, [items]);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.product.id === p.id);
      if (ex) return prev.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { product: p, qty: 1 }];
    });
  }, []);
  const remove = useCallback((id: string) => setItems((p) => p.filter((i) => i.product.id !== id)), []);
  const update = useCallback((id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((p) => p.map((i) => (i.product.id === id ? { ...i, qty } : i)));
  }, [remove]);
  const clear = useCallback(() => setItems([]), []);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>{children}</CartContext.Provider>;
}

/* ═══════════════════════════ CSS Injection ═══════════════════════════ */

const CUSTOM_CSS = `
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
@keyframes glow-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
@keyframes gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes border-dance { 0% { border-color: rgba(59,130,246,0.3); } 33% { border-color: rgba(6,182,212,0.3); } 66% { border-color: rgba(16,185,129,0.3); } 100% { border-color: rgba(59,130,246,0.3); } }
.shimmer-bg { background: linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.08) 50%, transparent 67%); background-size: 200% 100%; animation: shimmer 3s infinite; }
.float-slow { animation: float 6s ease-in-out infinite; }
.float-slower { animation: float 8s ease-in-out infinite; animation-delay: 1s; }
.glow-breathe { animation: glow-pulse 4s ease-in-out infinite; }
.gradient-text-flow { background-size: 200% auto; animation: gradient-flow 4s ease infinite; }
.border-dance { animation: border-dance 4s ease infinite; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.card-shine { position: relative; overflow: hidden; }
.card-shine::after { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%); transform: translateX(-100%); transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); pointer-events: none; }
.card-shine:hover::after { transform: translateX(100%); }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.marquee-track { display: flex; width: max-content; animation: marquee 30s linear infinite; }
.marquee-track:hover { animation-play-state: paused; }
@keyframes tilt-glow { 0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.0); } 50% { box-shadow: 0 0 30px rgba(59,130,246,0.15); } }
.card-tilt { transition: transform 0.4s cubic-bezier(0.03,0.98,0.52,0.99); perspective: 800px; }
.card-tilt:hover { transform: translateY(-8px) rotateX(2deg) rotateY(-1deg) scale(1.02); }
@keyframes count-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.count-reveal { animation: count-up 0.6s ease-out forwards; }
@keyframes noise-scroll { 0% { transform: translate(0,0); } 10% { transform: translate(-5%,-5%); } 20% { transform: translate(-10%,5%); } 30% { transform: translate(5%,-10%); } 40% { transform: translate(-5%,15%); } 50% { transform: translate(-10%,5%); } 60% { transform: translate(15%,0); } 70% { transform: translate(0,10%); } 80% { transform: translate(-15%,0); } 90% { transform: translate(10%,5%); } 100% { transform: translate(5%,0); } }
.noise-overlay { position: fixed; inset: -50%; z-index: 9999; pointer-events: none; opacity: 0.015; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); animation: noise-scroll 8s steps(10) infinite; }
@keyframes border-glow-rotate { 0% { --angle: 0deg; } 100% { --angle: 360deg; } }
.glow-border { position: relative; }
.glow-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: conic-gradient(from var(--angle, 0deg), transparent 60%, rgba(59,130,246,0.4) 75%, rgba(6,182,212,0.4) 85%, transparent 95%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.5s ease; pointer-events: none; animation: border-glow-rotate 4s linear infinite; }
.glow-border:hover::before { opacity: 1; }
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById('fr-shop-css')) return;
    const el = document.createElement('style');
    el.id = 'fr-shop-css';
    el.textContent = CUSTOM_CSS;
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);
  return null;
}

/* ═══════════════════════════ Hooks ═══════════════════════════ */

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

/* ═══════════════════════════ Marquee Banner ═══════════════════════════ */

function MarqueeBanner() {
  const items = [
    { icon: '🌱', text: 'Plant-based PLA' },
    { icon: '🇬🇧', text: 'Made in Leeds' },
    { icon: '📦', text: 'Plastic-free packaging' },
    { icon: '✋', text: 'Hand-finished' },
    { icon: '🚚', text: 'Free UK shipping £15+' },
    { icon: '♻️', text: 'Biodegradable materials' },
    { icon: '⭐', text: '183+ prints sold' },
    { icon: '🎨', text: 'Custom orders welcome' },
  ];

  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-gradient-to-r from-blue-950/30 via-[#0a0f1a] to-blue-950/30 py-3">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap sm:mx-8">
            <span className="text-base">{item.icon}</span>
            {item.text}
            <span className="ml-6 text-slate-700 sm:ml-8">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ Header ═══════════════════════════ */

function ShopHeader({ onCartOpen, onSearch }: { onCartOpen: () => void; onSearch: (q: string) => void }) {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-white/10 bg-[#0a0f1a]/90 backdrop-blur-2xl shadow-2xl shadow-black/20' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/50 to-cyan-400/50 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <img src="/headfrlogorv.png" alt="ForgeRealm" width={36} height={36} className="relative h-9 w-9 rounded-full ring-1 ring-white/20 transition-all duration-300 group-hover:ring-blue-400/50" loading="eager" />
          </div>
          <span className="font-extrabold tracking-[0.15em] text-sm uppercase text-white">
            Forge<span className="text-blue-300">Realm</span>
          </span>
        </a>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-400/20 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search prints..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/40 focus:bg-white/[0.08]"
              />
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="/" className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-white">Home</a>
          <a href="#products" className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-white">Shop</a>
          <div className="ml-2 h-5 w-px bg-white/10" />
          <button
            onClick={onCartOpen}
            className="group relative ml-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-blue-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Basket
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2 -top-2 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-[11px] font-bold text-white shadow-lg shadow-blue-500/30"
                  style={{ width: 22, height: 22 }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={onCartOpen} className="relative rounded-full bg-white/5 p-2.5 text-white transition hover:bg-white/10">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">{count}</span>}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full bg-white/5 p-2.5 text-white transition hover:bg-white/10">
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5 md:hidden">
            <div className="space-y-3 px-4 py-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search prints..." value={query} onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }} className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none" />
              </div>
              <a href="/" className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">Home</a>
              <a href="#products" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">Shop</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ═══════════════════════════ Hero ═══════════════════════════ */

function HeroBanner() {
  const counter = useCountUp(183, 2200);
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* Animated ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/25 blur-[200px] glow-breathe" />
        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[180px] glow-breathe" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[160px] glow-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[140px] glow-breathe" style={{ animationDelay: '3s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/20 blur-sm float-slow"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              left: `${15 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:py-32">
          {/* Left text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-blue-300 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Shop now open - Leeds, UK
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Eco 3D prints,{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent gradient-text-flow">
                crafted by hand.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
              Plant-based PLA, hand-finished detail, and plastic-free packaging. From articulated dragons to ambient lamps, every piece is made in Leeds with care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#products"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Browse all prints</span>
                <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/25 hover:bg-white/10"
              >
                Custom order
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['Eco-friendly PLA', 'Free UK shipping £15+', 'Handmade in Leeds'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500/80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right - featured logo showcase */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
            <div className="relative mx-auto w-[420px]">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 blur-3xl" />
              <div className="absolute -inset-4 rounded-[2rem] border border-white/[0.06]" />
              <div className="absolute -inset-8 rounded-[2.5rem] border border-white/[0.03]" />

              {/* Main card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl">
                <div className="absolute inset-0 shimmer-bg" />

                <div className="relative flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-400/30 blur-2xl glow-breathe" />
                    <img src="/frlogorv.png" alt="ForgeRealm" width={140} height={140} className="relative rounded-2xl float-slow" />
                  </div>
                  <div className="text-center" ref={counter.ref}>
                    <p className="text-5xl font-extrabold text-white tabular-nums">{counter.count}<span className="text-2xl text-blue-400">+</span></p>
                    <p className="mt-1 text-xs tracking-[0.2em] uppercase text-slate-400">Eco prints sold</p>
                  </div>

                  {/* Mini stats */}
                  <div className="grid w-full grid-cols-3 gap-3">
                    {[
                      { n: products.length.toString(), l: 'Designs' },
                      { n: new Set(products.map(p => p.category)).size.toString(), l: 'Collections' },
                      { n: '100%', l: 'Eco PLA' },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-center">
                        <p className="text-lg font-bold text-white">{s.n}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
    </section>
  );
}

/* ═══════════════════════════ Featured Row ═══════════════════════════ */

const SHOWCASE_ITEMS = [
  { name: 'Aurora Bloom', price: '£14.99', category: '3D Printed Lamp', badge: 'Warm glow', image: '/ablamp-nbg.webp', description: 'Gradient lamp shade with a soft spiral that diffuses light into a warm glow.' },
  { name: 'Leeds Owl', price: '£5.99', category: 'Display Model', badge: 'Leeds made', image: '/owl-nbg.webp', description: 'Leeds-inspired owl with a warm gradient from amber to blush.' },
  { name: 'Forest Dragon', price: '£4.99', category: 'Display Model', badge: 'Layered scales', image: '/dragon-nbg.webp', description: 'Articulated dragon with layered scales and a balanced pose.' },
  { name: 'Dice Guardian', price: '£5.99', category: 'Fidget Toy', badge: 'Tabletop ready', image: '/dice-dragon-nbg.webp', description: 'Dragon head designed to cradle a full set of D&D dice.' },
];

function FeaturedRow({ onQuickView }: { onQuickView: (p: Product) => void }) {
  return (
    <section className="relative border-b border-white/5 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400/80">Highlights</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Featured prints</h2>
          </div>
          <a href="#products" className="text-sm text-slate-400 transition hover:text-white">View all &rarr;</a>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {SHOWCASE_ITEMS.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ y: -6 }}
              className="card-shine glow-border card-tilt group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:shadow-2xl hover:shadow-blue-500/15"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-900">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {item.badge}
                </div>
              </div>
              <div className="p-3">
                <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">{item.category}</p>
                <div className="mt-0.5 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white sm:text-sm">{item.name}</h3>
                  <span className="text-xs font-bold text-white sm:text-sm">{item.price}</span>
                  </div>
                </div>
              </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ Category Filter ═══════════════════════════ */

function CategoryFilter({ active, onChange }: { active: Category; onChange: (c: Category) => void }) {
  return (
    <div className="flex gap-2 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        const style = cat !== 'All' ? CATEGORY_STYLES[cat] : null;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20'
                : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {style && <span className="text-xs">{style.icon}</span>}
            {cat}
            {isActive && cat !== 'All' && (
              <span className="ml-0.5 text-[10px] opacity-70">
                ({products.filter(p => p.category === cat).length})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════ Product Card ═══════════════════════════ */

function ProductCard({ product, onQuickView, index }: { product: Product; onQuickView: (p: Product) => void; index: number }) {
  const { add } = useCart();
  const style = CATEGORY_STYLES[product.category] || CATEGORY_STYLES['Other'];
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.badge === 'Coming Soon' || product.stock === 0) return;
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const isComingSoon = product.badge === 'Coming Soon';
  const isSoldOut = product.stock === 0;
  const isLow = product.stock !== null && product.stock <= 3 && product.stock > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      onClick={() => onQuickView(product)}
      className="card-shine glow-border card-tilt group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Image */}
      <div className={`relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br ${style.gradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.15),transparent_50%)]" />
        {/* Background large emoji for depth */}
        <div className="absolute -right-4 -top-4 text-[120px] opacity-[0.07] select-none blur-[1px]">{style.icon}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-30 transition-all duration-700 group-hover:scale-125 group-hover:opacity-50 group-hover:rotate-12 select-none drop-shadow-lg">
            {style.icon}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge */}
        {product.badge && (
          <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
            product.badge === 'Coming Soon' ? 'bg-slate-900/80 text-slate-400 border border-white/10' :
            product.badge === 'Popular' ? 'bg-blue-500/90 text-white' :
            product.badge === 'Best Seller' ? 'bg-emerald-500/90 text-white' :
            product.badge === 'Limited' ? 'bg-amber-500/90 text-white' :
            product.badge === 'Premium' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
            product.badge === 'Low Stock' ? 'bg-red-500/90 text-white' :
            'bg-white/20 text-white'
          }`}>
            {product.badge}
          </div>
        )}

        {/* Stock */}
        {product.stock !== null && !isComingSoon && (
          <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm ${isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-400/20' : 'bg-black/40 text-slate-300'}`}>
            {isSoldOut ? 'Sold out' : `${product.stock} left`}
          </div>
        )}

        {/* Add overlay */}
        {!isComingSoon && !isSoldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAdd}
              className={`w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider shadow-xl transition-all ${
                added
                  ? 'bg-emerald-500 text-white scale-95'
                  : 'bg-white/95 text-slate-900 hover:bg-white backdrop-blur'
              }`}
            >
              {added ? '✓ Added!' : 'Add to Basket'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{product.category}</p>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">{product.name}</h3>
          </div>
          <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-sm font-bold text-white">{product.displayPrice}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-500">{product.description}</p>
        {isLow && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" /></span>
            <p className="text-[11px] font-medium text-amber-400/90">Only {product.stock} left</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════ Product Grid ═══════════════════════════ */

/* ═══════════════════════════ Filter Types ═══════════════════════════ */

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-az' | 'name-za';

interface Filters {
  priceRange: [number, number];
  inStock: boolean;
  sort: SortOption;
  badges: string[];
}

const MIN_PRICE = 0;
const MAX_PRICE = 2000; // pence = £20

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A–Z' },
  { value: 'name-za', label: 'Name: Z–A' },
];

const BADGE_OPTIONS = ['Popular', 'Best Seller', 'Limited', 'Premium', 'Low Stock', 'Coming Soon'];

/* ═══════════════════════════ Price Range Slider ═══════════════════════════ */

function PriceRangeSlider({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const pct = (v: number) => ((v - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const fromPct = (p: number) => Math.round(MIN_PRICE + (p / 100) * (MAX_PRICE - MIN_PRICE));

  const getPos = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const p = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    return fromPct(p);
  };

  const snap = (v: number) => Math.round(v / 50) * 50; // snap to 50p increments

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    const raw = 'touches' in e ? getPos(e) : getPos(e);
    const snapped = snap(raw);
    if (dragging === 'min') onChange([Math.min(snapped, value[1] - 50), value[1]]);
    else onChange([value[0], Math.max(snapped, value[0] + 50)]);
  }, [dragging, value, onChange]);

  const handleUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent | TouchEvent) => handleMove(e);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, handleMove, handleUp]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">£{(value[0] / 100).toFixed(2)}</span>
        <span className="text-slate-500">-</span>
        <span className="font-semibold text-white">£{(value[1] / 100).toFixed(2)}</span>
      </div>
      <div ref={trackRef} className="relative h-6 flex items-center cursor-pointer select-none" onMouseDown={(e) => {
        const v = snap(getPos(e));
        const distMin = Math.abs(v - value[0]);
        const distMax = Math.abs(v - value[1]);
        setDragging(distMin <= distMax ? 'min' : 'max');
      }} onTouchStart={(e) => {
        const v = snap(getPos(e));
        const distMin = Math.abs(v - value[0]);
        const distMax = Math.abs(v - value[1]);
        setDragging(distMin <= distMax ? 'min' : 'max');
      }}>
        {/* Track bg */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/10" />
        {/* Active range */}
        <div
          className="absolute h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        {/* Min thumb */}
        <div
          className={`absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-blue-400 bg-[#0c1220] shadow-lg shadow-blue-500/20 transition-transform ${dragging === 'min' ? 'scale-125 border-cyan-400' : 'hover:scale-110'}`}
          style={{ left: `${pct(value[0])}%` }}
        />
        {/* Max thumb */}
        <div
          className={`absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-blue-400 bg-[#0c1220] shadow-lg shadow-blue-500/20 transition-transform ${dragging === 'max' ? 'scale-125 border-cyan-400' : 'hover:scale-110'}`}
          style={{ left: `${pct(value[1])}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════ Filter Sidebar ═══════════════════════════ */

function FilterSidebar({ filters, onChange, total, onMobileClose, mobileOpen }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
  onMobileClose: () => void;
  mobileOpen: boolean;
}) {
  const content = (
    <div className="space-y-7">
      {/* Price range */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Price Range</h3>
        <PriceRangeSlider value={filters.priceRange} onChange={(v) => onChange({ ...filters, priceRange: v })} />
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Sort By</h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, sort: opt.value })}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                filters.sort === opt.value
                  ? 'bg-blue-500/15 text-blue-300 font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Availability</h3>
        <button
          onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
          className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm transition hover:bg-white/[0.06]"
        >
          <span className={filters.inStock ? 'text-white' : 'text-slate-400'}>In stock only</span>
          <div className={`flex h-5 w-9 items-center rounded-full transition-colors ${filters.inStock ? 'bg-blue-500' : 'bg-white/10'}`}>
            <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Badges */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {BADGE_OPTIONS.map((badge) => {
            const active = filters.badges.includes(badge);
            return (
              <button
                key={badge}
                onClick={() => {
                  const next = active ? filters.badges.filter((b) => b !== badge) : [...filters.badges, badge];
                  onChange({ ...filters, badges: next });
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'border border-white/[0.08] text-slate-500 hover:border-white/15 hover:text-slate-300'
                }`}
              >
                {badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({ priceRange: [MIN_PRICE, MAX_PRICE], inStock: false, sort: 'default', badges: [] })}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
      >
        Reset all filters
      </button>

      <p className="text-center text-xs text-slate-600">{total} product{total !== 1 ? 's' : ''} found</p>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-[110px] rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm">
          <h2 className="mb-5 text-sm font-bold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </h2>
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden" />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 top-0 z-[80] w-full max-w-xs border-r border-white/10 bg-[#0a0f1a]/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Filters
                </h2>
                <button onClick={onMobileClose} className="rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="overflow-y-auto p-5 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 65px)' }}>
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════ Product Grid ═══════════════════════════ */

function ProductGrid({ category, search, filters, onQuickView, onFilterMobileOpen }: {
  category: Category;
  search: string;
  filters: Filters;
  onQuickView: (p: Product) => void;
  onFilterMobileOpen: () => void;
}) {
  const filtered = products.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    if (filters.inStock && (p.stock === 0 || p.badge === 'Coming Soon')) return false;
    if (filters.badges.length > 0 && (!p.badge || !filters.badges.includes(p.badge))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'name-az': return a.name.localeCompare(b.name);
      case 'name-za': return b.name.localeCompare(a.name);
      default:
        if (a.badge === 'Coming Soon' && b.badge !== 'Coming Soon') return 1;
        if (b.badge === 'Coming Soon' && a.badge !== 'Coming Soon') return -1;
        return 0;
    }
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400/80">Collection</p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            {category === 'All' ? 'All Prints' : category}
            <span className="ml-2 text-base font-normal text-slate-500">({sorted.length})</span>
          </h2>
        </div>
        {/* Mobile filter button */}
        <button
          onClick={onFilterMobileOpen}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-24 text-center">
          <span className="text-6xl">🔍</span>
          <p className="mt-5 text-lg font-semibold text-slate-300">No prints found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-5 grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((p, i) => (
              <ProductCard key={p.id} product={p} onQuickView={onQuickView} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Product Modal ═══════════════════════════ */

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!product) return null;
  const style = CATEGORY_STYLES[product.category] || CATEGORY_STYLES['Other'];
  const isComingSoon = product.badge === 'Coming Soon';
  const isSoldOut = product.stock === 0;

  const handleAdd = () => {
    if (isComingSoon || isSoldOut) return;
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c1220] shadow-2xl shadow-black/50"
        >
          <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/60 backdrop-blur-sm transition hover:bg-black/70 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="grid md:grid-cols-2">
            <div className={`relative aspect-square bg-gradient-to-br ${style.gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(255,255,255,0.18),transparent_60%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[100px] opacity-40 select-none float-slow">{style.icon}</span>
              </div>
              {product.badge && (
                <div className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                  product.badge === 'Coming Soon' ? 'bg-slate-900/80 text-slate-400' :
                  product.badge === 'Popular' ? 'bg-blue-500/90 text-white' :
                  product.badge === 'Best Seller' ? 'bg-emerald-500/90 text-white' :
                  product.badge === 'Limited' ? 'bg-amber-500/90 text-white' :
                  product.badge === 'Premium' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                  product.badge === 'Low Stock' ? 'bg-red-500/90 text-white' :
                  'bg-white/20 text-white'
                }`}>
                  {product.badge}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400/70">{product.category}</p>
                <h2 className="mt-1 text-2xl font-bold text-white">{product.name}</h2>
                <p className="mt-1 text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{product.displayPrice}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{product.description}</p>

                <div className="mt-6 space-y-2.5">
                  {['Eco-friendly PLA material', 'Hand-finished in Leeds', 'Plastic-free packaging'].map((f) => (
                    <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                        <svg className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      {f}
                    </div>
                  ))}
                  {product.stock !== null && !isComingSoon && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${product.stock <= 3 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                        <span className={`h-2 w-2 rounded-full ${product.stock <= 3 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      </div>
                      <span className={product.stock <= 3 ? 'text-amber-400' : 'text-slate-400'}>
                        {isSoldOut ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={isComingSoon || isSoldOut}
                className={`mt-8 w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                  added ? 'bg-emerald-500 text-white scale-[0.98]' :
                  isComingSoon ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                  isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                  'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]'
                }`}
              >
                {added ? '✓ Added to Basket' : isComingSoon ? 'Coming Soon' : isSoldOut ? 'Out of Stock' : 'Add to Basket'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════ Cart Drawer ═══════════════════════════ */

function CartDrawer({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const { items, update, remove, clear, total, count } = useCart();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-[80] flex w-full max-w-md flex-col border-l border-white/10 bg-[#0a0f1a]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-white">Your Basket</h2>
                {count > 0 && <p className="text-xs text-slate-500">{count} item{count !== 1 ? 's' : ''}</p>}
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-white/5 p-6">
                    <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <p className="mt-5 text-base font-semibold text-slate-300">Your basket is empty</p>
                  <p className="mt-1 text-sm text-slate-500">Add some prints to get started</p>
                  <button onClick={onClose} className="mt-6 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item) => {
                      const st = CATEGORY_STYLES[item.product.category] || CATEGORY_STYLES['Other'];
                      return (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30, height: 0 }}
                          className="flex gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
                        >
                          <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${st.gradient}`}>
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-2xl opacity-40 select-none">{st.icon}</span>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{item.product.name}</p>
                                <p className="text-[11px] text-slate-500">{item.product.displayPrice} each</p>
                              </div>
                              <button onClick={() => remove(item.product.id)} className="rounded-full p-1 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => update(item.product.id, item.qty - 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs text-white transition hover:bg-white/10">−</button>
                              <span className="w-6 text-center text-xs font-semibold text-white">{item.qty}</span>
                              <button onClick={() => update(item.product.id, item.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs text-white transition hover:bg-white/10">+</button>
                              <span className="ml-auto text-sm font-bold text-white">£{((item.product.price * item.qty) / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <button onClick={clear} className="mt-1 text-[11px] text-slate-600 transition hover:text-red-400">Clear basket</button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/[0.08] px-6 py-5 space-y-4">
                {total >= 1500 && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-xs font-medium text-emerald-400">
                    Free UK shipping included!
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Subtotal</span>
                  <span className="text-2xl font-extrabold text-white">£{(total / 100).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { onClose(); onCheckout(); }}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Secured by Stripe. We never see your card
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════ Checkout Form ═══════════════════════════ */

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
}

const EMPTY_CUSTOMER: CustomerDetails = { firstName: '', lastName: '', email: '', phone: '', address1: '', address2: '', city: '', postcode: '' };
const STORAGE_KEY = 'fr_customer';

function CheckoutForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, total, count, clear } = useCart();
  const [customer, setCustomer] = useState<CustomerDetails>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : EMPTY_CUSTOMER; } catch { return EMPTY_CUSTOMER; }
  });
  const [saveDetails, setSaveDetails] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'review'>('form');

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setStep('form'); }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const update = (field: keyof CustomerDetails, value: string) => setCustomer((prev) => ({ ...prev, [field]: value }));

  const isValid = customer.firstName && customer.lastName && customer.email && customer.address1 && customer.city && customer.postcode;

  const handleSubmit = async () => {
    if (!isValid || items.length === 0) return;
    setSubmitting(true);

    if (saveDetails) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty })),
          customer,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Checkout unavailable. Configure Stripe keys.');
    } catch { alert('Checkout unavailable. Configure Stripe keys.'); }
    finally { setSubmitting(false); }
  };

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.08]';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-[100] flex items-start justify-center overflow-y-auto sm:inset-8 md:inset-12"
          >
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0c1220] shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <img src="/headfrlogorv.png" alt="ForgeRealm" width={28} height={28} className="rounded-full" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Checkout</h2>
                    <p className="text-xs text-slate-500">{count} item{count !== 1 ? 's'  : ''} - £{(total / 100).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="hidden sm:flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-medium ${step === 'form' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-slate-500'}`}>1. Details</span>
                    <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className={`rounded-full px-2.5 py-1 font-medium ${step === 'review' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-slate-500'}`}>2. Review & Pay</span>
                  </div>
                  <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {step === 'form' ? (
                <div className="p-6 sm:p-8">
                  <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                    {/* Form */}
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-white">Shipping Details</h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>First Name *</label>
                          <input type="text" value={customer.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="John" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name *</label>
                          <input type="text" value={customer.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Smith" className={inputClass} />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Email *</label>
                          <input type="email" value={customer.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Phone</label>
                          <input type="tel" value={customer.phone} onChange={(e) => update('phone', e.target.value)} placeholder="07123 456789" className={inputClass} />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Address Line 1 *</label>
                        <input type="text" value={customer.address1} onChange={(e) => update('address1', e.target.value)} placeholder="123 High Street" className={inputClass} />
                      </div>

                      <div>
                        <label className={labelClass}>Address Line 2</label>
                        <input type="text" value={customer.address2} onChange={(e) => update('address2', e.target.value)} placeholder="Flat 4, Building Name" className={inputClass} />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>City *</label>
                          <input type="text" value={customer.city} onChange={(e) => update('city', e.target.value)} placeholder="Leeds" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Postcode *</label>
                          <input type="text" value={customer.postcode} onChange={(e) => update('postcode', e.target.value)} placeholder="LS1 1AA" className={inputClass} />
                        </div>
                      </div>

                      {/* Save details toggle */}
                      <button
                        onClick={() => setSaveDetails(!saveDetails)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm transition hover:bg-white/[0.06]"
                      >
                        <div>
                          <span className={saveDetails ? 'text-white' : 'text-slate-400'}>Save details for next time</span>
                          <p className="text-[11px] text-slate-600 mt-0.5">Stored locally on this device only</p>
                        </div>
                        <div className={`flex h-5 w-9 items-center rounded-full transition-colors ${saveDetails ? 'bg-blue-500' : 'bg-white/10'}`}>
                          <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${saveDetails ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>
                    </div>

                    {/* Order summary sidebar */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <h3 className="text-sm font-bold text-white mb-4">Order Summary</h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                        {items.map((item) => {
                          const st = CATEGORY_STYLES[item.product.category] || CATEGORY_STYLES['Other'];
                          return (
                            <div key={item.product.id} className="flex items-center gap-3">
                              <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${st.gradient} flex items-center justify-center`}>
                                <span className="text-sm opacity-50 select-none">{st.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{item.product.name}</p>
                                <p className="text-[11px] text-slate-500">x{item.qty}</p>
                              </div>
                              <span className="text-xs font-semibold text-white">£{((item.product.price * item.qty) / 100).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Subtotal</span>
                          <span>£{(total / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Shipping</span>
                          <span className={total >= 1500 ? 'text-emerald-400' : ''}>{total >= 1500 ? 'Free' : '£3.50'}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.06]">
                          <span>Total</span>
                          <span>£{((total + (total >= 1500 ? 0 : 350)) / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue button */}
                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
                      Back to basket
                    </button>
                    <button
                      onClick={() => { if (isValid) setStep('review'); }}
                      disabled={!isValid}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10">Review Order</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Review step */
                <div className="p-6 sm:p-8">
                  <div className="grid gap-8 lg:grid-cols-2">
                    {/* Shipping summary */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white">Shipping To</h3>
                        <button onClick={() => setStep('form')} className="text-xs text-blue-400 transition hover:text-blue-300">Edit</button>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-slate-300 space-y-1">
                        <p className="font-semibold text-white">{customer.firstName} {customer.lastName}</p>
                        <p>{customer.address1}</p>
                        {customer.address2 && <p>{customer.address2}</p>}
                        <p>{customer.city}, {customer.postcode}</p>
                        <p className="text-slate-500">{customer.email}</p>
                        {customer.phone && <p className="text-slate-500">{customer.phone}</p>}
                      </div>

                      <h3 className="text-sm font-bold text-white mt-6 mb-4">Order Items</h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const st = CATEGORY_STYLES[item.product.category] || CATEGORY_STYLES['Other'];
                          return (
                            <div key={item.product.id} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                              <div className={`h-8 w-8 shrink-0 rounded-md bg-gradient-to-br ${st.gradient} flex items-center justify-center`}>
                                <span className="text-xs opacity-50 select-none">{st.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{item.product.name}</p>
                              </div>
                              <span className="text-[11px] text-slate-500">x{item.qty}</span>
                              <span className="text-xs font-semibold text-white">£{((item.product.price * item.qty) / 100).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment summary */}
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4">Payment Summary</h3>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                          <span className="text-white">£{(total / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Shipping</span>
                          <span className={total >= 1500 ? 'text-emerald-400 font-medium' : 'text-white'}>{total >= 1500 ? 'Free' : '£3.50'}</span>
                        </div>
                        <div className="border-t border-white/[0.06] pt-3 flex justify-between">
                          <span className="text-base font-bold text-white">Total</span>
                          <span className="text-xl font-extrabold text-white">£{((total + (total >= 1500 ? 0 : 350)) / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <svg className="h-5 w-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          <div>
                            <p className="text-white text-xs font-medium">Secure payment via Stripe</p>
                            <p className="text-[11px] text-slate-500">You'll be redirected to Stripe to complete payment. We never see your card details.</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {submitting ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Redirecting to Stripe...
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" /></svg>
                                Pay Now
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                        <button onClick={() => setStep('form')} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white">
                          Back to Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════ Footer ═══════════════════════════ */

function ShopFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#070b14]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="/" className="group inline-flex items-center gap-2.5">
              <img src="/headfrlogorv.png" alt="ForgeRealm" width={32} height={32} className="h-8 w-8 rounded-full ring-1 ring-white/10" loading="lazy" />
              <span className="font-extrabold tracking-[0.15em] text-sm uppercase text-white">
                Forge<span className="text-blue-300">Realm</span>
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">Eco-friendly 3D printing studio in Leeds. Every piece is hand-finished with plant-based materials.</p>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Shop</h4>
            <ul className="mt-4 space-y-2.5">
              {['All Products', 'Articulated', 'Keychains', 'Tealights', 'Voronoi'].map((l) => (
                <li key={l}><a href="#products" className="text-sm text-slate-500 transition hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {[{ label: 'Home', href: '/' }, { label: 'About', href: '/#about' }, { label: 'Contact', href: '/#contact' }].map((l) => (
                <li key={l.label}><a href={l.href} className="text-sm text-slate-500 transition hover:text-white">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Trust & Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Secure Stripe checkout
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                forgerealmltd@gmail.com
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                Leeds, United Kingdom
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} ForgeRealm Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════ Auth Gate ═══════════════════════════ */

export default function ShopGate() {
  const [auth, setAuth] = useState<'loading' | 'denied' | 'granted'>('loading');

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem('forgerealm_admin_token');
        if (!token) { setAuth('denied'); return; }

        const apiBase = (window.location.origin.startsWith('http://localhost')
          ? (import.meta.env?.PUBLIC_API_URL_LOCAL || import.meta.env?.PUBLIC_API_URL || '')
          : (import.meta.env?.PUBLIC_API_URL || '')
        ).replace(/\/$/, '');

        if (!apiBase) { setAuth('denied'); return; }

        const res = await fetch(`${apiBase}/api/auth/me`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { setAuth('denied'); return; }
        const data = await res.json();

        if (data?.user?.role === 'admin') {
          setAuth('granted');
        } else {
          setAuth('denied');
        }
      } catch {
        setAuth('denied');
      }
    };
    check();
    window.addEventListener('forgerealm-admin-token-changed', check);
    return () => window.removeEventListener('forgerealm-admin-token-changed', check);
  }, []);

  if (auth === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
          <p className="mt-4 text-sm text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  if (auth === 'denied') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4">
        <InjectStyles />
        <div className="noise-overlay" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[180px] glow-breathe" />
          <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[160px] glow-breathe" style={{ animationDelay: '1s' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md text-center"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
            <div className="mx-auto mb-6">
              <img src="/frlogorv.png" alt="ForgeRealm" width={80} height={80} className="mx-auto rounded-2xl" />
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Preview mode
            </div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Shop is <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">coming soon</span>
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              The ForgeRealm shop is currently in preview. Admin access is required to view the store.
            </p>
            <div className="mt-8 space-y-3">
              <a
                href="/shop/sign-in"
                className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30"
              >
                Admin Sign In
              </a>
              <a
                href="/"
                className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Back to Home
              </a>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-600">Follow our socials for launch updates</p>
        </motion.div>
      </div>
    );
  }

  return <ShopContent />;
}

function ShopContent() {
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [filterMobileOpen, setFilterMobileOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [MIN_PRICE, MAX_PRICE],
    inStock: false,
    sort: 'default',
    badges: [],
  });

  // Count filtered products for sidebar display
  const filteredCount = products.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    if (filters.inStock && (p.stock === 0 || p.badge === 'Coming Soon')) return false;
    if (filters.badges.length > 0 && (!p.badge || !filters.badges.includes(p.badge))) return false;
    return true;
  }).length;

  return (
    <CartProvider>
      <InjectStyles />
      <div className="min-h-screen bg-[#0a0f1a] text-white">
        {/* Noise texture overlay */}
        <div className="noise-overlay" />

        {/* Promo banner */}
        {/* <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-center">
          <div className="absolute inset-0 shimmer-bg opacity-30" />
          <p className="relative py-2 text-xs font-semibold tracking-wider text-white sm:text-sm">
            🌱 Free UK shipping on orders over £15. <span className="underline decoration-white/40 underline-offset-2">100% eco-friendly</span>
          </p>
        </div> */}

        <ShopHeader onCartOpen={() => setCartOpen(true)} onSearch={setSearch} />
        <HeroBanner />
        <MarqueeBanner />
        <FeaturedRow onQuickView={setModalProduct} />

        {/* Sticky filter bar */}
        <div className="sticky top-[57px] z-40 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 scrollbar-hide">
            <CategoryFilter active={category} onChange={setCategory} />
          </div>
        </div>

        {/* Sidebar + Grid layout */}
        <div id="products" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <FilterSidebar filters={filters} onChange={setFilters} total={filteredCount} mobileOpen={filterMobileOpen} onMobileClose={() => setFilterMobileOpen(false)} />
            <div className="flex-1 min-w-0">
              <ProductGrid category={category} search={search} filters={filters} onQuickView={setModalProduct} onFilterMobileOpen={() => setFilterMobileOpen(true)} />
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-[#0a0f1a] to-blue-950/40" />
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Can't find what you're looking for?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              We take custom orders. Tell us your idea and we'll bring it to life with eco-friendly materials.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="/#contact" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5">
                <span className="relative z-10">Get a custom quote</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a href="/" className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/25 hover:bg-white/10">
                Back to home
              </a>
            </div>
          </div>
        </section>

        <ShopFooter />

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCheckoutOpen(true)} />
        <CheckoutForm open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      </div>
    </CartProvider>
  );
}
