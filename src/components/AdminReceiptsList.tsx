import { useEffect, useState } from 'react';

type Receipt = {
  id: number;
  order_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  subtotal_pence: number;
  shipping_pence: number;
  total_pence: number;
  created_at: string;
};

const envBase =
  typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PUBLIC_API_URL === 'string'
    ? import.meta.env.PUBLIC_API_URL.trim().replace(/\/$/, '')
    : '';
const API_BASE = envBase || 'http://localhost:8080';

const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;

const AdminReceiptsList = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('forgerealm_admin_token') : null;
    if (!token) { setError('Admin token missing. Sign in first.'); setLoading(false); return; }

    fetch(`${API_BASE}/api/receipts`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error || 'Failed to load')))
      .then(setReceipts)
      .catch((e) => setError(typeof e === 'string' ? e : 'Failed to load receipts'))
      .finally(() => setLoading(false));
  }, []);

  const openTemplate = () => {
    const token = localStorage.getItem('forgerealm_admin_token');
    fetch(`${API_BASE}/api/receipts/template`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.blob() : Promise.reject('Failed'))
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
      .catch(() => alert('Could not load template'));
  };

  const downloadPdf = (id: number, invoiceNumber: string) => {
    const token = localStorage.getItem('forgerealm_admin_token');
    fetch(`${API_BASE}/api/receipts/${id}/pdf`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.blob() : Promise.reject('Download failed'))
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNumber.replace('#', '')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Could not download PDF'));
  };

  if (loading) return (
    <div className="py-20 text-center text-slate-400">Loading receipts...</div>
  );

  if (error) return (
    <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
  );

  if (!receipts.length) return (
    <div className="py-20 text-center text-slate-400">No receipts yet. They appear here after completed Stripe payments.</div>
  );

  return (
    <div className="space-y-6">

      {/* Template invoice card */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-400/20 bg-blue-500/5 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-300 mb-1">Sample</p>
          <p className="text-sm font-semibold text-white">Template Invoice</p>
          <p className="text-xs text-slate-400 mt-0.5">Preview the invoice layout used for all orders.</p>
        </div>
        <button
          onClick={openTemplate}
          className="shrink-0 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/20 hover:text-white transition"
        >
          View Template
        </button>
      </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-blue-500/10 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
        <p className="text-sm text-slate-300">{receipts.length} receipt{receipts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-400">
              <th className="px-6 py-3 text-left">Invoice</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
              <th className="px-6 py-3 text-right">Shipping</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-center">PDF</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-white/5 transition-colors hover:bg-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
              >
                <td className="px-6 py-3 font-mono text-blue-300 text-xs whitespace-nowrap">{r.invoice_number}</td>
                <td className="px-6 py-3 text-white whitespace-nowrap">{r.customer_name || '—'}</td>
                <td className="px-6 py-3 text-slate-400 whitespace-nowrap">{r.customer_email || '—'}</td>
                <td className="px-6 py-3 text-right text-slate-300 whitespace-nowrap">{gbp(r.subtotal_pence)}</td>
                <td className="px-6 py-3 text-right text-slate-300 whitespace-nowrap">
                  {r.shipping_pence === 0 ? <span className="text-emerald-400">Free</span> : gbp(r.shipping_pence)}
                </td>
                <td className="px-6 py-3 text-right font-semibold text-white whitespace-nowrap">{gbp(r.total_pence)}</td>
                <td className="px-6 py-3 text-slate-400 whitespace-nowrap text-xs">
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => downloadPdf(r.id, r.invoice_number)}
                    className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/20 hover:text-white transition"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    </div>
  );
};

export default AdminReceiptsList;
