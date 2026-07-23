import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="text-7xl">🎮</span>
      <h1 className="mt-4 text-4xl font-extrabold">404</h1>
      <p className="mt-2 text-slate-500">This page took a wrong turn in the arcade.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
