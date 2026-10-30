import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFCF7] text-slate-800 px-6">
      <div className="text-center space-y-4">
        <div className="text-6xl font-black text-[#9C3D1E]">404</div>
        <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-slate-500 text-sm max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 rounded-xl bg-[#9C3D1E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8A4228] active:scale-95"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
