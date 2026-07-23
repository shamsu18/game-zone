import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stationApi, packageApi } from '../api/index.js';
import { useSettingsStore } from '../store/settingsStore.js';
import StationCard from '../components/StationCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Home() {
  const { settings } = useSettingsStore();
  const [stations, setStations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([stationApi.list(), packageApi.list()])
      .then(([st, pk]) => {
        setStations(st.slice(0, 4));
        setPackages(pk.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const hero = settings?.hero || {};
  const offers = settings?.offers || [];
  const testimonials = settings?.testimonials || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        {hero.image && (
          <img
            src={hero.image}
            alt="hero"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-ink/80 to-ink" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:py-32">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {hero.title || 'Level Up Your Game at GameZone BD'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200">
            {hero.subtitle ||
              'Book PS5, PC, VR & Pool tables by the hour. Play. Compete. Win.'}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/booking" className="btn-primary">
              {hero.ctaText || 'Book Now'}
            </Link>
            <Link to="/stations" className="btn-outline bg-white/10 text-white hover:bg-white/20">
              Browse Stations
            </Link>
          </div>
        </div>
      </section>

      {/* Featured stations */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Stations</h2>
            <p className="text-slate-500">Grab your favourite setup and start playing.</p>
          </div>
          <Link to="/stations" className="text-sm font-semibold text-brand hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stations.map((s) => (
              <StationCard key={s._id} station={s} />
            ))}
          </div>
        )}
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-2xl font-bold">Current Offers</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((o, i) => (
                <div key={i} className="card p-6">
                  <h3 className="text-lg font-semibold text-brand">{o.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{o.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages preview */}
      {packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Popular Packages</h2>
            <Link to="/packages" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <div key={p._id} className="card p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {p.discountPercent > 0 && (
                    <span className="badge bg-green-100 text-green-700">
                      -{p.discountPercent}%
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-brand">৳{p.price}</span>
                  <span className="text-sm text-slate-400">{p.durationHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-2xl font-bold">What Gamers Say</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <div key={i} className="card p-6">
                  <p className="text-slate-600">“{t.message}”</p>
                  <p className="mt-4 font-semibold text-slate-800">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-brand py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to Play?</h2>
        <p className="mt-2 text-slate-100">Book your station in under a minute.</p>
        <Link to="/booking" className="btn mt-6 bg-white text-brand hover:bg-slate-100">
          Book Your Slot
        </Link>
      </section>
    </div>
  );
}
