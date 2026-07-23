const MAP = {
  // booking status
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  // payment status
  unpaid: 'bg-slate-100 text-slate-600',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-purple-100 text-purple-700',
  // station / package
  active: 'bg-green-100 text-green-700',
  maintenance: 'bg-amber-100 text-amber-700',
  // tournament
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  finished: 'bg-slate-100 text-slate-600',
};

export default function StatusBadge({ value }) {
  return (
    <span className={`badge ${MAP[value] || 'bg-slate-100 text-slate-600'}`}>
      {value}
    </span>
  );
}
