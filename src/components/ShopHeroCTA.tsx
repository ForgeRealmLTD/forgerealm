import { useEffect, useState } from 'react';

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

const ShopHeroCTA = () => {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const token = localStorage.getItem('forgerealm_admin_token');
      if (!token) {
        setHasSession(false);
        return;
      }
      fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => setHasSession(res.ok))
        .catch(() => setHasSession(false));
    };
    update();
    window.addEventListener('forgerealm-admin-token-changed', update);
    return () => {
      window.removeEventListener('forgerealm-admin-token-changed', update);
    };
  }, []);

  if (hasSession) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-900 text-emerald-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide shadow-md shadow-emerald-500/30 whitespace-nowrap">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        Welcome
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/shop/sign-in';
        }
      }}
      className="inline-flex w-fit items-center gap-2 rounded-full bg-white text-blue-700 px-5 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-blue-100 transition-colors shadow-md shadow-blue-500/20 whitespace-nowrap"
    >
      Sign In
    </button>
  );
};

export default ShopHeroCTA;
