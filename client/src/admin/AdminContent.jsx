import { useEffect, useState } from 'react';
import { settingsApi } from '../api/index.js';
import { useSettingsStore } from '../store/settingsStore.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

// CMS editor for home hero, offers, testimonials and gallery.
export default function AdminContent() {
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
          hero: s.hero || { title: '', subtitle: '', image: '', ctaText: 'Book Now' },
          offers: s.offers || [],
          testimonials: s.testimonials || [],
          galleryImages: s.galleryImages || [],
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !form) return <Spinner />;

  const save = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await settingsApi.update(form);
      setGlobal(updated);
      setMessage('Content saved. Changes are now live on the public site.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field, value) =>
    setForm({ ...form, hero: { ...form.hero, [field]: value } });

  const updateArrayItem = (key, i, field, value) => {
    const arr = [...form[key]];
    arr[i] = { ...arr[i], [field]: value };
    setForm({ ...form, [key]: arr });
  };

  const addItem = (key, template) =>
    setForm({ ...form, [key]: [...form[key], template] });

  const removeItem = (key, i) =>
    setForm({ ...form, [key]: form[key].filter((_, idx) => idx !== i) });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Content (CMS)</h1>
      <p className="text-slate-500">Edit home page content without touching code.</p>

      {error && <div className="mt-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}
      {message && <div className="mt-4"><Alert type="success" onClose={() => setMessage('')}>{message}</Alert></div>}

      {/* Hero */}
      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Home Hero Banner</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.hero.title}
              onChange={(e) => updateHero('title', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <textarea
              className="input"
              rows={2}
              value={form.hero.subtitle}
              onChange={(e) => updateHero('subtitle', e.target.value)}
            />
          </div>
          <div>
            <label className="label">CTA Button Text</label>
            <input
              className="input"
              value={form.hero.ctaText}
              onChange={(e) => updateHero('ctaText', e.target.value)}
            />
          </div>
          <ImageUpload
            label="Hero Background Image"
            value={form.hero.image}
            onChange={(url) => updateHero('image', url)}
          />
        </div>
      </section>

      {/* Offers */}
      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Offers</h2>
          <button
            className="btn-outline btn-sm"
            onClick={() => addItem('offers', { title: '', description: '', image: '' })}
          >
            + Add Offer
          </button>
        </div>
        <div className="space-y-4">
          {form.offers.map((o, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex justify-end">
                <button className="text-sm text-red-500" onClick={() => removeItem('offers', i)}>
                  Remove
                </button>
              </div>
              <input
                className="input mb-2"
                placeholder="Offer title"
                value={o.title}
                onChange={(e) => updateArrayItem('offers', i, 'title', e.target.value)}
              />
              <textarea
                className="input"
                rows={2}
                placeholder="Description"
                value={o.description}
                onChange={(e) => updateArrayItem('offers', i, 'description', e.target.value)}
              />
            </div>
          ))}
          {form.offers.length === 0 && <p className="text-sm text-slate-400">No offers.</p>}
        </div>
      </section>

      {/* Testimonials */}
      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Testimonials</h2>
          <button
            className="btn-outline btn-sm"
            onClick={() => addItem('testimonials', { name: '', message: '', avatar: '' })}
          >
            + Add Testimonial
          </button>
        </div>
        <div className="space-y-4">
          {form.testimonials.map((t, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex justify-end">
                <button className="text-sm text-red-500" onClick={() => removeItem('testimonials', i)}>
                  Remove
                </button>
              </div>
              <input
                className="input mb-2"
                placeholder="Customer name"
                value={t.name}
                onChange={(e) => updateArrayItem('testimonials', i, 'name', e.target.value)}
              />
              <textarea
                className="input"
                rows={2}
                placeholder="Message"
                value={t.message}
                onChange={(e) => updateArrayItem('testimonials', i, 'message', e.target.value)}
              />
            </div>
          ))}
          {form.testimonials.length === 0 && (
            <p className="text-sm text-slate-400">No testimonials.</p>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Gallery Images</h2>
          <button className="btn-outline btn-sm" onClick={() => addItem('galleryImages', '')}>
            + Add Image
          </button>
        </div>
        <div className="space-y-3">
          {form.galleryImages.map((img, i) => (
            <div key={i} className="flex items-center gap-3">
              {img && <img src={img} alt="" className="h-12 w-12 rounded object-cover" />}
              <input
                className="input"
                placeholder="Image URL"
                value={img}
                onChange={(e) => {
                  const arr = [...form.galleryImages];
                  arr[i] = e.target.value;
                  setForm({ ...form, galleryImages: arr });
                }}
              />
              <button className="text-sm text-red-500" onClick={() => removeItem('galleryImages', i)}>
                ✕
              </button>
            </div>
          ))}
          {form.galleryImages.length === 0 && (
            <p className="text-sm text-slate-400">No gallery images.</p>
          )}
        </div>
      </section>

      <div className="sticky bottom-0 mt-6 flex justify-end bg-slate-100 py-4">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All Content'}
        </button>
      </div>
    </div>
  );
}
