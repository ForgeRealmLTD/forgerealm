import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, type Product } from '../../data/products';

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
    try { return typeof window !== 'undefined' && localStorage.getItem('fr_cart') ? JSON.parse(localStorage.getItem('fr_cart')!) : []; } catch { return []; }
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

/* ═══════════════════════════ Toast System ═══════════════════════════ */

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string }
interface ToastCtx { success: (m: string) => void; error: (m: string) => void; warning: (m: string) => void; info: (m: string) => void }
const ToastContext = createContext<ToastCtx | null>(null);
const useToast = () => useContext(ToastContext)!;

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const ctx = {
    success: useCallback((m: string) => add('success', m), [add]),
    error: useCallback((m: string) => add('error', m), [add]),
    warning: useCallback((m: string) => add('warning', m), [add]),
    info: useCallback((m: string) => add('info', m), [add]),
  };

  const colors: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  };

  const icons: Record<ToastType, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl shadow-black/30 backdrop-blur-xl ${colors[t.type]}`}
            >
              <span className="text-base">{icons[t.type]}</span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ═══════════════════════════ Order Success Overlay ═══════════════════════════ */

function OrderSuccessOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 250 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md text-center"
      >
        <div className="rounded-3xl border border-white/10 bg-[#0c1220] p-8 shadow-2xl shadow-blue-500/10 sm:p-10">
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, damping: 12 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-10 w-10 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-extrabold text-white">Order Confirmed!</h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Thank you for your order. We've sent a confirmation email with your order details. Your prints will be hand-finished and shipped within 3-5 business days.
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
                <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                Check your inbox for order details
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href="/shop/orders"
                className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
              >
                View Orders
              </a>
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════ CSS Injection ═══════════════════════════ */

const CUSTOM_CSS = `
/* ── Core keyframes ── */
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
@keyframes glow-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
@keyframes gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes border-glow-spin { 0% { --angle: 0deg; } 100% { --angle: 360deg; } }
@keyframes noise-scroll { 0% { transform: translate(0,0); } 10% { transform: translate(-5%,-5%); } 20% { transform: translate(-10%,5%); } 30% { transform: translate(5%,-10%); } 40% { transform: translate(-5%,15%); } 50% { transform: translate(-10%,5%); } 60% { transform: translate(15%,0); } 70% { transform: translate(0,10%); } 80% { transform: translate(-15%,0); } 90% { transform: translate(10%,5%); } 100% { transform: translate(5%,0); } }
@keyframes aurora { 0% { background-position: 0% 50%; } 25% { background-position: 50% 100%; } 50% { background-position: 100% 50%; } 75% { background-position: 50% 0%; } 100% { background-position: 0% 50%; } }
@keyframes reveal-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes reveal-scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes entrance { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.enter { animation: entrance 0.7s cubic-bezier(0.16,1,0.3,1) both; }
.enter-d1 { animation-delay: 0.1s; }
.enter-d2 { animation-delay: 0.25s; }
.enter-d3 { animation-delay: 0.4s; }
.enter-d4 { animation-delay: 0.55s; }
.enter-d5 { animation-delay: 0.7s; }
@keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.5); opacity: 0; } }
@keyframes text-shimmer { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }

/* ── Utilities ── */
.float-slow { animation: float 6s ease-in-out infinite; }
.glow-breathe { animation: glow-pulse 4s ease-in-out infinite; }
.gradient-text-flow { background-size: 200% auto; animation: gradient-flow 4s ease infinite; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.marquee-track { display: flex; width: max-content; animation: marquee 30s linear infinite; }
.marquee-track:hover { animation-play-state: paused; }

/* ── Noise texture ── */
.noise-overlay { position: fixed; inset: -50%; z-index: 9999; pointer-events: none; opacity: 0.012; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); animation: noise-scroll 8s steps(10) infinite; }

/* ── Scroll reveal ── */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
.reveal.revealed { opacity: 1; transform: translateY(0); }
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }

