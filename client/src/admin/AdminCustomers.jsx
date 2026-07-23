import { useEffect, useState } from 'react';
import { userApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AdminCustomers() {
  const { isAdmin } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = () => {
    setLoading(true);
    userApi
      .customers(search ? { search } : {})
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleBlock = async (c) => {
    try {
      await userApi.toggleBlock(c._id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const viewHistory = async (c) => {
    setHistoryFor(c);
    setHistoryLoading(true);
    try {
      const data = await userApi.customerBookings(c._id);
      setHistory(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <p className="text-slate-500">Manage customer accounts and view history.</p>

      <div className="mt-4">
        <input
          className="input max-w-sm"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="mt-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {c.isBlocked ? (
                      <span className="badge bg-red-100 text-red-700">Blocked</span>
                    ) : (
                      <span className="badge bg-green-100 text-green-700">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-outline btn-sm" onClick={() => viewHistory(c)}>
                        History
                      </button>
                      {isAdmin() && (
                        <button
                          className={c.isBlocked ? 'btn-outline btn-sm' : 'btn-danger btn-sm'}
                          onClick={() => toggleBlock(c)}
                        >
                          {c.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!historyFor}
        title={`Booking History — ${historyFor?.name || ''}`}
        onClose={() => setHistoryFor(null)}
      >
        {historyLoading ? (
          <Spinner />
        ) : history.length === 0 ? (
          <p className="text-slate-400">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{b.station?.name}</p>
                  <p className="text-xs text-slate-400">
                    {b.date} · {b.startTime}–{b.endTime} · ৳{b.totalPrice}
                  </p>
                </div>
                <StatusBadge value={b.status} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
