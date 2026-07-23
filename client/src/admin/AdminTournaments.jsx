import { useEffect, useState } from 'react';
import { tournamentApi } from '../api/index.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

const emptyForm = {
  title: '',
  description: '',
  date: '',
  entryFee: 0,
  bannerImage: '',
  status: 'upcoming',
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [participantsFor, setParticipantsFor] = useState(null);

  const load = () => {
    setLoading(true);
    tournamentApi
      .list()
      .then(setTournaments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      title: t.title,
      description: t.description || '',
      date: t.date ? new Date(t.date).toISOString().slice(0, 10) : '',
      entryFee: t.entryFee,
      bannerImage: t.bannerImage || '',
      status: t.status,
    });
    setEditingId(t._id);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, entryFee: Number(form.entryFee) };
      if (editingId) await tournamentApi.update(editingId, payload);
      else await tournamentApi.create(payload);
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
      await tournamentApi.remove(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const viewParticipants = async (t) => {
    try {
      const full = await tournamentApi.get(t._id);
      setParticipantsFor(full);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tournaments</h1>
          <p className="text-slate-500">Create and manage competitions.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Tournament
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
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Entry</th>
                <th className="px-4 py-3">Players</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">৳{t.entryFee}</td>
                  <td className="px-4 py-3">
                    <button className="text-brand hover:underline" onClick={() => viewParticipants(t)}>
                      {t.participants?.length || 0} view
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={t.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-outline btn-sm" onClick={() => openEdit(t)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(t)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No tournaments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Tournament' : 'Add Tournament'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Entry Fee (৳)</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
          <ImageUpload
            label="Banner Image"
            value={form.bannerImage}
            onChange={(url) => setForm({ ...form, bannerImage: url })}
          />

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

      <Modal
        open={!!participantsFor}
        title={`Participants — ${participantsFor?.title || ''}`}
        onClose={() => setParticipantsFor(null)}
      >
        {participantsFor?.participants?.length ? (
          <ul className="divide-y divide-slate-100">
            {participantsFor.participants.map((p) => (
              <li key={p._id} className="py-2">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {p.email} · {p.phone || 'no phone'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">No participants registered yet.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete tournament?"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={doDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