/* ── Aurora gradient background ── */
.aurora-bg { background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.05) 25%, rgba(16,185,129,0.04) 50%, rgba(99,102,241,0.06) 75%, rgba(59,130,246,0.08) 100%); background-size: 400% 400%; animation: aurora 15s ease infinite; }

/* ── Animated gradient border on hover ── */
.gradient-border { position: relative; }
.gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: conic-gradient(from var(--angle, 0deg), transparent 40%, rgba(59,130,246,0.3) 55%, rgba(6,182,212,0.3) 65%, rgba(16,185,129,0.2) 75%, transparent 90%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.6s ease; pointer-events: none; animation: border-glow-spin 4s linear infinite; z-index: 10; }
.gradient-border:hover::before { opacity: 1; }

/* ── Glass card ── */
.glass { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.22); }
.glass-hover { transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
.glass-hover:hover { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.1); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.4), 0 0 40px -10px rgba(59,130,246,0.08); transform: translateY(-4px); }

/* ── Shimmer text (for special headings) ── */
.shimmer-text { background: linear-gradient(110deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 40%, rgba(147,197,253,1) 50%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.9) 100%); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: text-shimmer 4s ease-in-out infinite; }

/* ── Cursor glow (applied via JS) ── */
.cursor-glow { position: fixed; width: 400px; height: 400px; border-radius: 50%; pointer-events: none; z-index: 1; background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%); transform: translate(-50%, -50%); transition: opacity 0.3s ease; }

/* ── Smooth section divider ── */
.section-glow { position: relative; }
.section-glow::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.2), rgba(6,182,212,0.15), transparent); }

/* ── Button hover shine ── */
.btn-shine { position: relative; overflow: hidden; }
.btn-shine::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(transparent, rgba(255,255,255,0.08), transparent); transform: rotate(45deg) translateY(-100%); transition: transform 0.6s ease; pointer-events: none; }
.btn-shine:hover::after { transform: rotate(45deg) translateY(0%); }
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById('fr-shop-css')) return;
    // Load medieval fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap';
    document.head.appendChild(link);

    const el = document.createElement('style');
    el.id = 'fr-shop-css';
    el.textContent = CUSTOM_CSS;
    document.head.appendChild(el);
    return () => { el.remove(); link.remove(); };
  }, []);
  return null;
}

/* ═══════════════════════════ Cursor Glow ═══════════════════════════ */

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el || window.innerWidth < 768) return; // skip on mobile
    const move = (e: MouseEvent) => {
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
      el.style.opacity = '1';
    };
    const leave = () => { el.style.opacity = '0'; };
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => { window.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); };
  }, []);

  return <div ref={glowRef} className="cursor-glow" style={{ opacity: 0 }} />;
}

