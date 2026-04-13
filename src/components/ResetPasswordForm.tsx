import { useState, useEffect } from 'react';
import { FiLock, FiCheck, FiAlertCircle } from 'react-icons/fi';

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

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.08]';

export default function ResetPasswordForm() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!token) {
      setErrorMsg('Invalid reset link. Please request a new one.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Reset failed. The link may have expired.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
        {status === 'success' ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <FiCheck className="text-2xl text-emerald-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Password Reset!</h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <a
              href="/shop/sign-in"
              className="mt-8 block w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30"
            >
              Sign In
            </a>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <FiLock className="text-2xl text-blue-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Set New Password</h1>
              <p className="mt-2 text-sm text-slate-400">
                Choose a strong password for your ForgeRealm account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className={inputClass}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className={inputClass}
                  required
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  <FiAlertCircle className="shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50"
              >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/shop/forgot-password" className="text-sm text-slate-400 transition hover:text-white">
                Request a new reset link
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
