export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-slate-500 ${className}`}>
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
