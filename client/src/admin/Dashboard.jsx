import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';

const StatCard = ({ label, value, icon, accent }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
      <span className={`grid h-11 w-11 place-items-center rounded-lg text-xl ${accent}`}>
        {icon}
      </span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([dashboardApi.stats(), dashboardApi.revenue7d()])
      .then(([s, r]) => {
        setStats(s);
        setRevenue(r.map((d) => ({ ...d, day: d.date.slice(5) })));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-slate-500">Overview of today's activity.</p>

      {error && <div className="mt-4"><Alert>{error}</Alert></div>}

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today's Bookings"
            value={stats.todaysBookingsCount}
            icon="📅"
            accent="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="Today's Revenue"
            value={`৳${stats.todaysRevenue}`}
            icon="💰"
            accent="bg-green-100 text-green-600"
          />
          <StatCard
            label="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            icon="📈"
            accent="bg-purple-100 text-purple-600"
          />
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers}
            icon="👥"
            accent="bg-amber-100 text-amber-600"
          />
        </div>
      )}

      <div className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Revenue — Last 7 Days</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => [`৳${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
