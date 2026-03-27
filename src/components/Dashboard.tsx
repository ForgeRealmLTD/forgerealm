import { useEffect, useState } from 'react';
import { FiUser, FiShoppingBag, FiMail, FiHeart, FiSettings, FiStar, FiGift, FiBookOpen, FiMessageCircle, FiTruck, FiAward, FiZap } from 'react-icons/fi';

const envBase =
  typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PUBLIC_API_URL === 'string'
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, '')
    : '';

const envLocal =
  typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PUBLIC_API_URL_LOCAL === 'string'
    ? import.meta.env.PUBLIC_API_URL_LOCAL.trim().replace(/\/$/, '')
    : '';

const API_BASE =
  typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost')
    ? envLocal || ''
    : envBase || '';

/* ═══════════════════════════ CSS Injection ═══════════════════════════ */

const DASHBOARD_CSS = `
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
@keyframes glow-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
@keyframes gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes border-dance { 0% { border-color: rgba(59,130,246,0.3); } 33% { border-color: rgba(6,182,212,0.3); } 66% { border-color: rgba(16,185,129,0.3); } 100% { border-color: rgba(59,130,246,0.3); } }
.db-shimmer-bg { background: linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.08) 50%, transparent 67%); background-size: 200% 100%; animation: shimmer 3s infinite; }
.db-glow-breathe { animation: glow-pulse 4s ease-in-out infinite; }
.db-gradient-text-flow { background-size: 200% auto; animation: gradient-flow 4s ease infinite; }
.db-card-shine { position: relative; overflow: hidden; }
.db-card-shine::after { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%); transform: translateX(-100%); transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); pointer-events: none; }
.db-card-shine:hover::after { transform: translateX(100%); }
.db-card-tilt { transition: transform 0.4s cubic-bezier(0.03,0.98,0.52,0.99); perspective: 800px; }
.db-card-tilt:hover { transform: translateY(-8px) rotateX(2deg) rotateY(-1deg) scale(1.02); }
@keyframes border-glow-rotate { 0% { --angle: 0deg; } 100% { --angle: 360deg; } }
.db-glow-border { position: relative; }
.db-glow-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: conic-gradient(from var(--angle, 0deg), transparent 60%, rgba(59,130,246,0.4) 75%, rgba(6,182,212,0.4) 85%, transparent 95%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.5s ease; pointer-events: none; animation: border-glow-rotate 4s linear infinite; }
.db-glow-border:hover::before { opacity: 1; }
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById('fr-dashboard-css')) return;
    const el = document.createElement('style');
    el.id = 'fr-dashboard-css';
    el.textContent = DASHBOARD_CSS;
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);
  return null;
}

/* ═══════════════════════════ Types & Data ═══════════════════════════ */

interface UserData {
  username: string;
  role: string;
  email?: string;
}

const featuredProducts = [
  {
    title: 'Dragon Guardian',
    category: 'Display Model',
    description: 'Hand-finished matte dragon with intricate scale detail. Plant-based PLA+.',
    badge: 'Popular',
    badgeClass: 'bg-blue-500/90 text-white',
    icon: '\u{1F409}',
    gradient: 'from-blue-900/60 via-indigo-900/40 to-slate-900/80',
  },
  {
    title: 'Aurora Bloom Lamp',
    category: '3D Printed Lamp',
    description: 'Gradient lamp shade with a soft spiral that diffuses light into a warm glow.',
    badge: 'New',
    badgeClass: 'bg-emerald-500/90 text-white',
    icon: '\u{1F4A1}',
    gradient: 'from-emerald-900/60 via-teal-900/40 to-slate-900/80',
  },
  {
    title: 'Hex Dice Tower',
    category: 'Accessories',
    description: 'Modular hexagonal tower with felt-lined tray. Satin finish.',
    badge: 'Limited',
    badgeClass: 'bg-amber-500/90 text-white',
    icon: '\u{1F3B2}',
    gradient: 'from-amber-900/60 via-orange-900/40 to-slate-900/80',
  },
];

const quickLinks = [
  { label: 'My Account', icon: FiUser, href: '#account', description: 'Profile & preferences' },
  { label: 'Wishlist', icon: FiHeart, href: '#wishlist', description: 'Saved items' },
  { label: 'Orders', icon: FiTruck, href: '#orders', description: 'Track your prints' },
  { label: 'Rewards', icon: FiAward, href: '#rewards', description: 'Points & perks' },
  { label: 'Messages', icon: FiMessageCircle, href: '#messages', description: 'Notifications' },
  { label: 'Settings', icon: FiSettings, href: '#settings', description: 'App settings' },
];

const exploreLinks = [
  { label: 'Collections', icon: FiBookOpen, href: '#collections', description: 'Browse curated drops' },
  { label: 'New Arrivals', icon: FiZap, href: '#new', description: 'Fresh off the print bed' },
  { label: 'Gift Cards', icon: FiGift, href: '#gifts', description: 'Give the gift of craft' },
  { label: 'Favourites', icon: FiStar, href: '#favourites', description: 'Community top picks' },
];

/* ═══════════════════════════ Dashboard ═══════════════════════════ */

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('forgerealm_admin_token');
        if (!token) { window.location.href = '/shop/sign-in'; return; }
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { window.location.href = '/shop/sign-in'; return; }
        const data = await res.json();
        setUser(data.user);
      } catch {
        window.location.href = '/shop/sign-in';
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#0a0f1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-400/30 blur-xl db-glow-breathe" />
            <div className="relative h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 animate-pulse">
            Loading your realm...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <InjectStyles />

      {/* Noise overlay - same as shop */}
      <div className="noise-overlay" />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/25 blur-[200px] db-glow-breathe" />
        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[180px] db-glow-breathe" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[160px] db-glow-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[140px] db-glow-breathe" style={{ animationDelay: '3s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/20 blur-sm"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              left: `${15 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + Math.random() * 4}s`,
              animation: `float ${5 + Math.random() * 4}s ease-in-out infinite ${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">

        {/* ── Hero greeting ── */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
          <div className="absolute inset-0 db-shimmer-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-blue-300 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {greeting}
                </div>
                <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent db-gradient-text-flow">
                    {user?.username || 'Adventurer'}
                  </span>
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-slate-400">
                  Your portal to the ForgeRealm. Explore featured prints, track orders, and unlock rewards.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-400 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Online
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  <FiUser className="text-sm text-blue-400" />
                  {user?.role || 'Member'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Shop CTA - Coming Soon ── */}
        <section className="db-card-shine db-glow-border relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-amber-950/30 via-white/[0.04] to-white/[0.02] backdrop-blur-xl">
          <div className="absolute inset-0 db-shimmer-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(251,169,58,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-400/20 blur-xl db-glow-breathe" />
                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                  <FiShoppingBag className="text-2xl sm:text-3xl text-amber-400" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-white sm:text-2xl">ForgeRealm Shop</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </span>
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400 max-w-xl">
                  We're putting the finishing touches on our shop experience — fine-tuning checkout, inventory, and the drop system.
                  We'll be sure to let you know the moment it's ready. Stay in touch with us in the meantime!
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href="/subscribe"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <FiMail className="text-sm" />
                      Get Notified
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-400 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur transition-all hover:border-white/25 hover:bg-white/10"
                  >
                    <FiMessageCircle className="text-sm" />
                    Stay in Touch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="relative border-t border-white/5 pt-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400/80">Highlights</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Featured prints</h2>
            </div>
            <span className="text-sm text-slate-400">Preview</span>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <div
                key={product.title}
                className="db-card-shine db-glow-border db-card-tilt group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:shadow-2xl hover:shadow-blue-500/15"
              >
                <div className={`relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-gradient-to-br ${product.gradient}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(255,255,255,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.15),transparent_50%)]" />
                  <div className="absolute -right-4 -top-4 text-[120px] opacity-[0.07] select-none blur-[1px]">{product.icon}</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl opacity-30 transition-all duration-700 group-hover:scale-125 group-hover:opacity-50 group-hover:rotate-12 select-none drop-shadow-lg">
                      {product.icon}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${product.badgeClass}`}>
                    {product.badge}
                  </div>
                </div>
                <div className="relative z-10 p-4">
                  <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">{product.category}</p>
                  <h3 className="mt-0.5 text-sm font-semibold text-white">{product.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{product.description}</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-blue-400/60">Available when shop launches</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick Access Portal ── */}
        <section className="relative border-t border-white/5 pt-8">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400/80">Quick Access</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Your Portal</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="db-card-shine db-glow-border db-card-tilt group flex flex-col items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center backdrop-blur transition hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-blue-400 transition group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-300">
                  <link.icon className="text-lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{link.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Explore the Realm ── */}
        <section className="relative border-t border-white/5 pt-8">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400/80">Discover</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Explore the Realm</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {exploreLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="db-card-shine db-glow-border group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur transition hover:bg-white/[0.06] hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-cyan-400 transition group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 group-hover:text-cyan-300">
                  <link.icon className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                  <p className="text-[11px] text-slate-500">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Status Bar ── */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">All Systems Operational</p>
                <p className="text-[11px] text-slate-500">ForgeRealm services running smoothly</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'API', color: 'bg-emerald-400' },
                { label: 'Auth', color: 'bg-emerald-400' },
                { label: 'Shop', color: 'bg-amber-400' },
              ].map((s) => (
                <span key={s.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer note ── */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-600">
            More features coming soon — this is just the beginning
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
