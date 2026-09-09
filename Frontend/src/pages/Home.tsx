import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Search,
  ArrowRight,
  Shield,
  Layers,
  FileCheck2,
  Brain,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickInput.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const sandboxParcels = [
    {
      state: 'Uttar Pradesh (UP)',
      ulpin: 'UP09412601001',
      loc: 'Lucknow · Chinhat',
      desc: 'Clean residential parcel, 842 m², 0.4% GIS variance, verified RoR.',
      badge: 'Clean Title',
      variant: 'green' as const,
    },
    {
      state: 'Maharashtra (MH)',
      ulpin: 'MH27830501001',
      loc: 'Mumbai · Andheri (W)',
      desc: 'Residential plot with active bank mortgage and 6.9% GIS area variance flag.',
      badge: 'Area Variance',
      variant: 'amber' as const,
    },
    {
      state: 'Karnataka (KA)',
      ulpin: 'KA29150301001',
      loc: 'Bengaluru · Koramangala',
      desc: 'Commercial property, joint ownership deed with multiple khata co-owners.',
      badge: 'Joint Ownership',
      variant: 'blue' as const,
    },
    {
      state: 'Telangana (TS)',
      ulpin: 'TS36280201001',
      loc: 'Hyderabad · Serilingampally',
      desc: 'High-risk dispute showcase: pending court case, tax overdue, building deviation.',
      badge: 'Disputed Title',
      variant: 'red' as const,
    },
    {
      state: 'Punjab (PB)',
      ulpin: 'PB03140701001',
      loc: 'Amritsar · Lopoke',
      desc: 'Clean agricultural farmland, 1 acre, 0.3% GIS variance, verified sole ownership.',
      badge: 'Clean Title',
      variant: 'green' as const,
    },
    {
      state: 'Madhya Pradesh (MP)',
      ulpin: 'MP23090401001',
      loc: 'Bhopal · Ratibad',
      desc: 'Fraud alert: forged sale deed, 20% area excess, court case active, govt attachment order.',
      badge: 'Fraud Alert',
      variant: 'red' as const,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 max-w-nlip-wrap mx-auto text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nlip-surface-hi border border-nlip-border text-xs font-mono text-nlip-amber mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-nlip-amber animate-pulse" />
          <span>National Land Intelligence Platform · SIH PS #26014</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-nlip-text max-w-4xl mx-auto leading-[1.1] mb-6">
          One Nation.
          <br />
          One Land Intelligence
          <br />
          <span className="bg-gradient-to-r from-nlip-amber via-[#e8be78] to-[#c78832] bg-clip-text text-transparent">
            Platform.
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-nlip-text-soft font-body max-w-2xl mx-auto leading-relaxed mb-10">
          Search, understand, and explore land parcels across India through connected
          land records, GIS digital public infrastructure, and automated dispute-risk
          intelligence.
        </p>

        {/* Quick Search Form */}
        <form
          onSubmit={handleQuickSubmit}
          className="max-w-2xl mx-auto mb-8 p-2 rounded-full bg-nlip-surface/80 border border-nlip-border-hi backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:border-nlip-amber/40 transition-colors duration-300"
        >
          <div className="pl-5 text-nlip-amber">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Search by ULPIN, Survey No, Khasra, or Plot..."
            className="flex-1 min-w-0 bg-transparent px-3 py-3 text-base font-mono text-nlip-text placeholder:text-nlip-text-faint focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="rounded-full shrink-0 px-6"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Search
          </Button>
        </form>

        {/* Trust Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-nlip-text-soft pt-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-nlip-amber" />
            <span>28 States & 8 UTs</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-nlip-amber" />
            <span>14-Digit Bhu-Aadhaar ULPIN</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-nlip-amber" />
            <span>GIS Drone-Survey Verified</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-nlip-amber" />
            <span>Zero-Tamper Hash Trail</span>
          </span>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="max-w-nlip-wrap mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-nlip-amber font-semibold block mb-2">
            The DPI Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-nlip-text">
            Integrated Land Records with Zero Silos
          </h2>
        </div>

        {/* Feature Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: 360 Dossier */}
          <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border hover:border-nlip-amber/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-nlip-surface-hi border border-nlip-border flex items-center justify-center text-nlip-amber mb-4 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-nlip-text mb-2">
              360° Certified Dossier
            </h3>
            <p className="text-sm text-nlip-text-soft leading-relaxed">
              Consolidates Record of Rights (RoR), NGDRS deeds, registered mortgages,
              and tax receipts into a printable certified report.
            </p>
          </div>

          {/* Card 2: GIS Layers */}
          <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border hover:border-nlip-amber/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-nlip-surface-hi border border-nlip-border flex items-center justify-center text-nlip-amber mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-nlip-text mb-2">
              Integrated GIS & Drone Maps
            </h3>
            <p className="text-sm text-nlip-text-soft leading-relaxed">
              Real-time polygon boundaries with automated area variance calculation
              flagging discrepancies over 2% between survey & satellite.
            </p>
          </div>

          {/* Card 3: Trust Score */}
          <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border hover:border-nlip-amber/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-nlip-surface-hi border border-nlip-border flex items-center justify-center text-nlip-amber mb-4 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-nlip-text mb-2">
              Dispute-Risk Intelligence
            </h3>
            <p className="text-sm text-nlip-text-soft leading-relaxed">
              Explainable Trust Score (0–100) powered by weighted risk factors:
              boundary shifts, court encumbrances, and mutation velocity.
            </p>
          </div>

          {/* Card 4: Consent DPI */}
          <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border hover:border-nlip-amber/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-nlip-surface-hi border border-nlip-border flex items-center justify-center text-nlip-amber mb-4 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-nlip-text mb-2">
              DPI Consent Framework
            </h3>
            <p className="text-sm text-nlip-text-soft leading-relaxed">
              DEPA-compliant consent architecture allowing citizens to share
              granular, time-bound land verification data with lending banks.
            </p>
          </div>
        </div>
      </section>

      {/* Pre-Indexed Sandbox Showcase */}
      <section className="max-w-nlip-wrap mx-auto px-4 sm:px-6">
        <div className="nlip-glass-card p-6 sm:p-8 rounded-nlip border border-nlip-border-hi">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-mono uppercase text-nlip-amber tracking-wider font-semibold">
                  Pre-Indexed Sandbox Registry
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-nlip-text">
                Explore Demo Parcels across States
              </h3>
            </div>
            <Link to="/search">
              <Button variant="outline" size="sm" iconRight={<ArrowRight className="w-4 h-4" />}>
                Open Full Search
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sandboxParcels.map((p) => (
              <div
                key={p.ulpin}
                onClick={() => navigate(`/parcel/${p.ulpin}`)}
                className="p-5 rounded-xl bg-[#1a1611]/85 border border-nlip-border hover:border-nlip-amber/60 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-sm font-semibold text-nlip-text">
                      {p.state}
                    </span>
                    <Badge variant={p.variant} size="sm">
                      {p.badge}
                    </Badge>
                  </div>
                  <div className="text-sm font-mono text-nlip-amber font-bold mb-1.5 group-hover:underline">
                    {p.ulpin}
                  </div>
                  <div className="text-xs sm:text-sm text-nlip-text-soft mb-2 font-medium">
                    {p.loc}
                  </div>
                  <p className="text-xs sm:text-sm text-nlip-text-faint leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-3.5 mt-3.5 border-t border-nlip-border/50 text-xs sm:text-sm font-mono text-nlip-amber flex items-center justify-between font-medium">
                  <span>Explore Parcel</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
