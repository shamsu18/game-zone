import { useEffect, useState } from 'react';
import { paymentApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const FILTERS = ['', 'paid', 'unpaid', 'refunded'];

export default function AdminPayments() {
  const { isAdmin } = useAuthStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [refundTarget, setRefundTarget] = useState(null);
  const [refunding, setRefunding] = useState(false);

  const load = () => {
    setLoading(true);
    paymentApi
      .list(filter ? { paymentStatus: filter } : {})
      .then(setPayments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const markPaid = async (id) => {
    try {
      await paymentApi.markPaid(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const doRefund = async () => {
    setRefunding(true);
    try {
      await paymentApi.refund(refundTarget._id);
      setRefundTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Payments</h1>
      <p className="text-slate-500">Payment history and refunds.</p>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f ? 'bg-brand text-white' : 'bg-white ring-1 ring-slate-200'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {error && <div className="mt-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.station?.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.date} · {p.startTime}–{p.endTime}
                    </p>
                  </td>
                  <td className="px-4 py-3">{p.user?.name || '—'}</td>
                  <td className="px-4 py-3">৳{p.totalPrice}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={p.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {p.paymentStatus === 'unpaid' && (
                        <button className="btn-outline btn-sm" onClick={() => markPaid(p._id)}>
                          Mark Paid
                        </button>
                      )}
                      {isAdmin() && p.paymentStatus === 'paid' && (
                        <button className="btn-danger btn-sm" onClick={() => setRefundTarget(p)}>
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No payment records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!refundTarget}
        title="Refund payment?"
        message={`Refund ৳${refundTarget?.totalPrice} for ${refundTarget?.user?.name || 'this booking'}?`}
        confirmText="Refund"
        loading={refunding}
        onConfirm={doRefund}
        onClose={() => setRefundTarget(null)}
      />
    </div>
  );
}
