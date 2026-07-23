import { useEffect, useState } from 'react';
import { stationApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

const TYPES = ['PS5', 'PC', 'VR', 'Pool', 'Snooker', 'Other'];
const emptyForm = { name: '', type: 'PS5', pricePerHour: '', description: '', image: '', status: 'active' };

export default function AdminStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    stationApi
      .list({ all: 'true' })
      .then(setStations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      type: s.type,
      pricePerHour: s.pricePerHour,
      description: s.description || '',
      image: s.image || '',
      status: s.status,
    });
    setEditingId(s._id);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, pricePerHour: Number(form.pricePerHour) };
      if (editingId) await stationApi.update(editingId, payload);
      else await stationApi.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (s) => {
    try {
      await stationApi.toggleStatus(s._id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await stationApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stations</h1>
          <p className="text-slate-500">Manage your gaming stations.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Station
        </button>
      </div>

      {error && <div className="mt-4"><Alert onClose={() => setError('')}>{error}</Alert></div>}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price/hr</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.type}</td>
                  <td className="px-4 py-3">৳{s.pricePerHour}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(s)} title="Toggle status">
                      <StatusBadge value={s.status} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-outline btn-sm" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No stations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Station' : 'Add Station'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price / hour (৳)</label>
              <input
                type="number"
                min="0"
                className="input"
                required
                value={form.pricePerHour}
                onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete station?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
