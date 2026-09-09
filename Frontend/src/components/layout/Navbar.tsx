import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/store/useSessionStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  User,
  Shield,
  Code2,
  FileCheck2,
  Search,
  LogOut,
  ChevronDown,
  Globe,
} from 'lucide-react';
import type { UserRole } from '@/types';

// Pre-configured demo profiles from seed data to make role-switching effortless for SIH evaluation
const DEMO_PROFILES = [
  {
    name: 'Arjun Sharma',
    email: 'arjun@example.in',
    role: 'citizen' as UserRole,
    label: 'Citizen (UP)',
  },
  {
    name: 'Ravi Kumar',
    email: 'ravi.kumar@revenue.ka.gov.in',
    role: 'revenue_officer' as UserRole,
    label: 'Revenue Officer (KA)',
  },
  {
    name: 'Priya Nair',
    email: 'priya@bankofmah.in',
    role: 'bank_official' as UserRole,
    label: 'Bank Official (MH)',
  },
  {
    name: 'Dev Portal User',
    email: 'dev@nlip.in',
    role: 'developer' as UserRole,
    label: 'Developer API Partner',
  },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useSessionStore();
  const { i18n, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'hi' ? 'en' : 'hi');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isOfficer =
    user?.role === 'revenue_officer' ||
    user?.role === 'registration_officer' ||
    user?.role === 'planning_officer' ||
    user?.role === 'admin';

  const isDeveloper = user?.role === 'developer' || user?.role === 'admin';

  const handleSelectDemoProfile = (profile: (typeof DEMO_PROFILES)[0]) => {
    login(
      {
        id: `usr-${profile.role}`,
        name: profile.name,
        email: profile.email,
        mobile: '9999999999',
        role: profile.role,
        state_id: 'state-001',
        created_at: new Date().toISOString(),
      },
      `mock-jwt-token-${profile.role}`
    );
    setRoleDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#17140f]/90 backdrop-blur-md border-b border-nlip-border">
      <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group select-none transition-transform active:scale-95"
        >
          <span className="text-xl text-nlip-amber font-bold leading-none group-hover:drop-shadow-[0_0_8px_rgba(231,174,89,0.5)] transition-all">
            ◈
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold font-display tracking-tight text-nlip-text">
              NLIP
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-nlip-text-faint -mt-1 hidden sm:block">
              Digital Public Infra
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 font-body text-sm">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-nlip-amber bg-nlip-amber/10 font-semibold'
                : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          <Link
            to="/search"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive('/search')
                ? 'text-nlip-amber bg-nlip-amber/10 font-semibold'
                : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Land</span>
          </Link>

          <Link
            to="/consents"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive('/consents')
                ? 'text-nlip-amber bg-nlip-amber/10 font-semibold'
                : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Consents</span>
          </Link>

          {/* Role-aware link: Officer Dashboard */}
          {isOfficer && (
            <Link
              to="/officer-dashboard"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/officer-dashboard')
                  ? 'text-nlip-amber bg-nlip-amber/10 font-semibold'
                  : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-nlip-amber" />
              <span>Officer Dashboard</span>
            </Link>
          )}

          {/* Role-aware link: Developer Sandbox */}
          {isDeveloper && (
            <Link
              to="/dev-sandbox"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/dev-sandbox')
                  ? 'text-nlip-amber bg-nlip-amber/10 font-semibold'
                  : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-nlip-amber" />
              <span>Dev Sandbox</span>
            </Link>
          )}
        </nav>

        {/* Right Action: Search CTA & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Search CTA button */}
          <Link to="/search" className="hidden sm:inline-flex">
            <Button
              variant="outline"
              size="sm"
              icon={<Search className="w-3.5 h-3.5" />}
            >
              Quick Search
            </Button>
          </Link>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-nlip-surface-hi border border-nlip-border hover:border-nlip-border-hi transition-colors text-xs font-mono text-nlip-text"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-nlip-amber" />
            <span>{i18n.language === 'hi' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Role Switcher Pill / Session dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-nlip-surface-hi border border-nlip-border hover:border-nlip-border-hi transition-colors text-xs font-mono text-nlip-text"
              title="Switch demo persona for testing"
            >
              <span className="w-2 h-2 rounded-full bg-nlip-amber" />
              <span className="max-w-[110px] truncate">
                {isAuthenticated && user
                  ? `${user.role.replace('_', ' ')}`
                  : 'Guest Persona'}
              </span>
              <ChevronDown className="w-3 h-3 text-nlip-text-soft" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 nlip-glass-card bg-[#1f1a14] border border-nlip-border-hi shadow-xl rounded-nlip p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-nlip-border/60">
                  <div className="text-[10px] uppercase font-mono text-nlip-amber tracking-wider font-semibold">
                    Demo Role Switcher
                  </div>
                  <div className="text-xs text-nlip-text-soft">
                    Select a persona to test role-gated views:
                  </div>
                </div>

                <div className="py-1 space-y-1">
                  {DEMO_PROFILES.map((p) => {
                    const isSelected = user?.email === p.email;
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectDemoProfile(p)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-nlip-amber/15 text-nlip-amber font-bold'
                            : 'text-nlip-text hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{p.label}</div>
                          <div className="text-[10px] text-nlip-text-faint">{p.name}</div>
                        </div>
                        {isSelected && <span className="text-nlip-amber">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {isAuthenticated && (
                  <div className="pt-1 border-t border-nlip-border/60">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 rounded-md text-xs font-mono text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Reset to Guest</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-nlip-text-soft hover:text-nlip-text hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-nlip-border bg-[#17140f] px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-nlip-text hover:bg-white/5"
          >
            Home
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-nlip-text hover:bg-white/5"
          >
            Search Land
          </Link>
          <Link
            to="/consents"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-nlip-text hover:bg-white/5"
          >
            Consents
          </Link>
          {isOfficer && (
            <Link
              to="/officer-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-nlip-amber hover:bg-white/5"
            >
              Officer Dashboard
            </Link>
          )}
          {isDeveloper && (
            <Link
              to="/dev-sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-nlip-amber hover:bg-white/5"
            >
              Developer Sandbox
            </Link>
          )}
          <div className="pt-2 border-t border-nlip-border/60">
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-nlip-text font-mono bg-nlip-surface-hi"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-nlip-amber" />
                <span>Language / भाषा</span>
              </span>
              <span className="text-nlip-amber font-bold">
                {i18n.language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
