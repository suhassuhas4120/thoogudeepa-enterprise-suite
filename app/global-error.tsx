'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReload = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
        return;
      }
    } catch {}
    reset();
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-xl">
          <h2 className="text-lg font-bold mb-2">Thoogudeepa Dining Suite</h2>
          <p className="text-sm text-neutral-400 mb-6">
            An unexpected error occurred. Tap below to reload.
          </p>
          <button
            onClick={handleReload}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
