import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

const TYPE_EMOJI = {
  PS5: '🎮',
  PC: '🖥️',
  VR: '🥽',
  Pool: '🎱',
  Snooker: '🎱',
  Other: '🕹️',
};

export default function StationCard({ station }) {
  return (
    <div className="card overflow-hidden transition hover:shadow-md">
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand/10 to-accent/10">
        {station.image ? (
          <img src={station.image} alt={station.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-6xl">{TYPE_EMOJI[station.type] || '🎮'}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{station.name}</h3>
          <StatusBadge value={station.status} />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{station.type}</p>
        {station.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{station.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-brand">
            ৳{station.pricePerHour}
            <span className="text-sm font-normal text-slate-400">/hr</span>
          </span>
          {station.status === 'active' ? (
            <Link to={`/booking?station=${station._id}`} className="btn-primary btn-sm">
              Book Now
            </Link>
          ) : (
            <span className="btn-sm text-sm text-slate-400">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
