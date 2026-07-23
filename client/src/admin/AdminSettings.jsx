import { useEffect, useState } from 'react';
import { settingsApi } from '../api/index.js';
import { useSettingsStore } from '../store/settingsStore.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

export default function AdminSettings() {
  const setGlobal = useSettingsStore((s) => s.setSettings);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    settingsApi
      .get()
      .then((s) =>
        setForm({
          siteName: s.siteName || '',
          logoUrl: s.logoUrl || '',
          contactPhone: s.contactPhone || '',
          contactEmail: s.contactEmail || '',
          address: s.address || '',
          openingHours: s.openingHours || '',
          mapEmbedUrl: s.mapEmbedUrl || '',
          socialLinks: {
            facebook: s.socialLinks?.facebook || '',
            instagram: s.socialLinks?.instagram || '',
            whatsapp: s.socialLinks?.whatsapp || '',
          },
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !form) return <Spinner />;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await settingsApi.update(form);
      setGlobal(updated);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (field, value) => setForm({ ...form, [field]: value });
  const setSocial = (field, value) =>
    setForm({ ...form, socialLinks: { ...form.socialLinks, [field]: value } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-slate-500">Site identity, contact info and social links.</p>

      {error && <div className="mt-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}
      {message && <div className="mt-4"><Alert type="success" onClose={() => setMessage('')}>{message}</Alert></div>}

      <form onSubmit={save} className="card mt-6 space-y-4 p-5">
        <div>
          <label className="label">Site Name</label>
          <input className="input" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
        </div>
        <ImageUpload label="Logo" value={form.logoUrl} onChange={(url) => set('logoUrl', url)} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Contact Phone</label>
            <input
              className="input"
              value={form.contactPhone}
              onChange={(e) => set('contactPhone', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input
              type="email"
              className="input"
              value={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea
            className="input"
            rows={2}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Opening Hours</label>
          <input
            className="input"
            value={form.openingHours}
            onChange={(e) => set('openingHours', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Google Maps Embed URL</label>
          <input
            className="input"
            placeholder="https://www.google.com/maps/embed?..."
            value={form.mapEmbedUrl}
            onChange={(e) => set('mapEmbedUrl', e.target.value)}
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="mb-3 font-semibold">Social Links</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Facebook</label>
              <input
                className="input"
                value={form.socialLinks.facebook}
                onChange={(e) => setSocial('facebook', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Instagram</label>
              <input
                className="input"
                value={form.socialLinks.instagram}
                onChange={(e) => setSocial('instagram', e.target.value)}
              />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input
                className="input"
                value={form.socialLinks.whatsapp}
                onChange={(e) => setSocial('whatsapp', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
