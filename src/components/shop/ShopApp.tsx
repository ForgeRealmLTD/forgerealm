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
    info: 'border-amber-500/30 bg-amber-500/8 text-amber-300',
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
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 shadow-2xl shadow-blue-500/10 sm:p-10">
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
            <p className="mt-3 text-sm text-stone-400 leading-relaxed">
              Thank you for your order. We've sent a confirmation email with your order details. Your prints will be hand-finished and shipped within 3-5 business days.
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center justify-center gap-3 text-sm text-stone-400">
                <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                Check your inbox for order details
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href="/shop/orders"
                className="block w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-amber-500/30"
              >
                View Orders
              </a>
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-stone-300 transition hover:bg-white/10 hover:text-white"
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
.aurora-bg { background: linear-gradient(135deg, rgba(212,144,26,0.08) 0%, rgba(240,184,74,0.05) 25%, rgba(247,217,138,0.04) 50%, rgba(180,120,20,0.06) 75%, rgba(212,144,26,0.08) 100%); background-size: 400% 400%; animation: aurora 15s ease infinite; }

/* ── Animated gradient border on hover ── */
.gradient-border { position: relative; }
.gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: conic-gradient(from var(--angle, 0deg), transparent 40%, rgba(212,144,26,0.3) 55%, rgba(240,184,74,0.3) 65%, rgba(247,217,138,0.2) 75%, transparent 90%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.6s ease; pointer-events: none; animation: border-glow-spin 4s linear infinite; z-index: 10; }
.gradient-border:hover::before { opacity: 1; }

/* ── Glass card ── */
.glass { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
.glass-hover { transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
.glass-hover:hover { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.1); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.4), 0 0 40px -10px rgba(212,144,26,0.08); transform: translateY(-4px); }

/* ── Shimmer text (for special headings) ── */
.shimmer-text { background: linear-gradient(110deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 40%, rgba(212,144,26,0.8) 50%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.9) 100%); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: text-shimmer 4s ease-in-out infinite; }

