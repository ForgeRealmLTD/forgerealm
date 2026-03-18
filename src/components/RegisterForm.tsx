import type { FormEvent } from 'react';
import { useState } from 'react';

const envBase =
  typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PUBLIC_API_URL === 'string'
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, '')
    : '';

const envLocal =
  typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PUBLIC_API_URL_LOCAL === 'string'
    ? import.meta.env.PUBLIC_API_URL_LOCAL.trim().replace(/\/$/, '')
    : '';

// Prefer local API when running from localhost; fallback to prod base.
const API_BASE =
  (typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost')
    ? envLocal || ''
    : envBase || '');

const logDebug = (..._args: unknown[]) => {};

type Status =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | { type: 'info'; message: string };

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [loading, setLoading] = useState(false);
  const redirectToShop = () => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.includes('/shop/register')) {
      window.location.assign('/shop/sign-in');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle' });
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Registration failed');
      }

      await res.json().catch(() => ({}));
      setStatus({ type: 'success', message: 'Account created! Check your inbox to verify, then sign in.' });
      redirectToShop();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-500/10 backdrop-blur">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-400/10" />
      <div className="relative flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Create Account</p>
          <h3 className="text-2xl font-semibold text-white">Enter the Realm</h3>
          <p className="text-sm text-slate-200/80">Forge your profile to save favorites and shop.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleRegister}>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-300">Username</span>
            <input
              className={`w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 shadow-inner focus:border-blue-400 focus:outline-none placeholder-slate-500 ${
                username ? 'text-white' : 'text-slate-400'
              }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-300">Email</span>
            <input
              type="email"
              className={`w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 shadow-inner focus:border-blue-400 focus:outline-none placeholder-slate-500 ${
                email ? 'text-white' : 'text-slate-400'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-300">Password</span>
            <input
              type="password"
              className={`w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 shadow-inner focus:border-blue-400 focus:outline-none placeholder-slate-500 ${
                password ? 'text-white' : 'text-slate-400'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              autoComplete="new-password"
              required
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden rounded-full p-[2px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 group"
            >
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#3b82f6_20%,#06b6d4_40%,#3b82f6_60%,#ffffff_80%,#3b82f6_100%)]" />
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite_reverse] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#06b6d4_25%,#3b82f6_50%,#06b6d4_75%,#ffffff_100%)] opacity-60" />
              <span className="relative inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-400">
                {loading ? 'Working...' : 'Register'}
              </span>
            </button>
          </div>
        </form>

        {status.type !== 'idle' && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                : status.type === 'error'
                ? 'border-red-400/40 bg-red-500/10 text-red-100'
                : 'border-blue-400/30 bg-blue-500/10 text-blue-100'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </section>
  );
};

export default RegisterForm;
