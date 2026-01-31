import { useEffect, useState } from 'react';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { FaShoppingBag } from 'react-icons/fa';

type Link = { label: string; href: string };

const envBase =
  typeof import.meta !== 'undefined' && typeof import.meta.env.PUBLIC_API_URL === 'string'
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, '')
    : '';

const envLocal =
  typeof import.meta !== 'undefined' && typeof import.meta.env.PUBLIC_API_URL_LOCAL === 'string'
    ? import.meta.env.PUBLIC_API_URL_LOCAL.trim().replace(/\/$/, '')
    : '';

const API_BASE =
  (typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost')
    ? envLocal || ''
    : envBase || '');

const baseLinks: Link[] = [
  { label: 'Popular', href: '#products' },
  { label: 'Collections', href: '#collections' }
];

const ShopNavbar = () => {
  const [open, setOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (open) setOpen(false);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateToken = () => {
      const token = localStorage.getItem('forgerealm_admin_token');
      if (!token) {
        setAuthRole(null);
        return;
      }
      fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) {
            setAuthRole(null);
            return;
          }
          const body = await res.json().catch(() => ({}));
          setAuthRole(body?.user?.role || 'user');
        })
        .catch(() => setAuthRole(null));
    };

    updateToken();
    window.addEventListener('forgerealm-admin-token-changed', updateToken);

    return () => {
      window.removeEventListener('forgerealm-admin-token-changed', updateToken);
    };
  }, []);

  const isAuthed = Boolean(authRole);
  const links: (Link & { isLogout?: boolean })[] = isAuthed
    ? [
        ...baseLinks,
        ...(authRole === 'admin' ? [{ label: 'Users', href: '/shop/users' }] : []),
        { label: 'LOGOUT', href: '#', isLogout: true }
      ]
    : [...baseLinks, { label: 'Sign In', href: '/shop/sign-in' }];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
        .catch(() => {})
        .finally(() => {
          localStorage.removeItem('forgerealm_admin_token');
          window.dispatchEvent(new Event('forgerealm-admin-token-changed'));
          setAuthRole(null);
          window.location.href = '/shop';
        });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between rounded-full border border-white/20 bg-slate-950/70 px-5 py-3 shadow-lg shadow-blue-500/15 backdrop-blur">
          <a href="/" className="inline-flex items-center gap-2 text-white" aria-label="ForgeRealm home">
            <img src="/frowl.webp" alt="ForgeRealm Logo" width={32} height={32} className="h-8 w-8 rounded-full" loading="eager" />
            <span className="font-extrabold tracking-[0.2em] text-xs uppercase">
              Forge<span className="text-blue-300">Realm</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            {isAuthed && (
              <div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                title="Logged in"
                aria-label="Logged in"
              >
                <FiUser className="text-sm" />
                Logged in
              </div>
            )}
            {links.map((link) =>
              link.isLogout ? (
                <button
                  key={link.label}
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm shadow-red-500/30 transition hover:bg-red-400"
                >
                  <FiLogOut className="text-sm" />
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative transition-colors hover:text-white after:absolute after:left-0 after:bottom-[-6px] after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 font-bold tracking-wide shadow-sm hover:bg-blue-100 transition"
            >
              <FaShoppingBag className="text-blue-600" />
              Main Site
            </a>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-white text-2xl"
            aria-label="Open menu"
          >
            <HiOutlineMenu />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-30 w-64 bg-slate-950/90 backdrop-blur border-l border-white/10 p-6 transform transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-white font-semibold tracking-wide uppercase text-xs">Menu</span>
          <button onClick={() => setOpen(false)} className="text-white text-2xl" aria-label="Close menu">
            <HiX />
          </button>
        </div>
        <nav className="flex flex-col gap-4 text-sm uppercase tracking-wide text-slate-200">
          {isAuthed && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              <FiUser className="text-sm" />
              Logged in
            </div>
          )}
          {links.map((link) =>
            link.isLogout ? (
              <button
                key={link.label}
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm shadow-red-500/30 transition hover:bg-red-400"
              >
                <FiLogOut className="text-sm" />
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-white/10 transition"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="/"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 font-semibold tracking-wide shadow hover:bg-blue-100 transition"
          >
            <FaShoppingBag className="text-blue-600" />
            Main Site
          </a>
        </nav>
      </aside>
    </header>
  );
};

export default ShopNavbar;
