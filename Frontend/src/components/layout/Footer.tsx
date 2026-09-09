import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#120f0b] border-t border-nlip-border text-nlip-text-soft font-body text-xs mt-auto">
      <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Platform Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl text-nlip-amber font-bold">◈</span>
              <span className="text-base font-extrabold font-display text-nlip-text tracking-tight">
                NLIP · National Land Intelligence Platform
              </span>
            </div>
            <p className="text-nlip-text-faint max-w-md leading-relaxed text-xs">
              Unified digital public infrastructure for state-level integrated GIS
              and land records. Connecting Cadastral Surveys, RoR registries, Sub-Registrar
              offices, and Drone GIS into an authoritative, queryable single source of truth.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nlip-surface-hi border border-nlip-border text-[11px] font-mono text-nlip-amber">
                <span className="w-1.5 h-1.5 rounded-full bg-nlip-amber animate-pulse" />
                SIH Problem Statement #26014
              </span>
              <span className="text-[11px] font-mono text-nlip-text-faint">
                DoLR · MoRD Alignment
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-nlip-text font-semibold">
              Platform Features
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="hover:text-nlip-amber transition-colors">
                  Search Land & ULPIN
                </Link>
              </li>
              <li>
                <Link to="/consents" className="hover:text-nlip-amber transition-colors">
                  DPI Consent Artefacts
                </Link>
              </li>
              <li>
                <Link to="/officer-dashboard" className="hover:text-nlip-amber transition-colors">
                  Officer Variance Queue
                </Link>
              </li>
              <li>
                <Link to="/dev-sandbox" className="hover:text-nlip-amber transition-colors">
                  Developer API Sandbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Standards */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-nlip-text font-semibold">
              Standards & Protocols
            </div>
            <ul className="space-y-2 text-xs text-nlip-text-faint font-mono">
              <li className="flex items-center gap-1.5">
                <span className="text-nlip-amber">✓</span> Bhu-Aadhaar 14-char ULPIN
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-nlip-amber">✓</span> GeoJSON RFC 7946 Polygon
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-nlip-amber">✓</span> Digital India Land Records
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-nlip-amber">✓</span> SHA-256 Tamper Audit Trail
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-nlip-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-nlip-text-faint">
          <div>
            © 2026 NLIP Digital Public Infrastructure · Built for Smart India Hackathon
          </div>
          <div className="font-mono text-[10px] text-nlip-text-soft">
            Strict Zero-Tamper Hash Verification · In-Memory JWT Access
          </div>
        </div>
      </div>
    </footer>
  );
};
