import { useEffect, useState } from 'react';
import { stationApi } from '../api/index.js';
import StationCard from '../components/StationCard.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';

const TYPES = ['All', 'PS5', 'PC', 'VR', 'Pool', 'Snooker', 'Other'];

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [type, setType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    stationApi
      .list(type === 'All' ? {} : { type })
      .then(setStations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">Gaming Stations</h1>
      <p className="mt-1 text-slate-500">Pick a station and book by the hour.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              type === t
                ? 'bg-brand text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {error && <Alert onClose={() => setError('')}>{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : stations.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No stations available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((s) => (
              <StationCard key={s._id} station={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
