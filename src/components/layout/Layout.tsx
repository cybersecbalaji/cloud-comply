import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ControlDetailPanel } from '@/components/ControlDetailPanel';
import { FeedbackWidget } from '@/components/FeedbackWidget';

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setMobileNavOpen((o) => !o)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ControlDetailPanel />
      <FeedbackWidget />
    </div>
  );
}
