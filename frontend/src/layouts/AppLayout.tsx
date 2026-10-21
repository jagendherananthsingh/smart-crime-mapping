import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { NotificationModal } from '../components/common/NotificationModal';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotificationModal />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Global Academic Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Render Route Page */}
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-400">
          <p>
            Andhra Pradesh Smart Crime Analysis Platform • GIST CSE (Data Science) — Powered by Spatial-Temporal ML
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            AP Police Crime Statistics (2021–2023) • Academic Data Science Capstone Project
          </p>
        </footer>
      </div>
    </div>
  );
};
