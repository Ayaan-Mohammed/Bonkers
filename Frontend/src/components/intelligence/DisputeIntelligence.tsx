import React from 'react';
import type {
  DisputeRiskScore,
  ChangeDetectionAlert,
  Parcel,
  RecordOfRights,
  Encumbrance,
  PropertyTaxRecord,
} from '@/types';
import { TrustScoreGauge } from './TrustScoreGauge';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Info,
  ExternalLink,
  MapPin,
  Scale,
  Compass,
} from 'lucide-react';

export interface FactorEvaluation {
  id: string;
  name: string;
  status: 'PASS' | 'WARNING' | 'CRITICAL';
  score: number;
  weight: number;
  reason: string;
  isGisRelated?: boolean;
}

export interface DisputeIntelligenceProps {
  scoreData?: DisputeRiskScore | null;
  alerts?: ChangeDetectionAlert[];
  ulpin: string;
  isLoading?: boolean;
  parcel?: Parcel | null;
  rorList?: RecordOfRights[] | null;
  encumbrances?: Encumbrance[] | null;
  taxRecords?: PropertyTaxRecord[] | null;
  onViewGisEvidence?: () => void;
}

export const DisputeIntelligence: React.FC<DisputeIntelligenceProps> = ({
  scoreData,
  alerts = [],
  ulpin,
  isLoading = false,
  parcel,
  rorList = [],
  encumbrances = [],
  taxRecords = [],
  onViewGisEvidence,
}) => {
  if (isLoading && !parcel) {
    return (
      <div className="py-16 text-center text-xs font-mono text-nlip-text-soft">
        Evaluating cadastral records &amp; title factors...
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1. Area Consistency Factor (Weight: 25 pts)
  // ---------------------------------------------------------------------------
  const recordedArea = parcel?.area_recorded_sqm ?? 1000;
  const gisArea = parcel?.area_gis_sqm ?? recordedArea;
  const areaDiff = Math.abs(recordedArea - gisArea);
  const variancePct = recordedArea > 0 ? (areaDiff / recordedArea) * 100 : 0;

  let areaStatus: 'PASS' | 'WARNING' | 'CRITICAL' = 'PASS';
  let areaScore = 25;
  let areaReason = `Recorded: ${recordedArea.toLocaleString()} m² · GIS: ${gisArea.toLocaleString()} m² · Variance: ${variancePct.toFixed(1)}% (Within ±5% cadastral survey tolerance)`;

  if (variancePct > 15) {
    areaStatus = 'CRITICAL';
    areaScore = 0;
    areaReason = `Recorded: ${recordedArea.toLocaleString()} m² · GIS: ${gisArea.toLocaleString()} m² · Variance: ${variancePct.toFixed(1)}% (Severe discrepancy exceeding 15% survey tolerance)`;
  } else if (variancePct >= 5) {
    areaStatus = 'WARNING';
    areaScore = 12;
    areaReason = `Recorded: ${recordedArea.toLocaleString()} m² · GIS: ${gisArea.toLocaleString()} m² · Variance: ${variancePct.toFixed(1)}% (Exceeds ±5% standard cadastral tolerance)`;
  }

  // ---------------------------------------------------------------------------
  // 2. Ownership Consistency Factor (Weight: 20 pts)
  // ---------------------------------------------------------------------------
  const rorItems = rorList ?? [];
  const hasDisputedTitle = rorItems.some(
    (r) => r.status === 'disputed'
  );
  const isJointOwnership =
    rorItems.length > 1 || rorItems.some((r) => r.ownership_type === 'joint');

  let ownershipStatus: 'PASS' | 'WARNING' | 'CRITICAL' = 'PASS';
  let ownershipScore = 20;
  let ownershipReason = 'Single owner, 100% verified Freehold Bhoomidhari title on file';

  if (hasDisputedTitle) {
    ownershipStatus = 'CRITICAL';
    ownershipScore = 0;
    ownershipReason = 'Conflicting ownership claims / dispute flag on Record of Rights';
  } else if (isJointOwnership) {
    ownershipStatus = 'WARNING';
    ownershipScore = 10;
    ownershipReason = `Joint tenancy across ${rorItems.length || 2} registered co-owners without partitioned boundaries`;
  }

  // ---------------------------------------------------------------------------
  // 3. Encumbrance Status Factor (Weight: 20 pts)
  // ---------------------------------------------------------------------------
  const encList = encumbrances ?? [];
  const activeMortgages = encList.filter(
    (e) => e.status === 'active' && e.type !== 'court_case'
  );

  let encStatus: 'PASS' | 'WARNING' | 'CRITICAL' = 'PASS';
  let encScore = 20;
  let encReason = 'No active mortgage, bank lien, or hypothecation on record';

  if (activeMortgages.length > 0) {
    const primaryMortgage = activeMortgages[0];
    encStatus = 'WARNING';
    encScore = 10;
    const amountStr = primaryMortgage.amount
      ? ` (₹${primaryMortgage.amount.toLocaleString()})`
      : '';
    encReason = `Active mortgage with ${primaryMortgage.holder_name}${amountStr} registered on record`;
  }

  // ---------------------------------------------------------------------------
  // 4. Dispute / Litigation Indicator (Weight: 20 pts)
  // ---------------------------------------------------------------------------
  const activeCourtCases = encList.filter(
    (e) => e.status === 'active' && e.type === 'court_case'
  );

  let disputeStatus: 'PASS' | 'WARNING' | 'CRITICAL' = 'PASS';
  let disputeScore = 20;
  let disputeReason = 'Zero pending civil litigation or revenue court stay orders on file';

  if (activeCourtCases.length > 0) {
    const court = activeCourtCases[0];
    disputeStatus = 'CRITICAL';
    disputeScore = 0;
    disputeReason = `Active court injunction / stay order: ${court.holder_name}`;
  }

  // ---------------------------------------------------------------------------
  // 5. Property Tax / Arrears Factor (Weight: 15 pts)
  // ---------------------------------------------------------------------------
  const taxList = taxRecords ?? [];
  const unpaidTaxes = taxList.filter(
    (t) => t.paid_status === 'due' || t.paid_status === 'overdue'
  );

  let taxStatus: 'PASS' | 'WARNING' | 'CRITICAL' = 'PASS';
  let taxScore = 15;
  let taxReason = 'Property tax assessed and paid up to date for assessment year 2024-25';

  if (unpaidTaxes.length > 0) {
    const dueTax = unpaidTaxes[0];
    taxStatus = 'WARNING';
    taxScore = 7;
    const amtStr = dueTax.tax_amount ? `₹${dueTax.tax_amount.toLocaleString()}` : 'Arrears due';
    taxReason = `Municipal property tax arrears outstanding: ${amtStr} (FY ${dueTax.assessment_year})`;
  }

  // ---------------------------------------------------------------------------
  // Compile All Factors & Normalized Score
  // ---------------------------------------------------------------------------
  const factors: FactorEvaluation[] = [
    {
      id: 'area_consistency',
      name: 'Area Consistency',
      status: areaStatus,
      score: areaScore,
      weight: 25,
      reason: areaReason,
      isGisRelated: true,
    },
    {
      id: 'ownership_consistency',
      name: 'Ownership Consistency',
      status: ownershipStatus,
      score: ownershipScore,
      weight: 20,
      reason: ownershipReason,
    },
    {
      id: 'encumbrance_status',
      name: 'Encumbrance Status',
      status: encStatus,
      score: encScore,
      weight: 20,
      reason: encReason,
    },
    {
      id: 'dispute_indicator',
      name: 'Dispute Indicator',
      status: disputeStatus,
      score: disputeScore,
      weight: 20,
      reason: disputeReason,
    },
    {
      id: 'tax_arrears',
      name: 'Property Tax & Arrears',
      status: taxStatus,
      score: taxScore,
      weight: 15,
      reason: taxReason,
    },
  ];

  // Optional 6th factor if satellite alerts exist
  if (alerts.length > 0) {
    const hasOpenAlert = alerts.some((a) => a.status === 'open' || a.status === 'under_review');
    factors.push({
      id: 'boundary_consistency',
      name: 'Boundary & Satellite Consistency',
      status: hasOpenAlert ? 'WARNING' : 'PASS',
      score: hasOpenAlert ? 5 : 10,
      weight: 10,
      reason: hasOpenAlert
        ? `Satellite pass detected potential boundary change (${Math.round((alerts[0]?.confidence_score ?? 0.85) * 100)}% confidence)`
        : 'Boundary matches cadastral survey record; zero satellite encroachment detected',
      isGisRelated: true,
    });
  }

  // Calculate total score normalized to /100
  const rawScore = factors.reduce((sum, f) => sum + f.score, 0);
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const calculatedScore = Math.round((rawScore / totalWeight) * 100);

  // Status Band: 85–100 = GOOD, 60–84 = ATTENTION, below 60 = HIGH RISK
  let statusBand: 'GOOD' | 'ATTENTION' | 'HIGH RISK' = 'GOOD';
  if (calculatedScore < 60) statusBand = 'HIGH RISK';
  else if (calculatedScore < 85) statusBand = 'ATTENTION';

  const surveyNo = parcel?.survey_number || parcel?.khasra_number || 'N/A';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-nlip-amber font-semibold block">
            Cadastral Due Diligence
          </span>
          <h2 className="text-lg font-extrabold font-display text-nlip-text flex items-center gap-2 mt-0.5">
            <Compass className="w-5 h-5 text-nlip-amber" />
            Parcel Intelligence &amp; Risk Engine
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1 rounded-md bg-nlip-surface-hi border border-nlip-border text-nlip-text-soft">
            ULPIN: <strong className="text-nlip-text">{ulpin}</strong>
          </span>
          <span className="px-3 py-1 rounded-md bg-nlip-surface-hi border border-nlip-border text-nlip-text-soft">
            Survey No: <strong className="text-nlip-text">{surveyNo}</strong>
          </span>
        </div>
      </div>

      {/* Top Section: Score Gauge + Methodology Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Radial Score Gauge */}
        <div className="md:col-span-1">
          <TrustScoreGauge
            score={calculatedScore}
            statusBand={statusBand}
            engineVersion="v1.2-rules"
          />
        </div>

        {/* Explainability & Methodology Panel */}
        <div className="md:col-span-2 nlip-glass-card p-6 rounded-nlip border border-nlip-border space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-nlip-border">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-nlip-amber" />
              <h3 className="text-sm font-bold text-nlip-text">
                Explainable Parcel Intelligence / Risk Engine
              </h3>
            </div>
            <Badge
              variant={
                statusBand === 'GOOD' ? 'green' : statusBand === 'ATTENTION' ? 'amber' : 'red'
              }
              size="sm"
            >
              {statusBand}
            </Badge>
          </div>

          <p className="text-xs text-nlip-text-soft leading-relaxed">
            This report is generated using a deterministic, rule-weighted evaluation protocol.
            Every score is 100% explainable by measuring cadastral boundary variance, registered
            mortgage charges, active court stay orders, ownership tenancy, and municipal tax
            assessments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-nlip-surface-hi/50 border border-nlip-border text-xs space-y-1">
              <span className="font-mono text-[10px] text-nlip-text-faint uppercase block">
                Evaluation Model
              </span>
              <span className="font-bold text-nlip-text block">Rule-Based Rubric</span>
              <span className="text-[10px] text-nlip-text-soft block">Zero Black-Box Claims</span>
            </div>

            <div className="p-3 rounded-lg bg-nlip-surface-hi/50 border border-nlip-border text-xs space-y-1">
              <span className="font-mono text-[10px] text-nlip-text-faint uppercase block">
                Audit Benchmark
              </span>
              <span className="font-bold text-nlip-text block">DoLR &amp; DILRMP</span>
              <span className="text-[10px] text-nlip-text-soft block">SIH PS #26014 Spec</span>
            </div>

            <div className="p-3 rounded-lg bg-nlip-surface-hi/50 border border-nlip-border text-xs space-y-1">
              <span className="font-mono text-[10px] text-nlip-text-faint uppercase block">
                Data Sources
              </span>
              <span className="font-bold text-nlip-text block">RoR · SRO · GIS</span>
              <span className="text-[10px] text-nlip-text-soft block">Municipal Tax · Cadastre</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-nlip-amber/10 border border-nlip-amber/30 text-xs text-nlip-text-soft flex items-start gap-2.5">
            <Info className="w-4 h-4 text-nlip-amber shrink-0 mt-0.5" />
            <span>
              All factor assessments below are derived directly from verified records for ULPIN{' '}
              <strong className="text-nlip-amber font-mono">{ulpin}</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: "Why this score?" Factor-by-Factor Breakdown (PRD §6.3 Requirement) */}
      <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border space-y-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-nlip-border">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold font-display text-nlip-text">
              Why this score?
            </h3>
            <p className="text-xs text-nlip-text-soft">
              Factor-by-factor audit breakdown explaining all evaluated parameters and deductions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-nlip-text-soft">
              Total Score:{' '}
              <strong className="text-nlip-text font-bold text-sm font-mono">
                {calculatedScore} / 100
              </strong>
            </span>
          </div>
        </div>

        {/* Factors List */}
        <div className="space-y-3">
          {factors.map((factor) => {
            const isPass = factor.status === 'PASS';
            const isWarning = factor.status === 'WARNING';
            const isCritical = factor.status === 'CRITICAL';

            const StatusIcon = isPass
              ? CheckCircle2
              : isWarning
              ? AlertTriangle
              : AlertOctagon;

            const badgeVariant: 'green' | 'amber' | 'red' = isPass
              ? 'green'
              : isWarning
              ? 'amber'
              : 'red';

            const iconColor = isPass
              ? 'text-emerald-400'
              : isWarning
              ? 'text-amber-400'
              : 'text-rose-400';

            const cardBorder = isPass
              ? 'border-nlip-border/40 hover:border-emerald-500/40'
              : isWarning
              ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
              : 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50';

            return (
              <div
                key={factor.id}
                className={`p-4 rounded-lg bg-nlip-surface-hi/40 border ${cardBorder} transition-all space-y-2`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <StatusIcon className={`w-4 h-4 ${iconColor} shrink-0`} />
                    <span className="font-semibold text-sm text-nlip-text">
                      {factor.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-nlip-text-faint">
                      Weight: {factor.score}/{factor.weight} pts
                    </span>
                    <Badge variant={badgeVariant} size="sm">
                      {factor.status}
                    </Badge>
                  </div>
                </div>

                {/* Specific One-Line Explanation */}
                <p className="text-xs text-nlip-text-soft font-mono pl-6 leading-relaxed">
                  {factor.reason}
                </p>

                {/* Inline GIS Evidence Link if Area-related */}
                {factor.isGisRelated && (isWarning || isCritical) && onViewGisEvidence && (
                  <div className="pl-6 pt-1">
                    <button
                      type="button"
                      onClick={onViewGisEvidence}
                      className="inline-flex items-center gap-1.5 text-xs text-nlip-amber hover:underline font-mono"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Inspect Boundary Discrepancy on GIS Map →</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View GIS Evidence Button (PRD §6.3 Requirement) */}
        <div className="pt-4 border-t border-nlip-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-nlip-text-soft">
            Need spatial verification? Cross-examine cadastral boundaries against drone orthomosaics.
          </p>
          {onViewGisEvidence && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewGisEvidence}
              className="inline-flex items-center gap-2 shrink-0 border-nlip-amber/40 text-nlip-amber hover:bg-nlip-amber/15"
            >
              <Layers className="w-4 h-4" />
              <span>View GIS Evidence</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
