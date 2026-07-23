import { useEffect, useState } from 'react';
import { bookingApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    bookingApi
      .mine()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const upcoming = bookings.filter(
    (b) => b.date >= todayStr() && !['cancelled', 'completed'].includes(b.status)
  );
  const past = bookings.filter(
    (b) => b.date < todayStr() || ['cancelled', 'completed'].includes(b.status)
  );

  const doCancel = async () => {
    setActionLoading(true);
    try {
      await bookingApi.cancel(cancelTarget._id);
      setCancelTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const Row = ({ b }) => (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{b.station?.name || 'Station'}</h3>
          <StatusBadge value={b.status} />
          <StatusBadge value={b.paymentStatus} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          📅 {b.date} · 🕒 {b.startTime}–{b.endTime} · 💰 ৳{b.totalPrice}
        </p>
      </div>
      {!['cancelled', 'completed'].includes(b.status) && b.date >= todayStr() && (
        <div className="flex gap-2">
          <button className="btn-outline btn-sm" onClick={() => setRescheduleTarget(b)}>
            Reschedule
          </button>
          <button className="btn-danger btn-sm" onClick={() => setCancelTarget(b)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <p className="mt-1 text-slate-500">Manage your upcoming and past sessions.</p>

      <div className="mt-8">
        {error && <div className="mb-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}
        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Upcoming</h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-slate-400">No upcoming bookings.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <Row key={b._id} b={b} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Past & Cancelled</h2>
              {past.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing here yet.</p>
              ) : (
                <div className="space-y-3">
                  {past.map((b) => (
                    <Row key={b._id} b={b} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel booking?"
        message="Are you sure you want to cancel this booking? This cannot be undone."
        confirmText="Yes, cancel"
        loading={actionLoading}
        onConfirm={doCancel}
        onClose={() => setCancelTarget(null)}
      />

      <RescheduleModal
        booking={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onDone={() => {
          setRescheduleTarget(null);
          load();
        }}
        setError={setError}
      />
    </div>
  );
}

function RescheduleModal({ booking, onClose, onDone, setError }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setDate(booking.date);
      setSelected([]);
    }
  }, [booking]);

  useEffect(() => {
    if (!booking || !date) return;
    setLoading(true);
    setSelected([]);
    bookingApi
      .availability(booking.station._id || booking.station, date)
      .then((d) => setSlots(d.slots))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [booking, date, setError]);

  if (!booking) return null;

  const toggle = (slot) => {
    if (!slot.available) return;
    const exists = selected.find((s) => s.startTime === slot.startTime);
    setSelected(
      exists
        ? selected.filter((s) => s.startTime !== slot.startTime)
        : [...selected, slot].sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
  };

  const save = async () => {
    if (selected.length === 0) {
      setError('Select at least one slot.');
      return;
    }
    setSaving(true);
    try {
      await bookingApi.reschedule(booking._id, {
        date,
        startTime: selected[0].startTime,
        endTime: selected[selected.length - 1].endTime,
      });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!booking} title="Reschedule Booking" onClose={onClose}>
      <label className="label">New date</label>
      <input
        type="date"
        className="input"
        min={new Date().toISOString().slice(0, 10)}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading slots…" />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isSel = selected.some((s) => s.startTime === slot.startTime);
              return (
                <button
                  key={slot.startTime}
                  disabled={!slot.available}
                  onClick={() => toggle(slot)}
                  className={`rounded border px-2 py-1.5 text-xs font-medium ${
                    !slot.available
                      ? 'cursor-not-allowed bg-slate-100 text-slate-300 line-through'
                      : isSel
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-300 hover:border-brand'
                  }`}
                >
                  {slot.startTime}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-outline" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Confirm Reschedule'}
        </button>
      </div>
    </Modal>
  );
}
