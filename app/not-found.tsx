import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col items-center justify-center p-4 font-mono text-center">
      <h2 className="text-2xl font-black mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-slate-500 mb-4">The requested page could not be found.</p>
      <Link
        href="/manager"
        className="px-4 py-2 bg-[#9C3D1E] text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition"
      >
        Return to Manager Portal
      </Link>
    </div>
  );
}
