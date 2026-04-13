import { useState } from 'react';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';

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

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('sent');
      } else {
        // Always show success to prevent email enumeration
        setStatus('sent');
      }
    } catch {
      setStatus('sent'); // Don't reveal if email exists
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
        {status === 'sent' ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <FiCheck className="text-2xl text-emerald-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Check your inbox</h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              If an account exists for <span className="text-white font-medium">{email}</span>, we've sent a password reset link. Check your email and follow the instructions.
            </p>
            <a
              href="/shop/sign-in"
              className="mt-8 block w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30"
            >
              Back to Sign In
            </a>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <FiMail className="text-2xl text-blue-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
              <p className="mt-2 text-sm text-slate-400">
                Enter the email address associated with your account and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/shop/sign-in" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
                <FiArrowLeft className="text-xs" />
                Back to Sign In
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
