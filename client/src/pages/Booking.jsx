import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { stationApi, bookingApi, paymentApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState(params.get('station') || '');
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState([]); // array of {startTime,endTime}
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    stationApi.list().then(setStations).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!stationId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelected([]);
    bookingApi
      .availability(stationId, date)
      .then((data) => setSlots(data.slots))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [stationId, date]);

  const station = stations.find((s) => s._id === stationId);

  // Selection must be contiguous; toggle individual hourly slots.
  const toggleSlot = (slot) => {
    if (!slot.available) return;
    const exists = selected.find((s) => s.startTime === slot.startTime);
    if (exists) {
      setSelected(selected.filter((s) => s.startTime !== slot.startTime));
    } else {
      setSelected(
        [...selected, slot].sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
    }
  };

  const totalHours = selected.length;
  const totalPrice = station ? totalHours * station.pricePerHour : 0;

  const isContiguous = () => {
    if (selected.length <= 1) return true;
    for (let i = 1; i < selected.length; i++) {
      if (selected[i].startTime !== selected[i - 1].endTime) return false;
    }
    return true;
  };

  const handleBook = async () => {
    setError('');
    setSuccess('');
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/booking' } } });
      return;
    }
    if (selected.length === 0) {
      setError('Please select at least one time slot.');
      return;
    }
    if (!isContiguous()) {
      setError('Please select consecutive time slots only.');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingApi.create({
        station: stationId,
        date,
        startTime: selected[0].startTime,
        endTime: selected[selected.length - 1].endTime,
      });
      // Mock payment flow: immediately confirm the mock payment.
      await paymentApi.initiate(booking._id);
      await paymentApi.confirm(booking._id);
      setSuccess('Booking confirmed and paid! Redirecting to My Bookings…');
      setTimeout(() => navigate('/my-bookings'), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Book a Station</h1>
      <p className="mt-1 text-slate-500">Pick a station, choose a date, and select your slots.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <label className="label">Station</label>
          <select
            className="input"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
          >
            <option value="">— Select a station —</option>
            {stations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.type}) — ৳{s.pricePerHour}/hr
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            min={todayStr()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8">
        {error && <div className="mb-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}
        {success && (
          <div className="mb-4"><Alert type="success">{success}</Alert></div>
        )}

        {!stationId ? (
          <p className="py-10 text-center text-slate-400">Select a station to see available slots.</p>
        ) : loadingSlots ? (
          <Spinner label="Loading slots…" />
        ) : (
          <>
            <h3 className="mb-3 font-semibold">Available Time Slots</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isSelected = selected.some((s) => s.startTime === slot.startTime);
                return (
                  <button
                    key={slot.startTime}
                    disabled={!slot.available}
                    onClick={() => toggleSlot(slot)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      !slot.available
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 line-through'
                        : isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-brand'
                    }`}
                  >
                    {slot.startTime}–{slot.endTime}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Summary */}
      {selected.length > 0 && station && (
        <div className="card mt-8 p-6">
          <h3 className="font-semibold">Booking Summary</h3>
          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Station</span>
              <span className="font-medium">{station.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span className="font-medium">
                {selected[0].startTime} – {selected[selected.length - 1].endTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration</span>
              <span className="font-medium">{totalHours} hour(s)</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-brand">৳{totalPrice}</span>
            </div>
          </div>
          <button
            className="btn-primary mt-6 w-full"
            onClick={handleBook}
            disabled={submitting}
          >
            {submitting ? 'Processing…' : user ? 'Confirm & Pay' : 'Login to Book'}
          </button>
        </div>
      )}
    </div>
  );
}
