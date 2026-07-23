import { useSettingsStore } from '../store/settingsStore.js';

// Placeholder tiles when no gallery images are configured yet.
const PLACEHOLDERS = ['🎮', '🕹️', '🖥️', '🥽', '🎱', '🏆', '👾', '🎯'];

export default function Gallery() {
  const { settings } = useSettingsStore();
  const images = settings?.galleryImages || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="mt-1 text-slate-500">A peek inside GameZone BD.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.length > 0
          ? images.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl">
                <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))
          : PLACEHOLDERS.map((emoji, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-accent/10 text-5xl"
              >
                {emoji}
              </div>
            ))}
      </div>
    </div>
  );
}
