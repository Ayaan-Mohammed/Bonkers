import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MapPin, ArrowRight, Layers, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import type { ParcelSummary } from '@/types';

export interface SearchResultsListProps {
  parcels: ParcelSummary[];
  total: number;
  onSelectParcel: (ulpin: string) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  parcels,
  total,
  onSelectParcel,
}) => {
  const getLandUseBadgeVariant = (landUse: string) => {
    switch (landUse) {
      case 'agricultural':
        return 'green';
      case 'residential':
        return 'blue';
      case 'commercial':
        return 'amber';
      default:
        return 'neutral';
    }
  };

  const formatAcres = (sqm: number | null) => {
    if (!sqm) return '—';
    const acres = (sqm / 4046.86).toFixed(2);
    return `${sqm.toLocaleString()} m² (${acres} acres)`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-nlip-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-nlip-text-soft">
            Found Parcels
          </span>
          <Badge variant="amber" size="sm">
            {total} {total === 1 ? 'record' : 'records'}
          </Badge>
        </div>
        <span className="text-xs font-mono text-nlip-text-faint">
          Canonical Join Key: Bhu-Aadhaar ULPIN
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parcels.map((parcel) => (
          <div
            key={parcel.id}
            onClick={() => onSelectParcel(parcel.ulpin)}
            className="nlip-glass-card p-5 rounded-nlip border border-nlip-border hover:border-nlip-amber/60 hover:shadow-amber-glow transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Header: ULPIN + Land Use Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-nlip-text-faint block">
                    ULPIN (Bhu-Aadhaar)
                  </span>
                  <span className="text-sm sm:text-base font-mono font-bold text-nlip-amber tracking-tight group-hover:underline">
                    {parcel.ulpin}
                  </span>
                </div>
                <Badge
                  variant={getLandUseBadgeVariant(parcel.land_use_type)}
                  size="sm"
                  dot
                >
                  {parcel.land_use_type}
                </Badge>
              </div>

              {/* Location Tag */}
              <div className="flex items-center gap-1.5 text-xs text-nlip-text-soft mb-3">
                <MapPin className="w-3.5 h-3.5 text-nlip-amber shrink-0" />
                <span className="font-medium text-nlip-text">
                  {parcel.village_name}
                </span>
                <span>·</span>
                <span>{parcel.district_name}</span>
                <span>·</span>
                <span className="font-mono text-nlip-text-faint">
                  [{parcel.state_code}]
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/25 border border-nlip-border/50 text-xs font-mono mb-4">
                <div>
                  <span className="text-[10px] text-nlip-text-faint block">
                    Survey / Khasra No.
                  </span>
                  <span className="text-nlip-text font-medium">
                    {parcel.survey_number || parcel.khasra_number || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-nlip-text-faint block">
                    Recorded Area
                  </span>
                  <span className="text-nlip-text font-medium">
                    {formatAcres(parcel.area_recorded_sqm)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-nlip-border/50 flex items-center justify-between">
              <span className="text-xs font-mono text-nlip-text-faint flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified RoR Registry</span>
              </span>

              <span className="text-xs font-medium font-body text-nlip-amber group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>View Dossier & GIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
