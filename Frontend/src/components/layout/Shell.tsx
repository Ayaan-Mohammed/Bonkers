import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LandBackground } from './LandBackground';

export const Shell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-nlip-bg text-nlip-text flex flex-col relative overflow-x-hidden font-body selection:bg-nlip-amber/30 selection:text-white">
      {/* 3D Topographic Cadastral Land Background with Interactive Depth */}
      <LandBackground />

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
