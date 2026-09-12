import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  { label: 'TS 104/01 (Jangaon)', query: '104/01', state: 'TS' },
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

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const handleClear = () => {
    setQuery('');
    onSearchChange({ query: '', state: selectedState || undefined });
  };

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setQuery(preset.query);
    setSelectedState(preset.state);
  };

  const handleLocateGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setGpsStatus('idle'), 4000);
      return;
    }

    setGpsStatus('locating');
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Regional cadastral index anchor sites
        const sites = [
          { name: 'UP: Lucknow Sadar', state: 'UP', query: 'UP09412601001', lat: 26.85, lng: 80.95 },
          { name: 'TS: Hyderabad', state: 'TS', query: 'TS36280201001', lat: 17.38, lng: 78.48 },
          { name: 'TS: Jangaon (Pembarthi)', state: 'TS', query: 'TS36210401002', lat: 17.72, lng: 79.18 },
          { name: 'MH: Mumbai', state: 'MH', query: 'MH27830501001', lat: 19.07, lng: 72.87 },
          { name: 'KA: Bengaluru', state: 'KA', query: 'KA29150301001', lat: 12.97, lng: 77.59 },
          { name: 'TN: Chennai', state: 'TN', query: 'TN62080401001', lat: 13.08, lng: 80.27 },
          { name: 'PB: Amritsar', state: 'PB', query: 'PB03140701001', lat: 31.58, lng: 74.83 },
          { name: 'MP: Bhopal', state: 'MP', query: 'MP23090401001', lat: 23.21, lng: 77.35 },
        ];

        let closest = sites[0];
        let minD = Infinity;
        sites.forEach((s) => {
          const d = Math.pow(s.lat - userLat, 2) + Math.pow(s.lng - userLng, 2);
          if (d < minD) {
            minD = d;
            closest = s;
          }
        });

        setSelectedState(closest.state);
        setQuery(closest.query);
        setGpsStatus('success');
        setGpsMessage(`Matched nearest cadastral sector: ${closest.name}`);
        setTimeout(() => setGpsStatus('idle'), 5000);
      },
      (err) => {
        // Graceful error fallback for denied/unavailable geolocation
        setGpsStatus('error');
        setGpsMessage(`GPS unavailable (${err.message}). Select your state manually above.`);
        setTimeout(() => setGpsStatus('idle'), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
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

      {/* Preset Quick Badges & GPS Geolocation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
        <div className="flex flex-wrap items-center gap-2">
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

        {/* GPS Locate My Land Button */}
        <button
          type="button"
          onClick={handleLocateGps}
          disabled={gpsStatus === 'locating'}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono flex items-center gap-2 border transition-all active:scale-95 shadow-sm ${
            gpsStatus === 'locating'
              ? 'bg-nlip-amber/20 text-nlip-amber border-nlip-amber/60 animate-pulse'
              : 'bg-[#221c15] hover:bg-nlip-amber/20 text-nlip-text hover:text-nlip-amber border-nlip-border hover:border-nlip-amber/60'
          }`}
          title="Detect nearby parcel using your device GPS location"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              gpsStatus === 'locating'
                ? 'bg-nlip-amber animate-ping'
                : gpsStatus === 'success'
                ? 'bg-emerald-400'
                : gpsStatus === 'error'
                ? 'bg-rose-400'
                : 'bg-nlip-amber'
            }`}
          />
          <Navigation className="w-3.5 h-3.5" />
          <span>{gpsStatus === 'locating' ? 'Acquiring GPS...' : 'Locate My Land'}</span>
        </button>
      </div>

      {/* GPS Feedback Notice */}
      {gpsMessage && (
        <div
          className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
            gpsStatus === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          {gpsStatus === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{gpsMessage}</span>
        </div>
      )}

    </div>
  );
};
