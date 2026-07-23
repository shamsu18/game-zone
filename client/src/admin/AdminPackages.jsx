import { useEffect, useState } from 'react';
import { packageApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const emptyForm = {
  name: '',
  price: '',
  durationHours: '',
  discountPercent: 0,
  description: '',
  active: true,
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
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
    packageApi
      .list({ all: 'true' })
      .then(setPackages)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      durationHours: p.durationHours,
      discountPercent: p.discountPercent,
      description: p.description || '',
      active: p.active,
    });
    setEditingId(p._id);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        durationHours: Number(form.durationHours),
        discountPercent: Number(form.discountPercent),
      };
      if (editingId) await packageApi.update(editingId, payload);
      else await packageApi.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await packageApi.toggleActive(p._id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await packageApi.remove(deleteTarget._id);
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
          <h1 className="text-2xl font-bold">Packages</h1>
          <p className="text-slate-500">Bundle deals and discounts.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Package
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
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">৳{p.price}</td>
                  <td className="px-4 py-3">{p.durationHours}h</td>
                  <td className="px-4 py-3">{p.discountPercent}%</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)}>
                      <span
                        className={`badge ${
                          p.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-outline btn-sm" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(p)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No packages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Package' : 'Add Package'}
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Price (৳)</label>
              <input
                type="number"
                min="0"
                className="input"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Hours</label>
              <input
                type="number"
                min="0"
                className="input"
                required
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              />
            </div>
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active (visible to customers)
          </label>

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
        title="Delete package?"
        message={`Delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
