import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useSettingsStore } from '../store/settingsStore.js';

const links = [
  { to: '/', label: 'Home' },
  { to: '/stations', label: 'Stations' },
  { to: '/packages', label: 'Packages' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, isStaff } = useAuthStore();
  const { settings } = useSettingsStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="logo" className="h-8 w-8 rounded" />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
              🎮
            </span>
          )}
          <span className="text-lg font-extrabold tracking-tight">
            {settings?.siteName || 'GameZone BD'}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isStaff() && (
                <Link to="/admin" className="btn-outline btn-sm">
                  Admin
                </Link>
              )}
              <Link to="/my-bookings" className="btn-outline btn-sm">
                My Bookings
              </Link>
              <button onClick={handleLogout} className="btn-sm text-sm text-slate-500 hover:text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-slate-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={navClass}
              onClick={() => setOpen(false)}
            >
              <span className="block py-1">{l.label}</span>
            </NavLink>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-2">
            {user ? (
              <>
                {isStaff() && (
                  <Link to="/admin" className="btn-outline btn-sm" onClick={() => setOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <Link to="/my-bookings" className="btn-outline btn-sm" onClick={() => setOpen(false)}>
                  My Bookings
                </Link>
                <button onClick={handleLogout} className="btn-outline btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline btn-sm" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="btn-primary btn-sm" onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
