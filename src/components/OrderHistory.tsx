import { useEffect, useState } from 'react';
import { FiPackage, FiTruck, FiCheck, FiX, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';

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

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: number;
  status: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal_pence: number;
  shipping_pence: number;
  total_pence: number;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof FiPackage }> = {
  pending: { color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/20', icon: FiPackage },
  paid: { color: 'text-blue-300', bg: 'bg-blue-500/15 border-blue-500/20', icon: FiPackage },
  shipped: { color: 'text-cyan-300', bg: 'bg-cyan-500/15 border-cyan-500/20', icon: FiTruck },
  delivered: { color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/20', icon: FiCheck },
  cancelled: { color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/20', icon: FiX },
  refunded: { color: 'text-red-300', bg: 'bg-red-500/15 border-red-500/20', icon: FiX },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.bg}`}>
          <StatusIcon className={`text-lg ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">Order #{String(order.id).padStart(5, '0')}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {date} &middot; {order.items.length} item{order.items.length !== 1 ? 's' : ''} &middot; &pound;{(order.total_pence / 100).toFixed(2)}
          </p>
        </div>
        {expanded ? <FiChevronUp className="text-slate-500 shrink-0" /> : <FiChevronDown className="text-slate-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-5 pt-4 sm:px-5 space-y-4">
          {/* Items */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-500">x{item.qty}</p>
                  </div>
                  <span className="text-xs font-semibold text-white">&pound;{((item.price * item.qty) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Payment</h4>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">&pound;{(order.subtotal_pence / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Shipping</span>
                <span className={order.shipping_pence === 0 ? 'text-emerald-400' : 'text-white'}>
                  {order.shipping_pence === 0 ? 'Free' : `\u00A3${(order.shipping_pence / 100).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.06]">
                <span>Total</span>
                <span>&pound;{(order.total_pence / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Shipping</h4>
              {order.shipping_address ? (
                <p className="text-xs text-slate-300 leading-relaxed">{order.shipping_address}</p>
              ) : (
                <p className="text-xs text-slate-500 italic">No address on file</p>
              )}
              {order.tracking_number && (
                <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1.5 mt-2">
                  <FiTruck className="text-cyan-400 text-xs" />
                  <span className="text-xs font-medium text-cyan-300">Tracking: {order.tracking_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function OrderSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-white/[0.06]" />
          <div className="h-3 w-56 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('forgerealm_admin_token');
        if (!token) { window.location.href = '/shop/sign-in'; return; }

        const res = await fetch(`${API_BASE}/api/orders`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) { window.location.href = '/shop/sign-in'; return; }
          throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/" className="hover:text-white transition">Home</a>
        <span>/</span>
        <a href="/shop/dashboard" className="hover:text-white transition">Dashboard</a>
        <span>/</span>
        <span className="text-slate-300">Orders</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Order History</h1>
          <p className="mt-1 text-sm text-slate-400">
            {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'Track your ForgeRealm orders'}
          </p>
        </div>
        <a
          href="/shop/dashboard"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <FiArrowLeft className="text-sm" />
          Dashboard
        </a>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10">
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-20 text-center">
          <div className="rounded-full bg-white/5 p-6">
            <FiPackage className="h-12 w-12 text-slate-600" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-300">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Visit the shop to place your first order</p>
          <a
            href="/shop"
            className="mt-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30"
          >
            Browse Shop
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
