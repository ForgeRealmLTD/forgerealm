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

interface UserData {
  username: string;
  role: string;
  email?: string;
}

const featuredProducts = [
  {
    title: 'Dragon Guardian',
    category: 'Figurines',
    description: 'Hand-finished matte dragon with intricate scale detail. Plant-based PLA+.',
    badge: 'Popular',
    gradient: 'from-blue-500/20 via-indigo-500/15 to-purple-500/10',
    badgeColor: 'bg-blue-500/20 text-blue-200',
    accent: 'border-blue-500/30',
  },
  {
    title: 'Halo Orb Lamp',
    category: 'Lighting',
    description: 'Gradient ambient lamp with soft-bounce diffusion. USB-C powered.',
    badge: 'New',
    gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
    badgeColor: 'bg-emerald-500/20 text-emerald-200',
    accent: 'border-emerald-500/30',
  },
  {
    title: 'Hex Dice Tower',
    category: 'Accessories',
    description: 'Modular hexagonal tower with felt-lined tray. Satin finish.',
    badge: 'Limited',
    gradient: 'from-amber-500/20 via-orange-500/15 to-red-500/10',
    badgeColor: 'bg-amber-500/20 text-amber-200',
    accent: 'border-amber-500/30',
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
        if (!token) {
          window.location.href = '/shop/sign-in';
          return;
        }
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          window.location.href = '/shop/sign-in';
          return;
        }
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80 animate-pulse">
            Loading your realm...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-16 space-y-6 sm:space-y-8">
      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-indigo-500/15 to-slate-900/80 p-5 sm:p-8 shadow-2xl shadow-blue-500/15 backdrop-blur">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-blue-200/80">{greeting}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                {user?.username || 'Adventurer'}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-200/80 max-w-lg">
              Your portal to the ForgeRealm. Explore featured prints, track orders, and unlock rewards.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-blue-200/80">
              <FiUser className="text-sm" />
              {user?.role || 'Member'}
            </div>
          </div>
        </div>
      </section>

      {/* Shop CTA - Coming Soon */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-900/60 p-5 sm:p-8 shadow-lg shadow-amber-500/10 backdrop-blur group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(251,169,58,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 shadow-inner">
            <FiShoppingBag className="text-2xl sm:text-3xl text-amber-300" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">ForgeRealm Shop</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-slate-200/80 max-w-xl">
              We're putting the finishing touches on our shop experience — fine-tuning checkout, inventory, and the drop system.
              We'll be sure to let you know the moment it's ready. Stay in touch with us in the meantime!
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-md shadow-amber-500/30 transition hover:-translate-y-[1px] hover:bg-amber-400"
              >
                <FiMail className="text-sm" />
                Get Notified
              </a>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-[1px] hover:bg-white/10"
              >
                <FiMessageCircle className="text-sm" />
                Stay in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-blue-200/80">Featured</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Spotlight Prints</h2>
          </div>
          <span className="text-xs uppercase tracking-wide text-slate-400">Preview</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.title}
              className={`group relative overflow-hidden rounded-2xl border ${product.accent} bg-gradient-to-br ${product.gradient} p-5 backdrop-blur shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl`}
            >
              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full ${product.badgeColor} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider`}>
                    {product.badge}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{product.category}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{product.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-300/70">
                    Available when shop launches
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-blue-200/80">Quick Access</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Your Portal</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur transition hover:-translate-y-[2px] hover:border-blue-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 transition group-hover:bg-blue-500/25 group-hover:text-blue-200">
                <link.icon className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{link.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Explore Section */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-blue-200/80">Discover</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Explore the Realm</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {exploreLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-[1px] hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 transition group-hover:bg-cyan-500/25">
                <link.icon className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{link.label}</p>
                <p className="text-[11px] text-slate-400">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Status Bar */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="absolute h-3 w-3 rounded-full bg-emerald-400/40 animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">All Systems Operational</p>
              <p className="text-[11px] text-slate-400">ForgeRealm services running smoothly</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              API
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Auth
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Shop
            </span>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="text-center pt-2 pb-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
          More features coming soon — this is just the beginning
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
