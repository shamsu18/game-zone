import { useEffect, useState } from 'react';
import { bookingApi, stationApi, paymentApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [walkInOpen, setWalkInOpen] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    bookingApi
      .listAll(params)
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filters]);
  useEffect(() => {
    stationApi.list({ all: 'true' }).then(setStations).catch(() => {});
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, status);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const markPaid = async (id) => {
    try {
      await paymentApi.markPaid(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-slate-500">All customer and walk-in bookings.</p>
        </div>
        <button className="btn-primary" onClick={() => setWalkInOpen(true)}>
          + Walk-in Booking
        </button>
      </div>

      {/* Filters */}
      <div className="card mt-6 flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? s : 'All'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">From</label>
          <input
            type="date"
            className="input"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            type="date"
            className="input"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <button
          className="btn-outline btn-sm"
          onClick={() => setFilters({ status: '', from: '', to: '' })}
        >
          Clear
        </button>
      </div>

      {error && <div className="mt-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.user?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{b.user?.phone || b.user?.email}</p>
                    {b.isWalkIn && (
                      <span className="badge mt-1 bg-slate-100 text-slate-500">walk-in</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{b.station?.name}</td>
                  <td className="px-4 py-3">
                    {b.date}
                    <br />
                    <span className="text-xs text-slate-400">
                      {b.startTime}–{b.endTime}
                    </span>
                  </td>
                  <td className="px-4 py-3">৳{b.totalPrice}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={b.paymentStatus} />
                    {b.paymentStatus === 'unpaid' && (
                      <button
                        className="ml-2 text-xs text-brand hover:underline"
                        onClick={() => markPaid(b._id)}
                      >
                        mark paid
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {b.status === 'pending' && (
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => changeStatus(b._id, 'confirmed')}
                        >
                          Approve
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => changeStatus(b._id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => changeStatus(b._id, 'cancelled')}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <WalkInModal
        open={walkInOpen}
        stations={stations}
        onClose={() => setWalkInOpen(false)}
        onDone={() => {
          setWalkInOpen(false);
          load();
        }}
        setError={setError}
      />
    </div>
  );
}

function WalkInModal({ open, stations, onClose, onDone, setError }) {
  const empty = {
    station: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '',
    endTime: '',
    customerName: '',
    customerPhone: '',
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(empty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bookingApi.createWalkIn(form);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Create Walk-in Booking" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label">Station</label>
          <select
            className="input"
            required
            value={form.station}
            onChange={(e) => setForm({ ...form, station: e.target.value })}
          >
            <option value="">— Select —</option>
            {stations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.type})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Start</label>
            <input
              type="time"
              className="input"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="label">End</label>
            <input
              type="time"
              className="input"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Customer Name</label>
            <input
              className="input"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