/* ── Newspaper editorial ── */
.newspaper-rule { height: 1px; background: linear-gradient(to right, transparent, rgba(212,144,26,0.25), transparent); }
.newspaper-rule-v { width: 1px; background: linear-gradient(to bottom, transparent, rgba(212,144,26,0.2), transparent); }
.editorial-drop::first-letter { font-family: 'Cinzel', serif; font-size: 3.2em; float: left; line-height: 0.8; margin: 0.05em 0.12em 0 0; color: #F0B84A; }
.col-rule { border-right: 1px solid rgba(212,144,26,0.12); }
@media(max-width:767px) { .col-rule { border-right: none; border-bottom: 1px solid rgba(212,144,26,0.12); padding-bottom: 16px; } }

/* ── Cursor glow (applied via JS) ── */
.cursor-glow { position: fixed; width: 400px; height: 400px; border-radius: 50%; pointer-events: none; z-index: 1; background: radial-gradient(circle, rgba(212,144,26,0.06) 0%, transparent 70%); transform: translate(-50%, -50%); transition: opacity 0.3s ease; }

/* ── Smooth section divider ── */
.section-glow { position: relative; }
.section-glow::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,144,26,0.2), rgba(240,184,74,0.15), transparent); }

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
    <div className="relative overflow-hidden border-y border-amber-500/[0.18] bg-amber-500/[0.03] py-3" style={{ maxHeight: '44px' }}>
      <div className="marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-3 text-[10px] text-amber-400/80 whitespace-nowrap tracking-[0.22em] uppercase sm:mx-8" style={{ fontFamily: "'Cinzel', serif" }}>
            {item.text}
            <span className="w-[3px] h-[3px] rounded-full bg-amber-500/30 ml-3" />
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
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-amber-500/[0.14] bg-[#0a0a0a]/96 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/50 to-cyan-400/50 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <img src="/headfrlogorv.png" alt="ForgeRealm" width={36} height={36} className="relative h-9 w-9 rounded-full ring-1 ring-white/20 transition-all duration-300 group-hover:ring-blue-400/50" loading="eager" />
          </div>
          <span className="font-semibold tracking-[0.1em] text-sm text-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>
            ForgeRealm
          </span>
        </a>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-400/20 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 h-4 w-4 text-stone-500 transition-colors group-focus-within:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search prints..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/40 focus:bg-white/[0.08]"
              />
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="/" className="rounded-lg px-3 py-2 text-sm text-stone-400 transition-all hover:bg-white/5 hover:text-white">Home</a>
          <a href="#products" className="rounded-lg px-3 py-2 text-sm text-stone-400 transition-all hover:bg-white/5 hover:text-white">Shop</a>
          <a href="/shop/dashboard" className="rounded-lg px-3 py-2 text-sm text-stone-400 transition-all hover:bg-white/5 hover:text-white">Profile</a>
          <div className="ml-2 h-5 w-px bg-white/10" />
          <button
            onClick={onCartOpen}
            className="group relative ml-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-amber-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10"
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
                  className="absolute -right-2 -top-2 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-[11px] font-bold text-white shadow-lg shadow-amber-500/30"
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
            {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{count}</span>}
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
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search prints..." value={query} onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }} className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none" />
              </div>
              <a href="/" className="block rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white">Home</a>
              <a href="#products" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white">Shop</a>
              <a href="/shop/dashboard" className="block rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white">Profile</a>
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
    <section className="relative overflow-hidden bg-[#0a0a0a]">
      {/* Subtle radial warmth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="pt-20 sm:pt-28 pb-6 sm:pb-8 text-center border-b border-amber-500/20">
          <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.4em] text-amber-400/60 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>
            Est. 2024 &middot; Leeds, United Kingdom
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-[5.5rem] font-bold leading-[0.9] text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="shimmer-text">ForgeRealm</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-amber-300/70 text-sm sm:text-base" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', letterSpacing: '0.04em' }}>
            Artisan Fantasy Miniatures &amp; Collector Pieces
          </p>
        </div>

        {/* Editorial columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 py-6 sm:py-10">
          {/* Column 1 - Main story */}
          <div className="col-rule pr-0 md:pr-8 pb-4 md:pb-0">
            <div className="mb-3 inline-flex items-center gap-3">
              <div className="w-6 h-px bg-amber-500" />
              <span className="text-[8px] font-medium uppercase tracking-[0.28em] text-amber-400" style={{ fontFamily: "'Jost', sans-serif" }}>
                The Forge
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-white leading-[1.15] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Hand-Finished<br />
              <em className="text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Fantasy Prints</em>
            </h2>
            <p className="editorial-drop text-[16px] leading-[1.85] text-stone-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Every piece begins as a digital sculpture and ends as a hand-finished artefact. Printed in plant-based PLA, each dragon, miniature, and collector piece is crafted with care in our Leeds workshop.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#products"
                className="btn-shine inline-flex items-center px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0a0a0a] transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/25"
                style={{ fontFamily: "'Cinzel', serif", background: 'linear-gradient(135deg, #D4901A, #F0B84A)' }}
              >
                Shop Collection
              </a>
              <a
                href="/custom-order"
                className="inline-flex items-center px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-all hover:text-amber-300"
                style={{ fontFamily: "'Cinzel', serif", border: '1px solid rgba(212,144,26,0.3)' }}
              >
                Commissions
              </a>
            </div>
          </div>

          {/* Column 2 - Stats */}
          <div className="col-rule px-0 md:px-8 py-4 md:py-0">
            <div className="flex flex-row md:flex-col gap-6 md:gap-8">
              <div ref={counter.ref}>
                <p className="text-4xl sm:text-5xl font-bold text-white tabular-nums" style={{ fontFamily: "'Cinzel', serif" }}>{counter.count}<span className="text-lg text-amber-400">+</span></p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-500 mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>Prints Sold</p>
                <p className="text-[11px] text-emerald-400/70 mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>One print closer to a greener planet</p>
              </div>
              <div className="newspaper-rule hidden md:block" />
              {[
                { n: '30+', l: 'Designs' },
                { n: '12', l: 'Collections' },
                { n: '100%', l: 'Eco PLA' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>{s.n}</p>
                  <p className="text-[8px] uppercase tracking-[0.18em] text-stone-500" style={{ fontFamily: "'Jost', sans-serif" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3 - Dispatch notes */}
          <div className="pl-0 md:pl-8 pt-4 md:pt-0">
            <div className="mb-3 inline-flex items-center gap-3">
              <div className="w-6 h-px bg-amber-500" />
              <span className="text-[8px] font-medium uppercase tracking-[0.28em] text-amber-400" style={{ fontFamily: "'Jost', sans-serif" }}>
                Dispatch
              </span>
            </div>
            <div className="space-y-4">
              {['Eco-friendly PLA', 'Free UK shipping £15+', 'Handmade in Leeds', 'Carefully packaged', 'Custom orders welcome'].map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-[5px] h-[5px] rotate-45 border border-amber-500/40 shrink-0" />
                  <span className="text-[14px] text-stone-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <img src="/frlogorv.png" alt="ForgeRealm" width={80} height={80} className="rounded-xl opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="newspaper-rule" />
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
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400" style={{ fontFamily: "'Jost', sans-serif" }}>This week</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-normal text-white" style={{ fontFamily: "'Cinzel', serif" }}>The <em className="text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Forge</em> Collection</h2>
          </div>
          <a href="#products" className="text-sm text-stone-400 transition hover:text-amber-300">View all &rarr;</a>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {featured.map((item) => (
            <div
              key={item.id}
              onClick={() => onQuickView(item)}
              className="gradient-border group cursor-pointer overflow-hidden rounded-2xl glass glass-hover shrink-0 w-[70vw] snap-start sm:w-auto sm:shrink"
            >
              <div className="relative aspect-square bg-[#e8e8e8]">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="eager" />
                )}
                <div className="absolute left-3 top-3 rounded-full bg-black/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/25 shadow-lg hidden sm:block">
                  Featured
                </div>
              </div>
              <div className="p-3">
                <div className="mt-0.5 flex items-center justify-between">
                  <h3 className="text-sm font-normal text-white sm:text-base" style={{ fontFamily: "'Cinzel', serif" }}>{item.name}</h3>
                  <span className="text-base font-semibold text-amber-300/80 sm:text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.displayPrice}</span>
                </div>
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
      onClick={() => onQuickView(product)}
      className="gradient-border group cursor-pointer overflow-hidden rounded-2xl glass glass-hover"
    >
      {/* Image */}
      <div className={`relative aspect-square ${product.image ? 'bg-[#e8e8e8]' : `bg-gradient-to-br ${style.gradient}`}`}>
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
                  <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === imgIdx ? 'w-4 bg-black/60' : 'w-1 bg-black/20'}`} />
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

        {/* Badge */}
        {product.badge && (
          <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] shadow-lg ${
            product.badge === 'Coming Soon' ? 'bg-black/90 text-stone-300 border border-slate-700/50' :
            product.badge === 'Low Stock' ? 'bg-black/90 text-red-400 border border-red-500/30' :
            product.badge === 'Limited' ? 'bg-black/90 text-amber-400 border border-amber-500/30' :
            'bg-black/90 text-white/90 border border-white/10'
          }`}>
            {product.badge}
          </div>
        )}

        {/* Stock */}
        {product.stock !== null && !isComingSoon && (
          <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium shadow-lg ${isLow ? 'bg-black/90 text-amber-400 border border-amber-500/30' : 'bg-black/90 text-stone-300 border border-white/10'}`}>
            {isSoldOut ? 'Sold out' : `${product.stock} left`}
          </div>
        )}

        {/* Add overlay */}
        {!isComingSoon && !isSoldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAdd}
              className={`w-full rounded-xl py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all backdrop-blur-xl ${
                added
                  ? 'bg-emerald-500/90 text-white scale-[0.97]'
                  : 'bg-white/90 text-slate-900 hover:bg-white shadow-lg shadow-black/20'
              }`}
            >
              {added ? '✓ Added' : 'Add to Basket'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-[13px] sm:text-[15px] font-normal text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>{product.name}</h3>
          <span className="shrink-0 text-[16px] sm:text-[20px] font-semibold text-amber-300/80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{product.displayPrice}</span>
        </div>
        <p className="mt-1 sm:mt-1.5 line-clamp-2 text-[10px] sm:text-[11px] leading-relaxed text-stone-500/80 hidden sm:block">{product.description}</p>
        {isLow && (
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" /></span>
            <p className="text-[10px] font-medium text-amber-400/80">Only {product.stock} left</p>
          </div>
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
        <span className="text-stone-500">-</span>
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
          className="absolute h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        {/* Min thumb */}
        <div
          className={`absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-amber-400 bg-[#111111] shadow-lg shadow-amber-500/20 transition-transform ${dragging === 'min' ? 'scale-125 border-cyan-400' : 'hover:scale-110'}`}
          style={{ left: `${pct(value[0])}%` }}
        />
        {/* Max thumb */}
        <div
          className={`absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-amber-400 bg-[#111111] shadow-lg shadow-amber-500/20 transition-transform ${dragging === 'max' ? 'scale-125 border-cyan-400' : 'hover:scale-110'}`}
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
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">Price Range</h3>
        <PriceRangeSlider value={filters.priceRange} onChange={(v) => onChange({ ...filters, priceRange: v })} />
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">Sort By</h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, sort: opt.value })}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                filters.sort === opt.value
                  ? 'bg-amber-500/12 text-amber-300 font-medium'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">Availability</h3>
        <button
          onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
          className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm transition hover:bg-white/[0.06]"
        >
          <span className={filters.inStock ? 'text-white' : 'text-stone-400'}>In stock only</span>
          <div className={`flex h-5 w-9 items-center rounded-full transition-colors ${filters.inStock ? 'bg-blue-500' : 'bg-white/10'}`}>
            <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Badges */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">Tags</h3>
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
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'border border-white/[0.08] text-stone-500 hover:border-white/15 hover:text-stone-300'
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
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2.5 text-xs font-medium uppercase tracking-wider text-stone-500 transition hover:bg-white/[0.06] hover:text-white"
      >
        Reset all filters
      </button>

      <p className="text-center text-xs text-stone-600">{total} product{total !== 1 ? 's' : ''} found</p>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-[110px] rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm">
          <h2 className="mb-5 text-sm font-bold text-white flex items-center gap-2">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
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
              className="fixed bottom-0 left-0 top-0 z-[80] w-full max-w-xs border-r border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Filters
                </h2>
                <button onClick={onMobileClose} className="rounded-full bg-white/5 p-2 text-stone-400 transition hover:bg-white/10 hover:text-white">
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

function ProductGrid({ search, filters, onQuickView, onFilterMobileOpen }: {
  search: string;
  filters: Filters;
  onQuickView: (p: Product) => void;
  onFilterMobileOpen: () => void;
}) {
  const filtered = products.filter((p) => {
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
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-amber-400" style={{ fontFamily: "'Jost', sans-serif" }}>Browse</p>
          <h2 className="mt-1 text-2xl font-normal text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            The <em className="text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Realm</em>
            <span className="ml-2 text-base font-normal text-stone-500">({sorted.length})</span>
          </h2>
        </div>
        {/* Mobile filter button */}
        <button
          onClick={onFilterMobileOpen}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-stone-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-24 text-center">
          <span className="text-6xl">🔍</span>
          <p className="mt-5 text-lg font-semibold text-stone-300">No prints found</p>
          <p className="mt-1 text-sm text-stone-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-3">
            {sorted.map((p, i) => (
              <ProductCard key={p.id} product={p} onQuickView={onQuickView} index={i} />
            ))}
        </div>
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
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/50"
        >
          <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/60 backdrop-blur-sm transition hover:bg-black/70 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="grid md:grid-cols-2">
            <div className={`relative min-h-[300px] md:min-h-0 ${product.image ? 'bg-[#e8e8e8]' : `bg-gradient-to-br ${style.gradient}`}`}>
              {product.image ? (
                <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
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
                  product.badge === 'Coming Soon' ? 'bg-black/80 text-stone-400' :
                  product.badge === 'Popular' ? 'bg-amber-500/90 text-white' :
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
                <p className="mt-4 text-sm leading-relaxed text-stone-400">{product.description}</p>

                <div className="mt-6 space-y-2.5">
                  {['Eco-friendly PLA material', 'Hand-finished in Leeds', 'Carefully packaged'].map((f) => (
                    <div key={f} className="flex items-center gap-3 text-sm text-stone-400">
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
                      <span className={product.stock <= 3 ? 'text-amber-400' : 'text-stone-400'}>
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
                  isComingSoon ? 'bg-slate-800 text-stone-500 cursor-not-allowed' :
                  isSoldOut ? 'bg-slate-800 text-stone-500 cursor-not-allowed' :
                  'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02]'
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
            className="fixed bottom-0 right-0 top-0 z-[80] flex w-full max-w-md flex-col border-l border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-white">Your Basket</h2>
                {count > 0 && <p className="text-xs text-stone-500">{count} item{count !== 1 ? 's' : ''}</p>}
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-stone-400 transition hover:bg-white/10 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-white/5 p-6">
                    <svg className="h-12 w-12 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <p className="mt-5 text-base font-semibold text-stone-300">Your basket is empty</p>
                  <p className="mt-1 text-sm text-stone-500">Add some prints to get started</p>
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
                          <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ${item.product.image ? 'bg-[#111111]' : `bg-gradient-to-br ${st.gradient}`}`}>
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
                                <p className="text-[11px] text-stone-500">{item.product.displayPrice} each</p>
                              </div>
                              <button onClick={() => remove(item.product.id)} className="rounded-full p-1 text-stone-600 transition hover:bg-red-500/10 hover:text-red-400">
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
                  <button onClick={clear} className="mt-1 text-[11px] text-stone-600 transition hover:text-red-400">Clear basket</button>
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
                  <span className="text-sm text-stone-400">Subtotal</span>
                  <span className="text-2xl font-extrabold text-white">£{(total / 100).toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-amber-500/30"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-600">
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

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500/40 focus:bg-white/[0.08]';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1.5';

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
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <img src="/headfrlogorv.png" alt="ForgeRealm" width={28} height={28} className="rounded-full" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Checkout</h2>
                    <p className="text-xs text-stone-500">{count} item{count !== 1 ? 's'  : ''} - £{(total / 100).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="hidden sm:flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-medium ${step === 'form' ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-stone-500'}`}>1. Details</span>
                    <svg className="h-3 w-3 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className={`rounded-full px-2.5 py-1 font-medium ${step === 'review' ? 'bg-amber-500/15 text-amber-300' : 'bg-white/5 text-stone-500'}`}>2. Review & Pay</span>
                  </div>
                  <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-stone-400 transition hover:bg-white/10 hover:text-white">
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
                          <span className={saveDetails ? 'text-white' : 'text-stone-400'}>Save details for next time</span>
                          <p className="text-[11px] text-stone-600 mt-0.5">Stored locally on this device only</p>
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
                                <p className="text-[11px] text-stone-500">x{item.qty}</p>
                              </div>
                              <span className="text-xs font-semibold text-white">£{((item.product.price * item.qty) / 100).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2">
                        <div className="flex justify-between text-xs text-stone-400">
                          <span>Subtotal</span>
                          <span>£{(total / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-400">
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
                    <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-stone-300 transition hover:bg-white/10 hover:text-white">
                      Back to basket
                    </button>
                    <button
                      onClick={() => { if (isValid) setStep('review'); }}
                      disabled={!isValid}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10">Review Order</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
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
                        <button onClick={() => setStep('form')} className="text-xs text-amber-400 transition hover:text-amber-300">Edit</button>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-stone-300 space-y-1">
                        <p className="font-semibold text-white">{customer.firstName} {customer.lastName}</p>
                        <p>{customer.address1}</p>
                        {customer.address2 && <p>{customer.address2}</p>}
                        <p>{customer.city}, {customer.postcode}</p>
                        <p className="text-stone-500">{customer.email}</p>
                        {customer.phone && <p className="text-stone-500">{customer.phone}</p>}
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
                              <span className="text-[11px] text-stone-500">x{item.qty}</span>
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
                        <div className="flex justify-between text-sm text-stone-400">
                          <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                          <span className="text-white">£{(total / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-stone-400">
                          <span>Shipping</span>
                          <span className={total >= 1500 ? 'text-emerald-400 font-medium' : 'text-white'}>{total >= 1500 ? 'Free' : '£3.50'}</span>
                        </div>
                        <div className="border-t border-white/[0.06] pt-3 flex justify-between">
                          <span className="text-base font-bold text-white">Total</span>
                          <span className="text-xl font-extrabold text-white">£{((total + (total >= 1500 ? 0 : 350)) / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-3 text-sm text-stone-400">
                          <svg className="h-5 w-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          <div>
                            <p className="text-white text-xs font-medium">Secure payment via Stripe</p>
                            <p className="text-[11px] text-stone-500">You'll be redirected to Stripe to complete payment. We never see your card details.</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-amber-500/30 disabled:opacity-50"
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
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                        <button onClick={() => setStep('form')} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-stone-400 transition hover:bg-white/10 hover:text-white">
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
    <footer className="border-t border-amber-500/[0.12] bg-[#080808]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <a href="/" className="group inline-flex items-center gap-2.5">
              <img src="/headfrlogorv.png" alt="ForgeRealm" width={28} height={28} className="h-7 w-7 rounded-full" loading="lazy" />
              <span className="text-[15px] font-semibold tracking-[0.1em] text-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>ForgeRealm</span>
            </a>
            <p className="mt-3 text-[13px] leading-[1.8] text-stone-500" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              Artisan Fantasy Miniatures.<br />Leeds, United Kingdom.
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-stone-600" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Every piece printed, finished, and packed with care.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-300 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: '#products' },
                { label: 'Dragons', href: '#products' },
                { label: 'Voronoi', href: '#products' },
                { label: 'Fidgets', href: '#products' },
                { label: 'Keychains', href: '#products' },
              ].map((l) => (
                <li key={l.label}><a href={l.href} className="text-[13px] text-stone-500 transition hover:text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-300 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Info</h4>
            <ul className="space-y-3">
              {[
                { label: 'Our Story', href: '/#about' },
                { label: 'Custom Orders', href: '/custom-order' },
                { label: 'Contact', href: '/#contact' },
                { label: 'Track Order', href: '/shop/orders' },
              ].map((l) => (
                <li key={l.label}><a href={l.href} className="text-[13px] text-stone-500 transition hover:text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Delivery */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-300 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Delivery</h4>
            <ul className="space-y-3">
              {['UK Shipping', 'International', 'Returns', 'Secure Checkout'].map((l) => (
                <li key={l} className="text-[13px] text-stone-500" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{l}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <div className="w-[6px] h-[6px] rotate-45 bg-amber-500/30" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-stone-600 tracking-[0.04em]" style={{ fontFamily: "'Jost', sans-serif" }}>
            &copy; {new Date().getFullYear()} ForgeRealm. Leeds, UK.
          </span>
          <div className="flex gap-2">
            {['Instagram', 'YouTube', 'GitHub'].map((s) => (
              <span key={s} className="px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-stone-500 border border-amber-500/15 cursor-pointer transition hover:border-amber-500/40 hover:text-amber-300" style={{ fontFamily: "'Jost', sans-serif" }}>{s}</span>
            ))}
          </div>
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
      <div className="min-h-screen bg-[#0a0a0a] text-white aurora-bg">
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

        {/* Sidebar + Grid layout */}
        <div id="products" className="mx-auto max-w-7xl px-4 py-8 sm:py-14 sm:px-6 lg:px-8">
          <Reveal>
            <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
              <a href="/" className="hover:text-white transition">Home</a>
              <span>/</span>
              <span className="text-stone-300">Shop</span>
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
        <section className="relative overflow-hidden border-t border-amber-500/[0.12]">
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/[0.04] blur-[180px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-12 sm:py-20 text-center sm:px-6">
            <h2 className="text-2xl font-normal text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Cinzel', serif" }}>
              Commission a <em className="text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>Custom Piece</em>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-stone-400" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              Tell us your vision and we'll forge it into reality. Every custom order is hand-finished in Leeds.
            </p>
            <div className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <a href="/custom-order" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:-translate-y-0.5">
                <span className="relative z-10">Get a custom quote</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
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