/* ═══════════════════════════ Scroll Reveal ═══════════════════════════ */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useReveal();
  const delayClass = delay === 1 ? 'reveal-delay-1' : delay === 2 ? 'reveal-delay-2' : delay === 3 ? 'reveal-delay-3' : '';
  return <div ref={ref} className={`reveal ${delayClass} ${className}`}>{children}</div>;
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
    { icon: '📦', text: 'Carefully packaged' },
    { icon: '✋', text: 'Hand-finished' },
    { icon: '🚚', text: 'Free UK shipping £15+' },
    { icon: '♻️', text: 'Biodegradable materials' },
    { icon: '⭐', text: '239+ prints sold' },
    { icon: '🎨', text: 'Custom orders welcome' },
  ];

  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/[0.04] bg-[#0a0f1a] py-4" style={{ maxHeight: '52px' }}>
      <div className="marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-2.5 text-[14px] sm:text-[15px] text-slate-400 whitespace-nowrap sm:mx-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <span className="text-base">{item.icon}</span>
            {item.text}
            <span className="ml-6 text-slate-700 sm:ml-8">&middot;</span>
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
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-white/[0.06] bg-[#0a0f1a]/80 backdrop-blur-3xl shadow-2xl shadow-black/30' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/50 to-cyan-400/50 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <img src="/headfrlogorv.png" alt="ForgeRealm" width={36} height={36} className="relative h-9 w-9 rounded-full ring-1 ring-white/20 transition-all duration-300 group-hover:ring-blue-400/50" loading="eager" />
          </div>
          <span className="font-semibold tracking-[0.1em] text-sm text-blue-300" style={{ fontFamily: "'Cinzel', serif" }}>
            ForgeRealm
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
          <a href="/shop/dashboard" className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-white">Profile</a>
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
                  className="absolute -right-2 -top-2 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-[13px] font-bold text-white shadow-lg shadow-blue-500/30"
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
            {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[12px] font-bold text-white">{count}</span>}
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
              <a href="/shop/dashboard" className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">Profile</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ═══════════════════════════ Hero ═══════════════════════════ */

function HeroBanner() {
  const counter = useCountUp(239, 2200);
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* Ambient background - subtle and refined */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[250px] glow-breathe" />
        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[220px] glow-breathe" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[200px] glow-breathe" style={{ animationDelay: '2s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/30 blur-[1px] float-slow"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              left: `${10 + Math.random() * 80}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 py-10 sm:gap-12 sm:py-24 lg:grid-cols-2 lg:py-32">
          {/* Left text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-4 sm:mb-5 inline-flex items-center gap-3">
              <div className="w-8 h-px bg-blue-400/50" />
              <span className="text-[13px] sm:text-[15px] font-medium uppercase tracking-[0.28em] text-blue-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>
                Leeds Artisan 3D Printing
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-[4rem]" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="shimmer-text">Welcome to</span><br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent gradient-text-flow" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '1.1em' }}>
                the Realm
              </span>
            </h1>
            <p className="mt-3 sm:mt-5 max-w-md leading-relaxed text-slate-400/90" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(16px,4vw,20px)', lineHeight: 1.7 }}>
              Hand-finished fantasy miniatures, articulated dragons &amp; collector pieces. Crafted in Leeds with plant-based PLA.
            </p>
            <div className="mt-5 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <a
                href="#products"
                className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2.5 sm:px-7 sm:py-3 text-[12px] sm:text-[15px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Shop Collection
              </a>
              <a
                href="/custom-order"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-2.5 sm:px-7 sm:py-3 text-[12px] sm:text-[15px] font-semibold uppercase tracking-[0.14em] text-white/70 backdrop-blur-xl transition-all hover:border-blue-400/30 hover:text-white"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Custom Print
              </a>
            </div>
            <div className="mt-5 sm:mt-8 flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-1.5 text-[13px] sm:text-[15px] text-slate-300 sm:text-slate-500">
              {['Eco-friendly PLA', 'Free UK shipping £15+', 'Handmade in Leeds'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right - featured logo showcase */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
            <div className="relative mx-auto w-[420px]">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 blur-3xl" />
              <div className="absolute -inset-4 rounded-[2rem] border border-white/[0.04]" />

              {/* Main card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />

                <div className="relative flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-400/30 blur-2xl glow-breathe" />
                    <img src="/frlogorv.png" alt="ForgeRealm" width={140} height={140} className="relative rounded-2xl float-slow" />
                  </div>
                  <div className="text-center" ref={counter.ref}>
                    <p className="text-5xl font-extrabold text-white tabular-nums">{counter.count}<span className="text-2xl text-blue-400">+</span></p>
                    <p className="mt-1 text-xs tracking-[0.2em] uppercase text-slate-400">Eco prints sold</p>
                    <p className="mt-2 text-[13px] text-emerald-400/80 italic">One print closer to a greener planet</p>
                  </div>

                  {/* Mini stats */}
                  <div className="grid w-full grid-cols-3 gap-3">
                    {[
                      { n: '30+', l: 'Designs' },
                      { n: '12', l: 'Collections' },
                      { n: '100%', l: 'Eco PLA' },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-center">
                        <p className="text-lg font-bold text-white">{s.n}</p>
                        <p className="text-[12px] uppercase tracking-wider text-slate-500">{s.l}</p>
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

function FeaturedRow({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const featured = products.filter((p) => p.featured);

  return (
    <section className="section-glow relative bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-14 sm:px-6 lg:px-8">
        <div className="mb-5 sm:mb-8 flex items-end justify-between">
          <div>
            <p className="text-[12px] sm:text-[15px] font-medium uppercase tracking-[0.28em] text-blue-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>This week</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-normal text-white" style={{ fontFamily: "'Cinzel', serif" }}>The <em className="text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Forge</em> Collection</h2>
          </div>
          <a href="#products" className="text-xs sm:text-sm text-slate-400 transition hover:text-white">View all &rarr;</a>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {featured.map((item) => (
            <div
              key={item.id}
              onClick={() => onQuickView(item)}
              className="group cursor-pointer overflow-hidden rounded-2xl shrink-0 w-[70vw] snap-start sm:w-auto sm:shrink relative"
            >
              {/* Full image background */}
              <div className="relative aspect-[3/4]">
                {item.image && (
                  <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="eager" />
                )}
                {/* Gradient overlay - dark at bottom for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-px bg-cyan-400/50" />
                    <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.25em] text-cyan-300/60" style={{ fontFamily: "'Jost', sans-serif" }}>Featured</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight mb-1.5 group-hover:text-cyan-100 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>{item.name}</h3>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-semibold text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.displayPrice}</span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <span className="text-[9px] uppercase tracking-wider text-white/50" style={{ fontFamily: "'Jost', sans-serif" }}>View</span>
                      <svg className="h-3 w-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>

                {/* Subtle border that glows on hover */}
                <div className="absolute inset-0 rounded-2xl border border-white/[0.08] group-hover:border-cyan-400/20 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ Product Card ═══════════════════════════ */

const DEFAULT_STYLE = { gradient: 'from-slate-700 via-slate-800 to-slate-900', icon: '✨' };

function ProductCard({ product, onQuickView, index }: { product: Product; onQuickView: (p: Product) => void; index: number }) {
  const { add } = useCart();
  const style = DEFAULT_STYLE;
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const hasMultiple = product.images && product.images.length > 1;

  // Auto-carousel when card is in viewport
  useEffect(() => {
    if (!hasMultiple) return;
    const interval = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % product.images!.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hasMultiple, product.images]);

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
    <div
      className="gradient-border group overflow-hidden rounded-2xl glass glass-hover flex flex-col"
      style={{ borderColor: 'rgba(255,255,255,0.22)' }}
    >
      {/* Image - tapping this opens the modal */}
      <div
        className={`relative aspect-[3/4] cursor-pointer ${product.image ? 'bg-white' : `bg-gradient-to-br ${style.gradient}`}`}
        onClick={() => onQuickView(product)}
      >
        {product.image ? (
          <>
            {hasMultiple ? (
              product.images!.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
                  style={{ opacity: i === imgIdx ? 1 : 0, zIndex: i === imgIdx ? 2 : 1 }}
                  loading="lazy"
                />
              ))
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                loading="lazy"
              />
            )}
            {/* Carousel dots */}
            {hasMultiple && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {product.images!.map((_, i) => (
                  <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === imgIdx ? 'w-4 bg-slate-900/60' : 'w-1 bg-slate-900/20'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl opacity-20 select-none">{style.icon}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent opacity-60" />
          </>
        )}

        {/* Badges - stacked vertically to avoid overlap */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5 z-10">
          {product.badge && (
            <div className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] shadow-lg ${
              product.badge === 'Coming Soon' ? 'bg-slate-900/90 text-slate-300 border border-slate-700/50' :
              product.badge === 'Low Stock' ? 'bg-slate-900/90 text-red-400 border border-red-500/30' :
              product.badge === 'Limited' ? 'bg-slate-900/90 text-amber-400 border border-amber-500/30' :
              'bg-slate-900/90 text-white/90 border border-white/10'
            }`}>
              {product.badge}
            </div>
          )}
          {product.stock !== null && !isComingSoon && (
            <div className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium shadow-lg ${isLow ? 'bg-slate-900/90 text-amber-400 border border-amber-500/30' : 'bg-slate-900/90 text-slate-300 border border-white/10'}`}>
              {isSoldOut ? 'Sold out' : `${product.stock} left`}
            </div>
          )}
        </div>

        {/* Add to basket overlay - desktop only (hidden on mobile to prevent accidental taps) */}
        {!isComingSoon && !isSoldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block pointer-events-none sm:pointer-events-auto">
            <button
              onClick={handleAdd}
              className={`w-full rounded-xl py-2.5 text-[13px] font-semibold uppercase tracking-[0.1em] transition-all backdrop-blur-xl ${
                added
                  ? 'bg-emerald-500/90 text-white scale-[0.97]'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20'
              }`}
            >
              {added ? '✓ Added' : 'Add to Basket'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[13px] sm:text-[15px] font-normal text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>{product.name}</h3>
          </div>
          <span className="shrink-0 text-[17px] sm:text-[20px] font-semibold text-cyan-300/80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{product.displayPrice}</span>
        </div>
        <p className="mt-1 sm:mt-1.5 line-clamp-2 text-[13px] sm:text-[15px] leading-relaxed text-slate-400 hidden sm:block" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{product.description}</p>
        {isLow && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" /></span>
            <p className="text-[12px] font-medium text-amber-400/80">Only {product.stock} left</p>
          </div>
        )}
        {/* Bottom actions */}
        <div className="flex-1" />
        {!isComingSoon && !isSoldOut && (
          <>
            {/* Mobile: text buttons */}
            <div className="flex gap-2 mt-2 sm:hidden">
              <button
                onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
                className="flex-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70 border border-white/15 transition-all hover:border-white/30 hover:text-white"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                View
              </button>
              <button
                onClick={handleAdd}
                className={`flex-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {added ? '✓ Added' : 'Add to Basket'}
              </button>
            </div>
            {/* Desktop: cart icon */}
            <div className="hidden sm:flex justify-end mt-2">
              <button
                onClick={handleAdd}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shrink-0 ${
                  added
                    ? 'bg-emerald-500 scale-90'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow shadow-amber-500/20 hover:scale-110'
                }`}
              >
                {added ? (
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
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
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-slate-400">Price Range</h3>
        <PriceRangeSlider value={filters.priceRange} onChange={(v) => onChange({ ...filters, priceRange: v })} />
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-slate-400">Sort By</h3>
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
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-slate-400">Availability</h3>
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
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-slate-400">Tags</h3>
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

function LampBanner({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const lamp = products.find(p => p.id === 'artichoke-lamp');
  if (!lamp) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl cursor-pointer group" style={{ border: '1px solid rgba(255,255,255,0.12)' }} onClick={() => onQuickView(lamp)}>
      <div className="relative h-[300px] sm:h-[400px] lg:h-[450px]">
        <img
          src="/shop-products/lamps1.webp"
          alt="Artichoke Lamp"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          style={{ objectPosition: '50% 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 mix-blend-soft-light bg-gradient-to-br from-amber-900/20 to-transparent" />

        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="max-w-xl p-5 sm:p-10 lg:p-14">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-px bg-amber-400/60" />
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-amber-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>New Arrival</span>
            </div>
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[0.95] mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
              Artichoke
              <br />
              <span className="text-amber-200/90" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '1.1em' }}>
                Lamp
              </span>
            </h3>
            <p className="text-[13px] sm:text-[16px] text-white/50 max-w-sm leading-relaxed mb-4 hidden sm:block" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              Stand, bulb &amp; shade included. Black or brushed silver finish.
            </p>
            <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-4xl font-bold text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>&pound;20</span>
              <span className="text-[11px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>per lamp</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 border border-white/20 rounded-full transition-all group-hover:border-amber-300/40 group-hover:text-amber-200" style={{ fontFamily: "'Cinzel', serif" }}>
              View Details
              <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full backdrop-blur-sm">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-amber-300" style={{ fontFamily: "'Jost', sans-serif" }}>Premium</span>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ search, filters, onQuickView, onFilterMobileOpen }: {
  search: string;
  filters: Filters;
  onQuickView: (p: Product) => void;
  onFilterMobileOpen: () => void;
}) {
  const filtered = products.filter((p) => {
    if (p.bannerOnly) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
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
          <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-blue-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>Browse</p>
          <h2 className="mt-1 text-2xl font-normal text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            The <em className="text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Realm</em>
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
        <div className="space-y-2.5 sm:space-y-4">
          <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-3">
            {sorted.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} onQuickView={onQuickView} index={i} />
            ))}
          </div>

          {/* Lamp banner inline */}
          {sorted.length > 6 && (
            <LampBanner onQuickView={onQuickView} />
          )}

          {sorted.length > 8 && (
            <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-3">
              {sorted.slice(8).map((p, i) => (
                <ProductCard key={p.id} product={p} onQuickView={onQuickView} index={i + 8} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Product Modal ═══════════════════════════ */

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [modalImgIdx, setModalImgIdx] = useState(0);
  const modalImages = product?.images && product.images.length > 1 ? product.images : null;

  // Reset image index when product changes
  useEffect(() => { setModalImgIdx(0); }, [product?.id]);

  useEffect(() => {
    if (product) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!product) return null;
  const style = DEFAULT_STYLE;
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
            <div className={`relative min-h-[300px] md:min-h-0 ${product.image ? 'bg-white' : `bg-gradient-to-br ${style.gradient}`}`}>
              {product.image ? (
                <>
                  {modalImages ? (
                    <>
                      {modalImages.map((src, i) => (
                        <img key={src} src={src} alt={`${product.name} ${i + 1}`} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: i === modalImgIdx ? 1 : 0, zIndex: i === modalImgIdx ? 2 : 1 }} />
                      ))}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {modalImages.map((_, i) => (
                          <button key={i} onClick={(e) => { e.stopPropagation(); setModalImgIdx(i); }} className={`h-2 rounded-full transition-all duration-300 ${i === modalImgIdx ? 'w-6 bg-white/80' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(255,255,255,0.18),transparent_60%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[100px] opacity-40 select-none float-slow">{style.icon}</span>
                  </div>
                </>
              )}
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
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <p className="mt-1 text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{product.displayPrice}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{product.description}</p>

                <div className="mt-6 space-y-2.5">
                  {(product.id === 'artichoke-lamp'
                    ? ['Includes bulb', 'Includes lamp stand', 'Black or brushed silver']
                    : ['Eco-friendly PLA material', 'Hand-finished in Leeds', 'Carefully packaged']
                  ).map((f) => (
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
                  'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 hover:scale-[1.02]'
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
  const toast = useToast();

  const handleCheckout = () => {
    const token = localStorage.getItem('forgerealm_admin_token');
    if (!token) {
      toast.info('Sign in to complete your purchase');
      onClose();
      setTimeout(() => { window.location.href = '/shop/sign-in'; }, 600);
      return;
    }
    onClose();
    onCheckout();
  };

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
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
                      const st = DEFAULT_STYLE;
                      return (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30, height: 0 }}
                          className="flex gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
                        >
                          <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ${item.product.image ? 'bg-[#0c1220]' : `bg-gradient-to-br ${st.gradient}`}`}>
                            {item.product.image ? (
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-2xl opacity-40 select-none">{st.icon}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{item.product.name}</p>
                                <p className="text-[13px] text-slate-500">{item.product.displayPrice} each</p>
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
                  <button onClick={clear} className="mt-1 text-[13px] text-slate-600 transition hover:text-red-400">Clear basket</button>
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
                  onClick={handleCheckout}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[13px] text-slate-600">
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
  const toast = useToast();
  const [customer, setCustomer] = useState<CustomerDetails>(() => {
    try { return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)!) : EMPTY_CUSTOMER; } catch { return EMPTY_CUSTOMER; }
  });
  const [saveDetails, setSaveDetails] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY));
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
      else toast.error(data.error || 'Checkout is currently unavailable. Please try again later.');
    } catch { toast.error('Checkout is currently unavailable. Please try again later.'); }
    finally { setSubmitting(false); }
  };

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.08]';
  const labelClass = 'block text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5';

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
                          <p className="text-[13px] text-slate-600 mt-0.5">Stored locally on this device only</p>
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
                          const st = DEFAULT_STYLE;
                          return (
                            <div key={item.product.id} className="flex items-center gap-3">
                              <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${st.gradient} flex items-center justify-center`}>
                                <span className="text-sm opacity-50 select-none">{st.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{item.product.name}</p>
                                <p className="text-[13px] text-slate-500">x{item.qty}</p>
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
                          const st = DEFAULT_STYLE;
                          return (
                            <div key={item.product.id} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                              <div className={`h-8 w-8 shrink-0 rounded-md bg-gradient-to-br ${st.gradient} flex items-center justify-center`}>
                                <span className="text-xs opacity-50 select-none">{st.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{item.product.name}</p>
                              </div>
                              <span className="text-[13px] text-slate-500">x{item.qty}</span>
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
                            <p className="text-[13px] text-slate-500">You'll be redirected to Stripe to complete payment. We never see your card details.</p>
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
              <span className="font-semibold tracking-[0.1em] text-sm text-blue-300" style={{ fontFamily: "'Cinzel', serif" }}>
                ForgeRealm
              </span>
            </a>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-400" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>Artisan Fantasy Miniatures. Every piece printed, finished, and packed with care in Leeds.</p>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Shop</h4>
            <ul className="mt-4 space-y-3">
              {['All Products', 'Dragons', 'Voronoi', 'Fidgets', 'Keychains'].map((l) => (
                <li key={l}><a href="#products" className="text-[15px] text-slate-400 transition hover:text-blue-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Info</h4>
            <ul className="mt-4 space-y-3">
              {[{ label: 'Our Story', href: '/#about' }, { label: 'Custom Orders', href: '/custom-order' }, { label: 'Contact', href: '/#contact' }, { label: 'Track Order', href: '/shop/orders' }].map((l) => (
                <li key={l.label}><a href={l.href} className="text-[15px] text-slate-400 transition hover:text-blue-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Delivery</h4>
            <ul className="mt-4 space-y-3">
              {['UK Shipping', 'Secure Checkout', 'Returns'].map((l) => (
                <li key={l} className="text-[15px] text-slate-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-[13px] text-slate-500 tracking-wide" style={{ fontFamily: "'Jost', sans-serif" }}>
          &copy; {new Date().getFullYear()} ForgeRealm Ltd. Leeds, UK.
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════ Auth Gate ═══════════════════════════ */

export default function ShopGate() {
  return <ShopContent />;
}

function ShopContent() {
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [filterMobileOpen, setFilterMobileOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [MIN_PRICE, MAX_PRICE],
    inStock: false,
    sort: 'default',
    badges: [],
  });

  // Safety net: ensure scroll is always restored when no modals are open
  useEffect(() => {
    if (!cartOpen && !checkoutOpen && !modalProduct && !showOrderSuccess) {
      document.body.style.overflow = '';
    }
  }, [cartOpen, checkoutOpen, modalProduct, showOrderSuccess]);

  // Post-checkout URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setShowOrderSuccess(true);
      // Clear cart after successful checkout
      try { localStorage.removeItem('fr_cart'); } catch {}
      window.history.replaceState({}, '', '/shop');
    } else if (params.get('cancelled') === 'true') {
      window.history.replaceState({}, '', '/shop');
    }
  }, []);

  // Count filtered products for sidebar display
  const filteredCount = products.filter((p) => {
    if (p.bannerOnly) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    if (filters.inStock && (p.stock === 0 || p.badge === 'Coming Soon')) return false;
    if (filters.badges.length > 0 && (!p.badge || !filters.badges.includes(p.badge))) return false;
    return true;
  }).length;

  return (
    <CartProvider>
      <ToastProvider>
      <InjectStyles />
      <div className="min-h-screen bg-[#0a0f1a] text-white aurora-bg">
        {/* Noise texture overlay */}
        <div className="noise-overlay" />
        {/* Cursor glow - desktop only */}
        <CursorGlow />

        <ShopHeader onCartOpen={() => setCartOpen(true)} onSearch={setSearch} />
        <HeroBanner />
        <MarqueeBanner />
        <div className="enter enter-d1">
          <FeaturedRow onQuickView={setModalProduct} />
        </div>

        {/* Bundle Banner - cinematic full-bleed */}
        <Reveal>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
            <div className="relative overflow-hidden rounded-2xl cursor-pointer group" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="relative h-[260px] sm:h-[340px] lg:h-[400px]">
                <img
                  src="/shop-products/bundle1.png"
                  alt="Voronoi Cat Family Bundle"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  style={{ objectPosition: '50% 45%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />

                <div className="absolute inset-0 flex items-end sm:items-center">
                  <div className="max-w-xl p-5 sm:p-10 lg:p-14">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <div className="w-10 h-px bg-cyan-400/60" />
                      <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-cyan-300/70" style={{ fontFamily: "'Jost', sans-serif" }}>Bundle</span>
                    </div>
                    <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[0.95] mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                      Voronoi Cat
                      <br />
                      <span className="text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '1.1em' }}>
                        Family
                      </span>
                    </h3>
                    <p className="text-[13px] sm:text-[15px] text-white/50 max-w-sm leading-relaxed mb-3 hidden sm:block" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                      4-piece set in matte black &amp; white. Two sizes, one price.
                    </p>
                    <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-4xl font-bold text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>&pound;10</span>
                      <span className="text-[11px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>4-piece set</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 border border-white/20 rounded-full transition-all group-hover:border-cyan-300/40 group-hover:text-cyan-200" style={{ fontFamily: "'Cinzel', serif" }}>
                      View Bundle
                      <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Sidebar + Grid layout */}
        <div id="products" className="mx-auto max-w-7xl px-4 py-8 sm:py-14 sm:px-6 lg:px-8">
          <Reveal>
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <a href="/" className="hover:text-white transition">Home</a>
              <span>/</span>
              <span className="text-slate-300">Shop</span>
            </nav>
          </Reveal>
          <div className="flex gap-8">
            <FilterSidebar filters={filters} onChange={setFilters} total={filteredCount} mobileOpen={filterMobileOpen} onMobileClose={() => setFilterMobileOpen(false)} />
            <div className="flex-1 min-w-0">
              <ProductGrid search={search} filters={filters} onQuickView={setModalProduct} onFilterMobileOpen={() => setFilterMobileOpen(true)} />
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <Reveal>
        <section className="section-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-[#0a0f1a] to-blue-950/40" />
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-12 sm:py-20 text-center sm:px-6">
            <h2 className="text-2xl font-normal text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Commission a <em className="text-cyan-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Custom Piece</em>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-400" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              Tell us your vision and we'll forge it into reality. Every custom order is hand-finished in Leeds.
            </p>
            <div className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <a href="/custom-order" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5">
                <span className="relative z-10">Get a custom quote</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a href="/" className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-semibold text-white transition-all hover:border-white/25 hover:bg-white/10">
                Back to home
              </a>
            </div>
          </div>
        </section>
        </Reveal>

        <Reveal>
          <ShopFooter />
        </Reveal>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCheckoutOpen(true)} />
        <CheckoutForm open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />

        <AnimatePresence>
          {showOrderSuccess && <OrderSuccessOverlay onClose={() => setShowOrderSuccess(false)} />}
        </AnimatePresence>
      </div>
      </ToastProvider>
    </CartProvider>
  );
}
