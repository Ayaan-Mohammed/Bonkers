import React, { useState, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface QuickSearchProps {
  initialQuery?: string;
  initialState?: string;
  onSearchChange: (params: { query: string; state?: string }) => void;
  isLoading?: boolean;
}

const STATES = [
  { code: '', label: 'All States & UTs' },
  { code: 'UP', label: 'Uttar Pradesh (UP)' },
  { code: 'MH', label: 'Maharashtra (MH)' },
  { code: 'KA', label: 'Karnataka (KA)' },
  { code: 'TN', label: 'Tamil Nadu (TN)' },
  { code: 'TS', label: 'Telangana (TS)' },
];

const PRESETS = [
  { label: 'UP Khasra K-2234', query: 'K-2234', state: 'UP' },
  { label: 'MH 7/12-0501', query: '7/12-0501', state: 'MH' },
  { label: 'KA 15/03 (Bengaluru)', query: '15/03', state: 'KA' },
  { label: 'TS 28/02 (Hyderabad)', query: '28/02', state: 'TS' },
  { label: 'TN 62/08 (Chennai)', query: '62/08', state: 'TN' },
];

export const QuickSearch: React.FC<QuickSearchProps> = ({
  initialQuery = '',
  initialState = '',
  onSearchChange,
  isLoading = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedState, setSelectedState] = useState(initialState);

  // Debounce query input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange({
        query: query.trim(),
        state: selectedState || undefined,
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [query, selectedState, onSearchChange]);

  const handleClear = () => {
    setQuery('');
    onSearchChange({ query: '', state: selectedState || undefined });
  };

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setQuery(preset.query);
    setSelectedState(preset.state);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* State Filter Selector */}
        <div className="sm:w-60 shrink-0">
          <label
            htmlFor="state-select"
            className="block text-xs sm:text-sm font-mono text-nlip-text-soft mb-2 font-medium uppercase tracking-wider"
          >
            State / Registry
          </label>
          <div className="relative">
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full h-12 px-3.5 py-2 bg-[#1c1813]/90 border border-nlip-border hover:border-nlip-amber/50 rounded-nlip-sm text-sm sm:text-base text-nlip-text focus:outline-none focus:border-nlip-amber focus:ring-1 focus:ring-nlip-amber/30 transition-all appearance-none cursor-pointer"
            >
              {STATES.map((s) => (
                <option key={s.code} value={s.code} className="bg-[#1c1813] text-nlip-text">
                  {s.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-nlip-amber text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Free-text Query Input */}
        <div className="flex-1">
          <label
            htmlFor="quick-query"
            className="block text-xs sm:text-sm font-mono text-nlip-text-soft mb-2 font-medium uppercase tracking-wider"
          >
            Identifier (ULPIN, Survey, Khasra, Gata, Patta)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nlip-amber">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              id="quick-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. UP09412601001, K-2234, 412/601, 83/05..."
              className="w-full h-12 pl-11 pr-11 bg-[#1c1813]/90 border border-nlip-border hover:border-nlip-amber/50 rounded-nlip-sm text-sm sm:text-base font-mono text-nlip-text placeholder:text-nlip-text-faint focus:outline-none focus:border-nlip-amber focus:ring-1 focus:ring-nlip-amber/30 transition-all"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-nlip-text-soft hover:text-nlip-amber transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Quick Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1.5">
        <span className="text-xs sm:text-sm font-mono text-nlip-text-soft flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-nlip-amber" />
          <span>Quick Samples:</span>
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="px-3 py-1.5 text-xs sm:text-sm font-mono bg-[#1f1a14]/90 hover:bg-nlip-amber/20 border border-nlip-border hover:border-nlip-amber/60 text-nlip-text hover:text-nlip-amber rounded-lg transition-all active:scale-95 shadow-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
