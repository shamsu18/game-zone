import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Tournaments() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [registering, setRegistering] = useState(null);

  const load = () => {
    setLoading(true);
    tournamentApi
      .list()
      .then((data) => setTournaments(data.filter((t) => t.status !== 'finished')))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRegister = async (id) => {
    setError('');
    setMessage('');
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/tournaments' } } });
      return;
    }
    setRegistering(id);
    try {
      await tournamentApi.register(id);
      setMessage('You are registered! See you at the tournament. 🎮');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">Tournaments</h1>
      <p className="mt-1 text-slate-500">Compete, win prizes, and become a legend.</p>

      <div className="mt-8 space-y-4">
        {error && <Alert onClose={() => setError('')}>{error}</Alert>}
        {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}

        {loading ? (
          <Spinner />
        ) : tournaments.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No upcoming tournaments.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tournaments.map((t) => {
              const alreadyIn = user && t.participants?.some((p) => p === user._id || p?._id === user._id);
              return (
                <div key={t._id} className="card overflow-hidden">
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand/20 to-accent/20">
                    {t.bannerImage ? (
                      <img src={t.bannerImage} alt={t.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl">🏆</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{t.title}</h3>
                      <StatusBadge value={t.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{t.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>📅 {new Date(t.date).toLocaleDateString()}</span>
                      <span>💰 Entry: ৳{t.entryFee}</span>
                      <span>👥 {t.participants?.length || 0} registered</span>
                    </div>
                    <button
                      className="btn-primary mt-5 w-full"
                      disabled={registering === t._id || alreadyIn}
                      onClick={() => handleRegister(t._id)}
                    >
                      {alreadyIn
                        ? 'Registered ✓'
                        : registering === t._id
                        ? 'Registering…'
                        : 'Register Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
