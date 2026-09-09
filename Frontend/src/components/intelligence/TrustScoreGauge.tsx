import React from 'react';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export interface TrustScoreGaugeProps {
  score: number; // 0–100
  statusBand?: 'GOOD' | 'ATTENTION' | 'HIGH RISK';
  description?: string;
  engineVersion?: string;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  statusBand,
  description,
  engineVersion = 'v1.2-rules',
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine band & styling
  let band = statusBand;
  if (!band) {
    if (clampedScore >= 85) band = 'GOOD';
    else if (clampedScore >= 60) band = 'ATTENTION';
    else band = 'HIGH RISK';
  }

  let badgeVariant: 'green' | 'amber' | 'red' = 'green';
  let ringColor = '#10b981'; // Emerald
  let Icon = ShieldCheck;
  let defaultDesc = 'All cadastral, ownership, and encumbrance checks cleared without flags.';

  if (band === 'ATTENTION') {
    badgeVariant = 'amber';
    ringColor = '#f59e0b'; // Amber
    Icon = AlertTriangle;
    defaultDesc = 'Moderate flags identified: area survey variance or registered bank mortgage.';
  } else if (band === 'HIGH RISK') {
    badgeVariant = 'red';
    ringColor = '#ef4444'; // Red
    Icon = ShieldAlert;
    defaultDesc = 'Critical flags identified: active court stay order, disputed title, or severe variance.';
  }

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  return (
    <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border flex flex-col items-center text-center space-y-4 shadow-lg">
      <div className="flex items-center justify-between w-full text-xs border-b border-nlip-border/50 pb-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-nlip-text-faint">
          Score Engine
        </span>
        <Badge variant={badgeVariant} size="sm" dot>
          {band}
        </Badge>
      </div>

      {/* Radial Meter SVG */}
      <div className="relative w-44 h-44 flex items-center justify-center my-1">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="12"
            strokeDasharray={arcLength}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-nlip-text">
            {clampedScore}
          </span>
          <span className="text-[10px] font-mono text-nlip-text-soft uppercase tracking-wider mt-0.5">
            / 100 Score
          </span>
        </div>
      </div>

      {/* Status Band Description */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-center gap-1.5 font-bold text-nlip-text">
          <Icon className="w-4 h-4" style={{ color: ringColor }} />
          <span>Status: {band}</span>
        </div>
        <p className="text-[11px] text-nlip-text-soft max-w-xs mx-auto leading-relaxed">
          {description || defaultDesc}
        </p>
      </div>

      {/* Footer */}
      <div className="w-full pt-3 border-t border-nlip-border/40 flex justify-between text-[10px] font-mono text-nlip-text-faint">
        <span>Engine: {engineVersion}</span>
        <span className="text-emerald-400">Deterministic</span>
      </div>
    </div>
  );
};
