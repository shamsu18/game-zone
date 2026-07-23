import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { packageApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    packageApi
      .list()
      .then(setPackages)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">Packages & Combos</h1>
      <p className="mt-1 text-slate-500">Save more with our bundled gaming packages.</p>

      <div className="mt-8">
        {error && <Alert onClose={() => setError('')}>{error}</Alert>}
        {loading ? (
          <Spinner />
        ) : packages.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No packages available right now.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => {
              const finalPrice = Math.round(p.price * (1 - p.discountPercent / 100));
              return (
                <div key={p._id} className="card flex flex-col p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    {p.discountPercent > 0 && (
                      <span className="badge bg-green-100 text-green-700">
                        -{p.discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex-1 text-sm text-slate-500">{p.description}</p>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-brand">৳{finalPrice}</span>
                      {p.discountPercent > 0 && (
                        <span className="text-sm text-slate-400 line-through">৳{p.price}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{p.durationHours} hours of play</p>
                  </div>
                  <Link to="/booking" className="btn-primary mt-5 w-full">
                    Buy Package
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
