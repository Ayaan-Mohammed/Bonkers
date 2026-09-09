import React from 'react';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export interface TrustScoreGaugeProps {
  score: number; // 0–100
  modelVersion?: string;
  computedAt?: string;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  modelVersion = 'v0.1-seed',
  computedAt,
}) => {
  // Normalize score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine risk category and color
  let riskLabel = 'LOW DISPUTE RISK';
  let riskColor = '#34d399'; // Emerald
  let badgeVariant: 'green' | 'amber' | 'red' = 'green';
  let Icon = ShieldCheck;
  let description =
    'Clean cadastral boundaries, verified title deeds, and zero active litigation on file.';

  if (clampedScore > 60) {
    riskLabel = 'HIGH DISPUTE PROBABILITY';
    riskColor = '#f43f5e'; // Rose
    badgeVariant = 'red';
    Icon = ShieldAlert;
    description =
      'Significant title risks identified: active court litigation, severe boundary variance, or unapproved building deviations.';
  } else if (clampedScore > 30) {
    riskLabel = 'MODERATE DISPUTE RISK';
    riskColor = '#e7ae59'; // Amber
    badgeVariant = 'amber';
    Icon = AlertTriangle;
    description =
      'Minor boundary discrepancies, active bank charges, or joint ownership complexities detected.';
  }

  // SVG Gauge calculations (radius = 70, circumference = 2 * PI * 70 = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // We make a 270-degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  return (
    <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border flex flex-col items-center text-center space-y-4">
      <div className="flex items-center justify-between w-full text-xs border-b border-nlip-border/50 pb-2.5">
        <span className="font-mono text-[11px] uppercase text-nlip-text-faint">
          AI/ML Trust Score
        </span>
        <Badge variant={badgeVariant} size="sm" dot>
          {riskLabel}
        </Badge>
      </div>

      {/* Radial Meter SVG */}
      <div className="relative w-44 h-44 flex items-center justify-center my-1">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
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
          {/* Animated Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={riskColor}
            strokeWidth="12"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-nlip-text">
            {clampedScore.toFixed(1)}
          </span>
          <span className="text-[11px] font-mono text-nlip-text-soft uppercase tracking-wider">
            Risk Index / 100
          </span>
        </div>
      </div>

      {/* Evaluation Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-center gap-1.5 font-bold text-nlip-text">
          <Icon className="w-4 h-4" style={{ color: riskColor }} />
          <span>{riskLabel}</span>
        </div>
        <p className="text-[11px] text-nlip-text-soft max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Model Spec Footer */}
      <div className="w-full pt-3 border-t border-nlip-border/40 flex justify-between text-[10px] font-mono text-nlip-text-faint">
        <span>Model: {modelVersion}</span>
        {computedAt && <span>Eval: {computedAt.slice(0, 10)}</span>}
      </div>
    </div>
  );
};
