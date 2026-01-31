import { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  email?: string | null;
  role: string;
  created_at: string;
};

const envBase =
  typeof import.meta !== 'undefined' && typeof import.meta.env.PUBLIC_API_URL === 'string'
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, '')
    : '';
const API_BASE = envBase || 'http://localhost:4000';

const AdminUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('forgerealm_admin_token') : null;
        if (!token) {
          throw new Error('Admin token missing. Sign in first.');
        }
        const res = await fetch(`${API_BASE}/api/users`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` }
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error || 'Unable to load users');
        }
        setUsers(body);
      } catch (err: any) {
        setError(err.message || 'Unable to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-500/10 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Users</p>
          <h3 className="text-2xl font-semibold text-white">Player Directory</h3>
        </div>
        <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
          {users.length} total
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                  Loading users...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-red-200">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-3 py-3 font-semibold text-white">{user.username}</td>
                  <td className="px-3 py-3 text-slate-300">{user.email || '—'}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersList;
