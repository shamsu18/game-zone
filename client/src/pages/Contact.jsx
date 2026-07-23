import { useSettingsStore } from '../store/settingsStore.js';

export default function Contact() {
  const { settings } = useSettingsStore();
  const s = settings || {};
  const social = s.socialLinks || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-1 text-slate-500">We'd love to hear from you.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold">Get in Touch</h3>
            <ul className="mt-4 space-y-3 text-slate-600">
              {s.address && (
                <li className="flex gap-3">
                  <span>📍</span> <span>{s.address}</span>
                </li>
              )}
              {s.contactPhone && (
                <li className="flex gap-3">
                  <span>📞</span>
                  <a href={`tel:${s.contactPhone}`} className="hover:text-brand">
                    {s.contactPhone}
                  </a>
                </li>
              )}
              {s.contactEmail && (
                <li className="flex gap-3">
                  <span>✉️</span>
                  <a href={`mailto:${s.contactEmail}`} className="hover:text-brand">
                    {s.contactEmail}
                  </a>
                </li>
              )}
              {s.openingHours && (
                <li className="flex gap-3">
                  <span>🕒</span> <span>{s.openingHours}</span>
                </li>
              )}
            </ul>

            <div className="mt-6 flex gap-3">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  Facebook
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  Instagram
                </a>
              )}
              {social.whatsapp && (
                <a href={social.whatsapp} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          {s.mapEmbedUrl ? (
            <iframe
              title="map"
              src={s.mapEmbedUrl}
              className="h-full min-h-[320px] w-full border-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-100 text-slate-400">
              Map will appear here once configured in Settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
