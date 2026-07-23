import { useEffect, useState } from 'react';
import { userApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const PERMISSIONS = ['bookings', 'stations', 'tournaments', 'packages', 'customers', 'payments'];
const emptyForm = { name: '', email: '', phone: '', password: '', permissions: ['bookings', 'stations', 'tournaments'] };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
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
    userApi
      .staff()
      .then(setStaff)
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
      email: s.email,
      phone: s.phone || '',
      password: '',
      permissions: s.permissions || [],
    });
    setEditingId(s._id);
    setModalOpen(true);
  };

  const togglePerm = (perm) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const payload = {
          name: form.name,
          phone: form.phone,
          permissions: form.permissions,
        };
        if (form.password) payload.password = form.password;
        await userApi.updateStaff(editingId, payload);
      } else {
        await userApi.createStaff(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await userApi.removeStaff(deleteTarget._id);
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
          <h1 className="text-2xl font-bold">Staff & Roles</h1>
          <p className="text-slate-500">Create staff accounts with limited permissions.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Staff
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
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(s.permissions || []).map((p) => (
                        <span key={p} className="badge bg-slate-100 text-slate-600">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-outline btn-sm" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No staff accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Staff' : 'Add Staff'}
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
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                disabled={!!editingId}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">
              {editingId ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input
              type="password"
              className="input"
              required={!editingId}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {PERMISSIONS.map((p) => (
                <label
                  key={p}
                  className={`cursor-pointer rounded-full px-3 py-1 text-sm ${
                    form.permissions.includes(p)
                      ? 'bg-brand text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.permissions.includes(p)}
                    onChange={() => togglePerm(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

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
        title="Remove staff account?"
        message={`Remove ${deleteTarget?.name}'s access?`}
        confirmText="Remove"
        loading={deleting}
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
