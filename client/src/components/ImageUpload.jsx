import { useState } from 'react';
import { uploadApi } from '../api/index.js';

// Uploads an image to the backend and returns its URL via onChange.
export default function ImageUpload({ value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadApi.image(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="preview" className="h-14 w-14 rounded object-cover" />
        )}
        <div className="flex-1">
          <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
          {uploading && <p className="text-xs text-slate-400">Uploading…</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
      <input
        className="input mt-2"
        placeholder="…or paste an image URL"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
