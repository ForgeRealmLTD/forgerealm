import { useEffect, useState } from 'react';
import { FiUser, FiLock, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';

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

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.08]';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5';

export default function AccountSettings() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);

    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', msg: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', msg: 'Passwords do not match' });
      return;
    }

    setPwSubmitting(true);
    try {
      const token = localStorage.getItem('forgerealm_admin_token');
      const res = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPwStatus({ type: 'success', msg: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwStatus({ type: 'error', msg: data.error || 'Failed to update password' });
      }
    } catch {
      setPwStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('forgerealm_admin_token');
    window.dispatchEvent(new Event('forgerealm-admin-token-changed'));
    window.location.href = '/shop/sign-in';
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/" className="hover:text-white transition">Home</a>
        <span>/</span>
        <a href="/shop/dashboard" className="hover:text-white transition">Dashboard</a>
        <span>/</span>
        <span className="text-slate-300">Account</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Account Settings</h1>
        <a
          href="/shop/dashboard"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <FiArrowLeft className="text-sm" />
          Dashboard
        </a>
      </div>

      {/* Profile Card */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 backdrop-blur">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-blue-400">
            <FiUser className="text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Profile</h2>
            <p className="text-xs text-slate-500">Your account information</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Username</label>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
              {user?.username || '-'}
            </div>
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300 border border-blue-500/20">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 backdrop-blur">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-cyan-400">
            <FiLock className="text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Change Password</h2>
            <p className="text-xs text-slate-500">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className={inputClass}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={inputClass}
                required
                minLength={8}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={inputClass}
                required
              />
            </div>
          </div>

          {pwStatus && (
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              pwStatus.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                : 'border-red-500/20 bg-red-500/5 text-red-300'
            }`}>
              {pwStatus.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
              {pwStatus.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={pwSubmitting}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-50"
          >
            {pwSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* Logout */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Sign Out</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sign out of your ForgeRealm account on this device</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:border-red-500/30"
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
