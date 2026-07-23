// Simple inline alert for errors / success messages.
export default function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
    >
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="font-bold leading-none">
          ×
        </button>
      )}
    </div>
  );
}
