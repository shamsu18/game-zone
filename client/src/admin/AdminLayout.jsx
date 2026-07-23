import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

// Nav items with the roles allowed to see them.
const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true, roles: ['admin', 'staff'] },
  { to: '/admin/bookings', label: 'Bookings', icon: '📅', roles: ['admin', 'staff'] },
  { to: '/admin/stations', label: 'Stations', icon: '🎮', roles: ['admin', 'staff'] },
  { to: '/admin/packages', label: 'Packages', icon: '📦', roles: ['admin', 'staff'] },
  { to: '/admin/tournaments', label: 'Tournaments', icon: '🏆', roles: ['admin', 'staff'] },
  { to: '/admin/customers', label: 'Customers', icon: '👥', roles: ['admin', 'staff'] },
  { to: '/admin/payments', label: 'Payments', icon: '💳', roles: ['admin', 'staff'] },
  { to: '/admin/content', label: 'Content (CMS)', icon: '📝', roles: ['admin', 'staff'] },
  { to: '/admin/staff', label: 'Staff & Roles', icon: '🛡️', roles: ['admin'] },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const visible = NAV.filter((n) => n.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-slate-700/50'
    }`;

  const SidebarContent = () => (
    <>
      <Link to="/admin" className="flex items-center gap-2 px-2 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-white">🎮</span>
        <div>
          <p className="font-bold text-white">GameZone BD</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </Link>
      <nav className="mt-2 flex-1 space-y-1">
        {visible.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkClass} onClick={() => setOpen(false)}>
            <span>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-700 pt-3">
        <div className="px-3 py-1 text-xs text-slate-400">
          {user?.name} · <span className="uppercase">{user?.role}</span>
        </div>
        <Link to="/" className="block px-3 py-1.5 text-sm text-slate-300 hover:text-white">
          ← View Site
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full px-3 py-1.5 text-left text-sm text-red-300 hover:text-red-200"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col bg-ink p-3 md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex w-64 flex-col bg-ink p-3">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between bg-ink px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="text-white">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-bold text-white">Admin Panel</span>
          <span className="w-6" />
        </div>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
