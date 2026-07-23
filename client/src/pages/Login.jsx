import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Alert from '../components/Alert.jsx';

export default function Login() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form);
      // Staff/admin go to the admin panel, customers to where they came from.
      navigate(['admin', 'staff'].includes(user.role) ? '/admin' : from, {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold">Welcome Back 👋</h1>
      <p className="mt-1 text-slate-500">Log in to manage your bookings.</p>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        {error && <Alert onClose={() => setError('')}>{error}</Alert>}
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
