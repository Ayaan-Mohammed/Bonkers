import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Shell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-nlip-bg text-nlip-text flex flex-col relative overflow-x-hidden font-body selection:bg-nlip-amber/30 selection:text-white">
      {/* Background ambient lighting */}
      <div
        className="fixed top-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none opacity-15 blur-[140px] z-0"
        style={{
          background: 'radial-gradient(circle, #e7ae59 0%, #b87628 50%, transparent 70%)',
        }}
      />
      <div
        className="fixed bottom-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none opacity-10 blur-[130px] z-0"
        style={{
          background: 'radial-gradient(circle, #e7ae59 0%, #784813 50%, transparent 70%)',
        }}
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 w-full relative z-10">
        {children ?? <Outlet />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
