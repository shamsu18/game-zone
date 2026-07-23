import Modal from './Modal.jsx';

// Confirmation dialog for destructive actions (delete, cancel, etc.)
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  loading = false,
  danger = true,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} maxWidth="max-w-md">
      <p className="text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
