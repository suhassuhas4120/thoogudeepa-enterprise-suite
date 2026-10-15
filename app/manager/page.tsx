'use client';

import React, { useState, useEffect } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { ManagerScreenId } from '../../types/manager';

// Screens
import { ScreenM1Login } from '../../components/manager/ScreenM1Login';
import { ScreenM2LiveOverview } from '../../components/manager/ScreenM2LiveOverview';
import { ScreenM4BillingPOS } from '../../components/manager/ScreenM4BillingPOS';
import { ScreenM5KitchenSpeed } from '../../components/manager/ScreenM5KitchenSpeed';
import { ScreenM9WaiterCash } from '../../components/manager/ScreenM9WaiterCash';
import { ScreenM10Menu86Stock } from '../../components/manager/ScreenM10Menu86Stock';
import { ScreenM11SalesReport } from '../../components/manager/ScreenM11SalesReport';
import { ScreenM13PettyExpenses } from '../../components/manager/ScreenM13PettyExpenses';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: number | string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ManagerScreenErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Manager Screen error caught:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-md mx-auto my-12 p-6 bg-white border border-rose-300 rounded-xl shadow-sm text-center font-mono">
          <div className="text-rose-600 text-sm font-bold mb-2">⚠️ Screen Display Notice</div>
          <p className="text-xs text-slate-600 mb-4">
            {this.state.error?.message || 'An unexpected rendering issue occurred on this screen.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-[#9C3D1E] text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition"
          >
            Retry Screen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TAB_ITEMS: { id: ManagerScreenId; name: string }[] = [
  { id: 1, name: '01. Login & Float' },
  { id: 2, name: '02. Live Overview' },
  { id: 3, name: '03. Billing & POS' },
  { id: 4, name: '04. Kitchen & Notifications' },
  { id: 5, name: '05. Waiter Cash & Tips' },
  { id: 6, name: '06. Menu Stocks & Offers' },
  { id: 7, name: '07. Sales Report' },
  { id: 8, name: '08. Petty Expenses & Cash Counter' },
];

export default function ManagerPortalPage() {
  const currentScreen = useManagerStore((s) => s.currentScreen);
  const setCurrentScreen = useManagerStore((s) => s.setCurrentScreen);

  // Local state ensures 100% synchronous reactivity in client rendering
  const [activeTab, setActiveTab] = useState<ManagerScreenId>(currentScreen || 1);

  // Read URL query parameter (?screen=N, ?screen-N, ?tab=N, or #N) on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = (window.location.search || '') + ' ' + (window.location.hash || '');
        const match = raw.match(/(?:screen|tab)[=-]?([1-8])/i) || raw.match(/[?#&]([1-8])\b/);
        if (match && match[1]) {
          const parsed = parseInt(match[1], 10);
          if (parsed >= 1 && parsed <= 8) {
            setActiveTab(parsed as ManagerScreenId);
            setCurrentScreen(parsed as ManagerScreenId);
            return;
          }
        }
      } catch {
        // ignore in SSR / non-browser environments
      }
    }
    if (currentScreen >= 1 && currentScreen <= 8) {
      setActiveTab(currentScreen);
    }
  }, []);

  // Sync activeTab whenever store currentScreen changes from sub-components
  useEffect(() => {
    if (currentScreen && currentScreen !== activeTab) {
      setActiveTab(currentScreen);
    }
  }, [currentScreen]);

  const handleTabClick = (id: ManagerScreenId) => {
    setActiveTab(id);
    setCurrentScreen(id);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('screen', id.toString());
        window.history.replaceState(null, '', url.toString());
      } catch {
        // ignore
      }
    }
  };

  const renderActiveScreen = (screenId: ManagerScreenId) => {
    switch (screenId) {
      case 1:
        return <ScreenM1Login />;
      case 2:
        return <ScreenM2LiveOverview />;
      case 3:
        return <ScreenM4BillingPOS />;
      case 4:
        return <ScreenM5KitchenSpeed />;
      case 5:
        return <ScreenM9WaiterCash />;
      case 6:
        return <ScreenM10Menu86Stock />;
      case 7:
        return <ScreenM11SalesReport />;
      case 8:
        return <ScreenM13PettyExpenses />;
      default:
        return <ScreenM1Login />;
    }
  };

  return (
    <div className="manager-portal h-screen w-screen max-h-screen max-w-screen bg-[#EFECE6] text-slate-900 p-2.5 sm:p-3 md:p-4 box-border flex flex-col overflow-hidden font-sans">
      {/* ── MASTER FRAMED APPLICATION SHELL (Matching Sketch: gap 1cm all sides, burnt orange border) ── */}
      <div className="h-full w-full max-h-full bg-white text-slate-900 border-2 border-[#9C3D1E] rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* ── SCREEN NAVIGATION TABS (Top of Frame matching sketch) ── */}
        <nav
          role="tablist"
          aria-label="Manager Portal Navigation"
          className="shrink-0 w-full border-b border-[#EAE5DF] bg-[#FAF8F5] px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-slate-900"
        >
          {TAB_ITEMS.map((sc) => {
            const isActive = activeTab === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(sc.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer select-none ${
                  isActive
                    ? 'border-[#9C3D1E] bg-[#9C3D1E] text-white shadow-xs'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-[#FAF8F5]'
                }`}
              >
                <span>{sc.name}</span>
              </button>
            );
          })}
        </nav>

        {/* ── ACTUAL PARTICULAR SCREEN CONTAINER (Internal Scrolling only) ── */}
        <div className="flex-1 min-h-0 w-full bg-[#FAF8F5] p-2 sm:p-4 overflow-y-auto overflow-x-hidden">
          <div className="w-full flex justify-center pb-6">
            <div key={activeTab} className="w-full flex justify-center transition-all duration-150">
              <ManagerScreenErrorBoundary resetKey={activeTab}>
                {renderActiveScreen(activeTab)}
              </ManagerScreenErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
