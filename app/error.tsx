'use client';

import React, { useEffect } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions safely
    console.error('Handled application exception:', error);
  }, [error]);

  const handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('thoogudeepa_verified_session');
        localStorage.removeItem('thoogudeepa_customer_session_v1');
      }
    } catch {}
    reset();
  };

  const handleReturnHome = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('thoogudeepa_verified_session');
        localStorage.removeItem('thoogudeepa_customer_session_v1');
        window.location.href = '/';
      }
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-amber-500">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          Session Refresh Needed
        </h2>
        
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          The dining portal encountered a temporary network or state disruption. You can continue dining by refreshing your connection.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Session
          </button>

          <button
            onClick={handleReturnHome}
            className="w-full py-3.5 px-4 bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-neutral-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition border border-neutral-700"
          >
            <Home className="w-4 h-4" />
            Return to Welcome Screen
          </button>
        </div>
      </div>
    </div>
  );
}
