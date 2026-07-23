import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore.js';

export default function Footer() {
  const { settings } = useSettingsStore();
  const s = settings || {};
  const social = s.socialLinks || {};

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
              🎮
            </span>
            <span className="text-lg font-extrabold">{s.siteName || 'GameZone BD'}</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Your neighbourhood gaming lounge — PS5, PC, VR, Pool & Snooker, all under one roof.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/stations" className="hover:text-brand">Stations</Link></li>
            <li><Link to="/packages" className="hover:text-brand">Packages</Link></li>
            <li><Link to="/tournaments" className="hover:text-brand">Tournaments</Link></li>
            <li><Link to="/gallery" className="hover:text-brand">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            {s.address && <li>{s.address}</li>}
            {s.contactPhone && <li>📞 {s.contactPhone}</li>}
            {s.contactEmail && <li>✉️ {s.contactEmail}</li>}
            {s.openingHours && <li>🕒 {s.openingHours}</li>}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Follow Us</h4>
          <div className="flex gap-3 text-sm">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="hover:text-brand">
                Facebook
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="hover:text-brand">
                Instagram
              </a>
            )}
            {social.whatsapp && (
              <a href={social.whatsapp} target="_blank" rel="noreferrer" className="hover:text-brand">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {s.siteName || 'GameZone BD'}. All rights reserved.
      </div>
    </footer>
  );
}
