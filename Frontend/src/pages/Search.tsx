import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchParcels } from '@/lib/api';
import { QuickSearch } from '@/components/search/QuickSearch';
import { HierarchicalSearch } from '@/components/search/HierarchicalSearch';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Loader';
import { Search, MapPin, Zap, Building2 } from 'lucide-react';
import type { SearchParams } from '@/types';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'quick' | 'hierarchical'>('quick');

  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    state: undefined,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['parcels', searchParams],
    queryFn: () => searchParcels(searchParams),
  });

  const handleQuickSearchChange = useCallback(
    (params: { query: string; state?: string }) => {
      setSearchParams({
        query: params.query || undefined,
        state: params.state || undefined,
      });
    },
    []
  );

  const handleHierarchicalSearch = useCallback(
    (params: { state?: string; district?: string; village?: string; query?: string }) => {
      setSearchParams({
        state: params.state,
        district: params.district,
        village: params.village,
        query: params.query || undefined,
      });
    },
    []
  );

  const handleSelectParcel = (ulpin: string) => {
    navigate(`/parcel/${ulpin}`);
  };

  const parcels = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page Title & Subtitle */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nlip-surface-hi border border-nlip-border text-xs font-mono text-nlip-amber mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-nlip-amber animate-pulse" />
          <span>Unified Land Registry Search</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-nlip-text mb-3">
          Search Your Land
        </h1>
        <p className="text-sm sm:text-base text-nlip-text-soft font-body leading-relaxed">
          Search across 36 State & UT registries using ULPIN, Survey Number, Khasra,
          Gata, or explore down through administrative hierarchy.
        </p>
      </div>

      {/* Search Container Panel */}
      <div className="nlip-glass-card p-6 sm:p-8 rounded-nlip border border-nlip-border shadow-2xl mb-10">
        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-nlip-border pb-4 mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-nlip-sm text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'quick'
                ? 'bg-nlip-amber text-[#17140f] font-bold shadow-md'
                : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Quick Search / ULPIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hierarchical')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-nlip-sm text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'hierarchical'
                ? 'bg-nlip-amber text-[#17140f] font-bold shadow-md'
                : 'text-nlip-text-soft hover:text-nlip-text hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hierarchical (State → Village)</span>
          </button>
        </div>

        {/* Tab 1: Quick Search */}
        {activeTab === 'quick' && (
          <QuickSearch
            onSearchChange={handleQuickSearchChange}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Hierarchical Search */}
        {activeTab === 'hierarchical' && (
          <HierarchicalSearch
            onSearch={handleHierarchicalSearch}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Results / Loading / Empty State Section */}
      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-nlip-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="nlip-glass-card p-5 rounded-nlip border border-nlip-border space-y-3"
                >
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && isError && (
          <div className="nlip-glass-card p-6 rounded-nlip border border-red-500/30 text-center">
            <p className="text-red-400 text-sm font-mono">
              Error fetching parcels: {(error as Error)?.message || 'Network error'}
            </p>
          </div>
        )}

        {!isLoading && !isError && parcels.length === 0 && (
          <EmptyState
            title="Parcel Record Not Found"
            description="No parcel record matched your search query in the selected state registry."
            onSelectSandboxParcel={handleSelectParcel}
          />
        )}

        {!isLoading && !isError && parcels.length > 0 && (
          <SearchResultsList
            parcels={parcels}
            total={total}
            onSelectParcel={handleSelectParcel}
          />
        )}
      </div>
    </div>
  );
};
