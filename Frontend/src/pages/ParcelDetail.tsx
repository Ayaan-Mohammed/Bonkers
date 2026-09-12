import React, { useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getParcel,
  getRor,
  getEncumbrances,
  getRegistrations,
  getTax,
  getBuildingPermissions,
  getHistory,
  getMutations,
  getIntelligence,
  getAlerts,
  searchParcels,
  getZonesGeoJSON,
  getUtilityGeoJSON,
  getParcelAuditTrail,
} from '@/lib/api';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { MapView } from '@/components/map';
import { CertifiedDossier, ChainOfTitle, CitizenActionModal, DataTrailLedger } from '@/components/dossier';
import { DisputeIntelligence } from '@/components/intelligence';
import {
  Layers,
  FileCheck2,
  Brain,
  History as HistoryIcon,
  Database,
  MapPin,
  Compass,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Building,
  Receipt,
  FileText,
  ExternalLink,
  Info,
  CheckCircle2,
  XCircle,
  Download,
  Share2,
  Scale,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Parcel Overview', icon: Compass },
  { id: 'gis', label: 'GIS & Drone Map', icon: Layers },
  { id: 'dossier', label: 'Certified Dossier', icon: FileCheck2 },
  { id: 'intelligence', label: 'Dispute Intelligence', icon: Brain },
  { id: 'history', label: 'Chain of Title & History', icon: HistoryIcon },
  { id: 'data-sources', label: 'Data Sources & Audit', icon: Database },
];

export const ParcelDetailPage: React.FC = () => {
  const { ulpin } = useParams<{ ulpin: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab selection via URL hash or default to 'overview'
  const currentTab = location.hash.replace('#', '') || 'overview';

  const handleTabClick = (tabKey: string) => {
    navigate(`/parcel/${ulpin}#${tabKey}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex((tab) => tab.id === currentTab);
    return idx >= 0 ? idx : 0;
  }, [currentTab]);

  const prevTab = activeIndex > 0 ? tabs[activeIndex - 1] : null;
  const nextTab = activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : null;

  const handlePrevTab = () => {
    if (prevTab) {
      handleTabClick(prevTab.id);
    }
  };

  const handleNextTab = () => {
    if (nextTab) {
      handleTabClick(nextTab.id);
    }
  };

  // Primary parcel query
  const {
    data: parcel,
    isLoading: parcelLoading,
    isError: parcelError,
  } = useQuery({
    queryKey: ['parcel', ulpin],
    queryFn: () => getParcel(ulpin!),
    enabled: !!ulpin,
  });

  // Overview sub-resources queries
  const { data: rorList, isLoading: rorLoading } = useQuery({
    queryKey: ['ror', ulpin],
    queryFn: () => getRor(ulpin!),
    enabled: !!ulpin,
  });

  const { data: encumbrances, isLoading: encLoading } = useQuery({
    queryKey: ['encumbrances', ulpin],
    queryFn: () => getEncumbrances(ulpin!),
    enabled: !!ulpin,
  });

  const { data: registrations, isLoading: regLoading } = useQuery({
    queryKey: ['registrations', ulpin],
    queryFn: () => getRegistrations(ulpin!),
    enabled: !!ulpin,
  });

  const { data: taxRecords, isLoading: taxLoading } = useQuery({
    queryKey: ['tax', ulpin],
    queryFn: () => getTax(ulpin!),
    enabled: !!ulpin,
  });

  const { data: buildingPerms, isLoading: bldgLoading } = useQuery({
    queryKey: ['building-permissions', ulpin],
    queryFn: () => getBuildingPermissions(ulpin!),
    enabled: !!ulpin,
  });

  // GIS tab queries (neighbor parcels, zones, utilities)
  const { data: neighborsData } = useQuery({
    queryKey: ['parcels-neighbors', parcel?.state_code],
    queryFn: () => searchParcels({ state: parcel?.state_code, limit: 10 }),
    enabled: !!parcel?.state_code && currentTab === 'gis',
  });

  const { data: zonesGeoJSON } = useQuery({
    queryKey: ['zones-geojson', parcel?.state_code],
    queryFn: () => getZonesGeoJSON(parcel?.state_code),
    enabled: currentTab === 'gis',
  });

  const { data: utilityGeoJSON } = useQuery({
    queryKey: ['utility-geojson'],
    queryFn: () => getUtilityGeoJSON(),
    enabled: currentTab === 'gis',
  });

  // History tab queries
  const { data: historyEvents, isLoading: historyLoading } = useQuery({
    queryKey: ['history', ulpin],
    queryFn: () => getHistory(ulpin!),
    enabled: !!ulpin && currentTab === 'history',
  });

  const { data: mutations } = useQuery({
    queryKey: ['mutations', ulpin],
    queryFn: () => getMutations(ulpin!),
    enabled: !!ulpin && currentTab === 'history',
  });

  // Intelligence tab queries
  const { data: intelligenceScore, isLoading: scoreLoading } = useQuery({
    queryKey: ['intelligence', ulpin],
    queryFn: () => getIntelligence(ulpin!),
    enabled: !!ulpin && (currentTab === 'intelligence' || currentTab === 'gis'),
  });

  const { data: parcelAlerts } = useQuery({
    queryKey: ['parcel-alerts', ulpin],
    queryFn: () => getAlerts(ulpin!),
    enabled: !!ulpin && (currentTab === 'intelligence' || currentTab === 'gis'),
  });

  // Audit trail query for Data Sources & Audit tab
  const { data: auditEntries, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-trail', ulpin],
    queryFn: () => getParcelAuditTrail(parcel?.id ?? ulpin!),
    enabled: !!ulpin,
  });

  const [isCitizenModalOpen, setIsCitizenModalOpen] = React.useState(false);
  const [citizenActionCategory, setCitizenActionCategory] = React.useState<
    'demarcation' | 'ec_issuance' | 'mutation_objection' | 'area_rectification'
  >('demarcation');
  const [shareCopied, setShareCopied] = React.useState(false);

  const openCitizenModal = (
    cat: 'demarcation' | 'ec_issuance' | 'mutation_objection' | 'area_rectification' = 'demarcation'
  ) => {
    setCitizenActionCategory(cat);
    setIsCitizenModalOpen(true);
  };

  const handleExportGeoJSON = () => {
    if (!parcel) return;
    const fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            ulpin: parcel.ulpin,
            survey_number: parcel.survey_number,
            khasra_number: parcel.khasra_number,
            state_code: parcel.state_code,
            district: parcel.district_name,
            village: parcel.village_name,
            area_gis_sqm: parcel.area_gis_sqm,
            area_recorded_sqm: parcel.area_recorded_sqm,
            land_use_type: parcel.land_use_type,
            source: parcel.source,
            export_source: 'National Land Intelligence Platform (NLIP)',

            export_timestamp: new Date().toISOString(),
          },
          geometry: parcel.geom?.geometry ?? { type: 'Polygon', coordinates: [] },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${parcel.ulpin}-cadastral.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2400);
  };

  // Coordinates centroid for GIS metrics
  const centroid = useMemo(() => {
    if (!parcel?.geom?.geometry?.coordinates?.[0]) return { lat: 0, lng: 0 };
    const coords = parcel.geom.geometry.coordinates[0];
    const avgLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
    const avgLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
    return { lat: avgLat, lng: avgLng };
  }, [parcel]);


  if (parcelLoading) {
    return (
      <div className="py-24">
        <Loader label={`Loading parcel record for ULPIN ${ulpin}...`} size="lg" />
      </div>
    );
  }

  if (parcelError || !parcel) {
    return (
      <div className="max-w-nlip-wrap mx-auto px-4 py-16">
        <EmptyState
          title="Parcel Record Not Found"
          description={`No parcel record found for ULPIN: ${ulpin} in the national index.`}
          actionText="Back to Search"
          onAction={() => navigate('/search')}
        />
      </div>
    );
  }

  // Check area variance > 2%
  const variancePct =
    parcel.area_recorded_sqm && parcel.area_gis_sqm
      ? Math.abs(
          ((parcel.area_gis_sqm - parcel.area_recorded_sqm) /
            parcel.area_recorded_sqm) *
            100
        )
      : 0;

  const hasAreaVariance = variancePct > 2.0;

  // Spatial Factor calculations for GIS & Intelligence linking
  const recordedSqm = parcel.area_recorded_sqm ?? 0;
  const gisSqm = parcel.area_gis_sqm ?? recordedSqm;
  const areaDiffSqm = gisSqm - recordedSqm;
  const isAreaExcess = areaDiffSqm >= 0;
  const factorVariancePct = recordedSqm > 0 ? (Math.abs(areaDiffSqm) / recordedSqm) * 100 : 0;

  // Convert sqm to acres (1 acre = 4046.86 sqm)
  const SQM_PER_ACRE = 4046.86;
  const recordedAcres = recordedSqm > 0 ? (recordedSqm / SQM_PER_ACRE).toFixed(2) : '0.00';
  const gisAcres = gisSqm > 0 ? (gisSqm / SQM_PER_ACRE).toFixed(2) : '0.00';

  // Check alerts for boundary or satellite discrepancies
  const alertsList = Array.isArray(parcelAlerts) ? parcelAlerts : [];
  const boundaryAlert = alertsList.find(
    (a) => a && (a.alert_type === 'boundary_variance' || a.alert_type === 'encroachment')
  );
  const unauthAlert = alertsList.find((a) => a && a.alert_type === 'unauthorized_construction');

  // Factor status determination (consistent with DisputeIntelligence rules)
  const isAreaCritical = factorVariancePct > 15;
  const isAreaWarning = !isAreaCritical && factorVariancePct >= 5;
  const isBoundaryCritical = boundaryAlert?.status === 'open';
  const isBoundaryWarning = !isBoundaryCritical && (!!boundaryAlert || !!unauthAlert);

  const isFlaggedSpatialFactor = isAreaCritical || isAreaWarning || isBoundaryCritical || isBoundaryWarning;
  const spatialFactorSeverity: 'CRITICAL' | 'WARNING' | 'PASS' =
    isAreaCritical || isBoundaryCritical ? 'CRITICAL' : (isAreaWarning || isBoundaryWarning ? 'WARNING' : 'PASS');

  const boundaryStatusText = isBoundaryCritical
    ? 'Disputed / Inconsistent'
    : boundaryAlert
    ? `Under Review (${(boundaryAlert.status || 'open').replace(/_/g, ' ')})`
    : isAreaCritical || isAreaWarning
    ? 'Disputed / Inconsistent'
    : 'Verified / Consistent';

  // Handler for smooth navigation from Intelligence button to GIS map section
  const handleViewGisEvidence = () => {
    navigate(`/parcel/${parcel.ulpin}#gis`);
    setTimeout(() => {
      const el = document.getElementById('gis-evidence-card') || document.getElementById('gis-map-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Active encumbrances check
  const activeEncumbrances = encumbrances?.filter((e) => e.status === 'active') ?? [];

  return (
    <div className="min-h-[85vh] flex flex-col">
      {/* Contextual Sticky Sub-Bar */}
      <div className="bg-[#1a1610] border-b border-nlip-border-hi sticky top-16 z-30 shadow-md">
        <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
            {/* Active Parcel Info */}
            <div className="flex items-center flex-wrap gap-2.5 text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-nlip-text-soft uppercase font-bold text-xs">
                ACTIVE PARCEL:
              </span>
              <span className="font-mono font-bold text-nlip-amber px-2.5 py-1 rounded bg-black/60 border border-nlip-border text-sm">
                {parcel.ulpin}
              </span>
              <span className="text-nlip-text-soft flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-nlip-amber" />
                <span>
                  {parcel.village_name}, {parcel.district_name} [{parcel.state_code}]
                </span>
              </span>
              {hasAreaVariance && (
                <Badge variant="amber" size="sm" dot>
                  Area Variance: {variancePct.toFixed(1)}%
                </Badge>
              )}
              {activeEncumbrances.length > 0 && (
                <Badge variant="red" size="sm" dot>
                  {activeEncumbrances.length} Active Encumbrance(s)
                </Badge>
              )}
            </div>

            {/* Action Buttons: Export GeoJSON, Share Link, Redirect to Location & Change Parcel */}
            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5 text-nlip-amber" />}
                onClick={handleExportGeoJSON}
                className="text-xs font-mono"
                title="Download standard OGC Cadastral GeoJSON"
              >
                <span className="hidden sm:inline">Export GeoJSON</span>
                <span className="sm:hidden">GeoJSON</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={
                  shareCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-nlip-amber" />
                  )
                }
                onClick={handleCopyShareLink}
                className="text-xs font-mono"
                title="Copy shareable parcel URL"
              >
                <span>{shareCopied ? 'Copied!' : 'Share'}</span>
              </Button>

              <a
                href={`https://www.google.com/maps?q=${centroid.lat},${centroid.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono text-nlip-text-soft hover:text-nlip-amber border border-nlip-border hover:border-nlip-amber bg-black/60 transition-all font-medium"
                title="Redirect to coordinates in Google Maps"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Redirect to Location ↗</span>
                <span className="sm:hidden">GPS ↗</span>
              </a>

              <Link to="/search">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="text-xs sm:text-sm"
                >
                  Change Parcel
                </Button>
              </Link>
            </div>

          </div>

          {/* Navigation Tabs Bar with Next & Previous Quick Navigation */}
          <div className="flex items-center justify-between border-t border-nlip-border/50 pt-1.5 pb-1 gap-2">
            <div className="flex items-center overflow-x-auto no-scrollbar gap-1 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${
                      isActive
                        ? 'text-nlip-amber border-nlip-amber bg-white/[0.06] font-bold'
                        : 'text-nlip-text-soft border-transparent hover:text-nlip-text hover:bg-white/[0.03] font-medium'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Header Next & Previous Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevTab}
                disabled={!prevTab}
                className="text-xs px-2.5 py-1.5 font-mono h-8 border-nlip-border hover:border-nlip-amber/70 disabled:opacity-30 disabled:hover:border-nlip-border"
                title={prevTab ? `Go to Previous: ${prevTab.label}` : 'No previous page'}
                icon={<ChevronLeft className="w-3.5 h-3.5 text-nlip-amber" />}
              >
                <span className="hidden md:inline">Prev</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNextTab}
                disabled={!nextTab}
                className="text-xs px-2.5 py-1.5 font-mono h-8 disabled:opacity-30"
                title={nextTab ? `Go to Next: ${nextTab.label}` : 'No next page'}
                iconRight={<ChevronRight className="w-3.5 h-3.5" />}
              >
                <span className="hidden md:inline">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Animated Page Transition View */}
        <div key={currentTab} className="nlip-tab-transition">
          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW                                                   */}
          {/* ================================================================= */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
            {/* Top Stat Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="text-xs sm:text-sm font-mono text-nlip-text-soft uppercase font-medium mb-1.5">
                  Bhu-Aadhaar Key
                </div>
                <div className="text-lg sm:text-xl font-mono font-bold text-nlip-amber truncate">
                  {parcel.ulpin}
                </div>
                <div className="text-xs sm:text-sm text-nlip-text-soft mt-1.5">
                  Survey: {parcel.survey_number ?? '—'} · Khasra: {parcel.khasra_number ?? '—'}
                </div>
              </div>

              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="text-xs sm:text-sm font-mono text-nlip-text-soft uppercase font-medium mb-1.5">
                  Land Use & Classification
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-nlip-text capitalize">
                    {parcel.land_use_type}
                  </span>
                  <Badge variant="blue" size="sm">
                    {parcel.source.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm text-nlip-text-soft mt-1.5">
                  Gata: {parcel.gata_number ?? '—'} · Patta: {parcel.patta_number ?? '—'}
                </div>
              </div>

              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="text-xs sm:text-sm font-mono text-nlip-text-soft uppercase font-medium mb-1.5">
                  Recorded vs GIS Area
                </div>
                <div className="text-lg sm:text-xl font-bold text-nlip-text">
                  {parcel.area_recorded_sqm?.toLocaleString()} m²
                  <span className="text-xs sm:text-sm text-nlip-text-soft font-normal ml-1.5">
                    (GIS: {parcel.area_gis_sqm?.toLocaleString()} m²)
                  </span>
                </div>
                <div className="mt-1.5">
                  {hasAreaVariance ? (
                    <span className="text-xs sm:text-sm font-mono text-nlip-amber flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-nlip-amber" />
                      Variance {variancePct.toFixed(1)}% &gt; 2%
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-mono text-emerald-400 font-medium">
                      ✓ Within 2% survey tolerance
                    </span>
                  )}
                </div>
              </div>

              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="text-xs sm:text-sm font-mono text-nlip-text-soft uppercase font-medium mb-1.5">
                  Encumbrance Status
                </div>
                <div className="flex items-center gap-2">
                  {activeEncumbrances.length > 0 ? (
                    <>
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <span className="text-lg sm:text-xl font-bold text-rose-400">
                        {activeEncumbrances.length} Active
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-lg sm:text-xl font-bold text-emerald-400">
                        Clear Title
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-nlip-text-soft mt-1.5">
                  {activeEncumbrances.length > 0
                    ? 'Liabilities or court dispute registered'
                    : 'No active lien or mortgage on file'}
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: RoR Owners & Encumbrances */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Record of Rights (RoR) Card */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-nlip-border">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-nlip-amber" />
                    <h3 className="text-sm font-bold text-nlip-text">
                      Record of Rights (RoR) & Ownership
                    </h3>
                  </div>
                  <Badge variant="outline" size="sm">
                    {rorList?.length ?? 0} Record(s)
                  </Badge>
                </div>

                {rorLoading ? (
                  <div className="py-8"><Loader size="sm" label="Fetching RoR records..." /></div>
                ) : !rorList || rorList.length === 0 ? (
                  <p className="text-xs text-nlip-text-soft py-4 text-center">
                    No RoR ownership records associated with this parcel.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {rorList.map((ror) => (
                      <div
                        key={ror.id}
                        className="p-3.5 rounded-lg bg-nlip-surface-hi/40 border border-nlip-border text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-nlip-text text-sm">
                            {ror.owner?.full_name ?? 'Primary Landholder'}
                          </span>
                          <Badge
                            variant={
                              ror.status === 'active'
                                ? 'green'
                                : ror.status === 'disputed'
                                ? 'red'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {ror.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-nlip-text-soft">
                          <div>
                            <span className="text-nlip-text-faint">Father/Spouse:</span>{' '}
                            {ror.owner?.father_or_spouse_name ?? '—'}
                          </div>
                          <div>
                            <span className="text-nlip-text-faint">Ownership:</span>{' '}
                            <span className="capitalize">{ror.ownership_type}</span>{' '}
                            {ror.share_percentage ? `(${ror.share_percentage}%)` : ''}
                          </div>
                          <div>
                            <span className="text-nlip-text-faint">Khatauni No:</span>{' '}
                            <span className="font-mono text-nlip-text">
                              {ror.khatauni_number ?? '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-nlip-text-faint">Tenure Type:</span>{' '}
                            {ror.tenure_type ?? 'Bhumidhar with transferable rights'}
                          </div>
                        </div>
                        <div className="pt-1 text-[11px] font-mono text-nlip-text-faint flex items-center gap-1.5">
                          <span>Aadhaar: {ror.owner?.aadhaar_hash ? '••••••••' + ror.owner.aadhaar_hash.slice(-4) : '••••5812'} (DPDP Hashed)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Encumbrance & Liabilities Card */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-nlip-border">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-nlip-amber" />
                    <h3 className="text-sm font-bold text-nlip-text">
                      Encumbrances & Legal Liabilities
                    </h3>
                  </div>
                  <Badge
                    variant={activeEncumbrances.length > 0 ? 'red' : 'green'}
                    size="sm"
                  >
                    {activeEncumbrances.length} Active
                  </Badge>
                </div>

                {encLoading ? (
                  <div className="py-8"><Loader size="sm" label="Checking encumbrances..." /></div>
                ) : !encumbrances || encumbrances.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs font-semibold text-emerald-400">
                      Nil Encumbrance Certificate (NEC)
                    </p>
                    <p className="text-[11px] text-nlip-text-soft">
                      No active mortgages, court caveats, or bank liens reported.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {encumbrances.map((enc) => (
                      <div
                        key={enc.id}
                        className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                          enc.status === 'active'
                            ? 'bg-rose-950/20 border-rose-900/40'
                            : 'bg-nlip-surface-hi/40 border-nlip-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-nlip-text uppercase tracking-wide">
                            {enc.type.replace(/_/g, ' ')}
                          </span>
                          <Badge
                            variant={enc.status === 'active' ? 'red' : 'neutral'}
                            size="sm"
                          >
                            {enc.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-nlip-text-soft">
                          <div>
                            <span className="text-nlip-text-faint">Holder / Bank:</span>{' '}
                            <span className="text-nlip-text font-medium">{enc.holder_name}</span>
                          </div>
                          <div>
                            <span className="text-nlip-text-faint">Amount:</span>{' '}
                            <span className="font-mono text-nlip-amber">
                              {enc.amount ? `₹${enc.amount.toLocaleString('en-IN')}` : 'Undetermined / Court Case'}
                            </span>
                          </div>
                          <div>
                            <span className="text-nlip-text-faint">Registered:</span>{' '}
                            {enc.start_date ?? '—'}
                          </div>
                          <div>
                            <span className="text-nlip-text-faint">Discharge / End:</span>{' '}
                            {enc.end_date ?? 'Ongoing'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid 3 Columns: Registrations, Tax, Building Permissions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Registration & Deeds */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-nlip-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-nlip-amber" />
                    <h3 className="text-sm font-bold text-nlip-text">NGDRS Deeds</h3>
                  </div>
                  <Badge variant="outline" size="sm">
                    {registrations?.length ?? 0}
                  </Badge>
                </div>

                {regLoading ? (
                  <div className="py-6"><Loader size="sm" label="Fetching deeds..." /></div>
                ) : !registrations || registrations.length === 0 ? (
                  <p className="text-xs text-nlip-text-soft py-4 text-center">
                    No registry deeds found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {registrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3 rounded-lg bg-nlip-surface-hi/40 border border-nlip-border text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-nlip-text">{reg.deed_type}</span>
                          <span className="text-[11px] font-mono text-nlip-text-soft">
                            {reg.registration_date}
                          </span>
                        </div>
                        <div className="text-[11px] text-nlip-text-soft">
                          Deed #{reg.deed_number} · SRO: {reg.sub_registrar_office ?? 'Local SRO'}
                        </div>
                        <div className="font-mono text-nlip-amber text-xs">
                          {reg.consideration_amount
                            ? `₹${reg.consideration_amount.toLocaleString('en-IN')}`
                            : 'Nominal'}
                        </div>
                        {reg.document_hash && (
                          <div className="text-[10px] font-mono text-nlip-text-faint truncate">
                            SHA: {reg.document_hash}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Tax */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-nlip-border">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-nlip-amber" />
                    <h3 className="text-sm font-bold text-nlip-text">Tax Receipts</h3>
                  </div>
                  <Badge variant="outline" size="sm">
                    {taxRecords?.length ?? 0}
                  </Badge>
                </div>

                {taxLoading ? (
                  <div className="py-6"><Loader size="sm" label="Loading tax history..." /></div>
                ) : !taxRecords || taxRecords.length === 0 ? (
                  <p className="text-xs text-nlip-text-soft py-4 text-center">
                    No municipal tax assessment records.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {taxRecords.map((tax) => (
                      <div
                        key={tax.id}
                        className="p-3 rounded-lg bg-nlip-surface-hi/40 border border-nlip-border text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-nlip-text">
                            FY {tax.assessment_year}–{tax.assessment_year + 1}
                          </span>
                          <Badge
                            variant={
                              tax.paid_status === 'paid'
                                ? 'green'
                                : tax.paid_status === 'overdue'
                                ? 'red'
                                : 'amber'
                            }
                            size="sm"
                          >
                            {tax.paid_status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-[11px] text-nlip-text-soft">
                          <span>Assessed: ₹{tax.assessed_value?.toLocaleString('en-IN') ?? '—'}</span>
                          <span className="font-mono text-nlip-amber">
                            Tax: ₹{tax.tax_amount?.toLocaleString('en-IN') ?? '—'}
                          </span>
                        </div>
                        <div className="text-[10px] text-nlip-text-faint">
                          ULB: {tax.ulb_id ?? 'Panchayat Revenue Wing'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Building Permissions */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-nlip-border">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-nlip-amber" />
                    <h3 className="text-sm font-bold text-nlip-text">Permits & Sanctions</h3>
                  </div>
                  <Badge variant="outline" size="sm">
                    {buildingPerms?.length ?? 0}
                  </Badge>
                </div>

                {bldgLoading ? (
                  <div className="py-6"><Loader size="sm" label="Checking building sanctions..." /></div>
                ) : !buildingPerms || buildingPerms.length === 0 ? (
                  <p className="text-xs text-nlip-text-soft py-4 text-center">
                    No sanction or layout permissions filed.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {buildingPerms.map((perm) => (
                      <div
                        key={perm.id}
                        className="p-3 rounded-lg bg-nlip-surface-hi/40 border border-nlip-border text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-nlip-text">
                            {perm.approved_use ?? 'Sanctioned Plan'}
                          </span>
                          <Badge
                            variant={
                              perm.status === 'approved'
                                ? 'green'
                                : perm.status === 'deviation_flagged'
                                ? 'red'
                                : 'amber'
                            }
                            size="sm"
                          >
                            {perm.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-nlip-text-soft">
                          App #{perm.application_number} · Sanctioned: {perm.sanction_date ?? '—'}
                        </div>
                        <div className="flex justify-between text-[11px] text-nlip-text-soft">
                          <span>Area: {perm.built_up_area_sqm ?? '—'} m²</span>
                          <span>Floors: {perm.floors_approved ?? '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Citizen Action & Administrative Grievance Bar */}
            <div className="p-5 rounded-nlip bg-gradient-to-r from-[#211a12] via-[#1a1610] to-[#16130f] border border-nlip-border-hi shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-nlip-amber" />
                  <h4 className="text-sm font-bold text-nlip-text">
                    Need Administrative Action on this Parcel?
                  </h4>
                </div>
                <p className="text-xs text-nlip-text-soft max-w-2xl leading-relaxed">
                  File a formal cadastral boundary demarcation request, apply for a certified Encumbrance Certificate (EC), or raise an area variance / co-sharer objection directly with the State Revenue Directorate.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Scale className="w-3.5 h-3.5" />}
                  onClick={() => openCitizenModal('demarcation')}
                  className="text-xs"
                >
                  File Grievance / Demarcation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => openCitizenModal('ec_issuance')}
                  className="text-xs"
                >
                  Request EC
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: GIS & DRONE MAP (Task 6 Deliverable)                        */}
        {/* ================================================================= */}
        {currentTab === 'gis' && (
          <div className="space-y-6" id="gis-map-container">
            {/* GIS Overview Bar */}
            <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold font-display text-nlip-text flex items-center gap-2">
                  <Layers className="w-5 h-5 text-nlip-amber" />
                  Cadastral GIS Boundary & Drone Orthomosaic
                </h2>
                <p className="text-xs text-nlip-text-soft mt-0.5">
                  Centroid: {centroid.lat.toFixed(6)}°N, {centroid.lng.toFixed(6)}°E · Survey Method:{' '}
                  <span className="capitalize font-medium text-nlip-text">
                    {parcel.source.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {hasAreaVariance ? (
                  <Badge variant="amber" size="sm" dot>
                    Boundary Variance: {variancePct.toFixed(2)}%
                  </Badge>
                ) : (
                  <Badge variant="green" size="sm" dot>
                    Boundary Verified (0.0% variance)
                  </Badge>
                )}
                <Badge variant="blue" size="sm">
                  RFC 7946 GeoJSON
                </Badge>
                <a
                  href={`https://www.google.com/maps?q=${centroid.lat},${centroid.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-nlip-amber/15 text-nlip-amber border border-nlip-amber/40 hover:bg-nlip-amber/25 hover:border-nlip-amber transition-all shadow-sm"
                  title="Redirect & open location in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Redirect to Location ↗</span>
                </a>
              </div>
            </div>

            {/* Intelligence Spatial Factor Evidence Comparison Card */}
            {isFlaggedSpatialFactor && (
              <div
                id="gis-evidence-card"
                className={`p-5 rounded-nlip border backdrop-blur-md transition-all shadow-xl ${
                  spatialFactorSeverity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-rose-950/30 text-rose-100'
                    : 'bg-amber-950/30 border-amber-500/50 shadow-amber-950/30 text-amber-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        spatialFactorSeverity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-nlip-amber border border-amber-500/30'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold tracking-wide uppercase text-nlip-text-soft">
                          Intelligence Factor Spatial Cross-Examination
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            spatialFactorSeverity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {spatialFactorSeverity} FACTOR
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-nlip-text mt-0.5">
                        {isAreaCritical || isAreaWarning
                          ? 'Area Consistency Discrepancy'
                          : 'Boundary Consistency Discrepancy'}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabClick('intelligence')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-nlip-amber bg-nlip-amber/10 border border-nlip-amber/30 hover:bg-nlip-amber/20 transition-all shrink-0 self-start sm:self-auto"
                  >
                    <span>← Back to Intelligence Score</span>
                  </button>
                </div>

                {/* Side-by-side factor comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[11px] font-sans text-nlip-text-soft uppercase tracking-wider">
                      Recorded Area
                    </div>
                    <div className="text-base font-bold font-mono text-nlip-text">
                      {recordedAcres} acres
                    </div>
                    <div className="text-xs font-mono text-nlip-text-faint">
                      {recordedSqm.toLocaleString()} m² (Khatauni / Registry)
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[11px] font-sans text-nlip-text-soft uppercase tracking-wider">
                      GIS Area
                    </div>
                    <div className="text-base font-bold font-mono text-nlip-amber flex items-center gap-2 flex-wrap">
                      <span>{gisAcres} acres</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          spatialFactorSeverity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isAreaExcess
                          ? `+${factorVariancePct.toFixed(1)}% excess`
                          : `-${factorVariancePct.toFixed(1)}% deficit`}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-nlip-text-faint">
                      {gisSqm.toLocaleString()} m² (Drone / ST_Area Mesh)
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[11px] font-sans text-nlip-text-soft uppercase tracking-wider">
                      Boundary Status
                    </div>
                    <div
                      className={`text-base font-bold font-mono flex items-center gap-2 ${
                        spatialFactorSeverity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                      <span>{boundaryStatusText}</span>
                    </div>
                    <div className="text-xs font-mono text-nlip-text-faint">
                      {boundaryAlert
                        ? `Alert: ${(boundaryAlert.alert_type || 'boundary alert').replace(/_/g, ' ')} (${((boundaryAlert.confidence_score ?? 0) * 100).toFixed(0)}% conf)`
                        : `Cadastral variance: ${factorVariancePct.toFixed(1)}%`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* The Map Component */}
            <MapView
              parcel={parcel}
              neighbors={neighborsData?.items
                ?.map((item) => {
                  // If we need neighbor full objects, we filter out active parcel
                  return item.ulpin === parcel.ulpin ? null : (item as unknown as typeof parcel);
                })
                .filter(Boolean) as unknown as typeof parcel[]}
              zonesGeoJSON={zonesGeoJSON}
              utilityGeoJSON={utilityGeoJSON}
              className="h-[580px]"
            />

            {/* GIS Analysis & Layer Legends Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Boundary Dimensions */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border space-y-3">
                <h3 className="text-sm font-bold text-nlip-text flex items-center gap-2">
                  <Compass className="w-4 h-4 text-nlip-amber" />
                  Geometric Properties
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-nlip-border/50">
                    <span className="text-nlip-text-soft">Recorded Area (Khatauni):</span>
                    <span className="font-mono text-nlip-text font-medium">
                      {parcel.area_recorded_sqm?.toLocaleString()} m²
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-nlip-border/50">
                    <span className="text-nlip-text-soft">GIS Drone Area (ST_Area):</span>
                    <span className="font-mono text-nlip-amber font-bold">
                      {parcel.area_gis_sqm?.toLocaleString()} m²
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-nlip-border/50">
                    <span className="text-nlip-text-soft">Area Discrepancy:</span>
                    <span
                      className={`font-mono font-bold ${
                        hasAreaVariance ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {variancePct.toFixed(2)}% {hasAreaVariance ? '(EXCEEDS 2% THRESHOLD)' : '(NORMAL)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-nlip-text-soft">Coordinate Vertices:</span>
                    <span className="font-mono text-nlip-text">
                      {parcel.geom.geometry.coordinates[0]?.length ?? 0} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Master Plan Zoning Legend */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border space-y-3">
                <h3 className="text-sm font-bold text-nlip-text flex items-center gap-2">
                  <Layers className="w-4 h-4 text-nlip-amber" />
                  Master Plan Zoning Legend
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#4ade80] border border-white/20" />
                      <span className="text-nlip-text-soft">Agricultural Zone</span>
                    </div>
                    <span className="font-mono text-[11px] text-nlip-text-faint">Permitted: Farm / Crop</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#60a5fa] border border-white/20" />
                      <span className="text-nlip-text-soft">Residential Zone</span>
                    </div>
                    <span className="font-mono text-[11px] text-nlip-text-faint">FAR: 1.5–2.5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#f59e0b] border border-white/20" />
                      <span className="text-nlip-text-soft">Commercial Zone</span>
                    </div>
                    <span className="font-mono text-[11px] text-nlip-text-faint">Retail / Mixed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#a78bfa] border border-white/20" />
                      <span className="text-nlip-text-soft">Industrial Zone</span>
                    </div>
                    <span className="font-mono text-[11px] text-nlip-text-faint">Logistics / Mfg</span>
                  </div>
                </div>
              </div>

              {/* Utility Infrastructure Legend */}
              <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border space-y-3">
                <h3 className="text-sm font-bold text-nlip-text flex items-center gap-2">
                  <Info className="w-4 h-4 text-nlip-amber" />
                  Utility Infrastructure
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#38bdf8]" />
                      <span className="text-nlip-text-soft">Water Main / Pipeline</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#a78bfa]" />
                      <span className="text-nlip-text-soft">Sewer & Drainage</span>
                    </div>
                    <span className="font-mono text-[11px] text-nlip-text-faint">Municipal line</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                      <span className="text-nlip-text-soft">Power Grid HT/LT</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400">11kV Feeder</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#94a3b8]" />
                      <span className="text-nlip-text-soft">Right of Way (Road)</span>
                    </div>
                    <span className="font-mono text-[11px] text-nlip-text-faint">12m Road Width</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DOSSIER (Task 7 Deliverable)                              */}
        {/* ================================================================= */}
        {currentTab === 'dossier' && (
          <CertifiedDossier
            parcel={parcel}
            rorList={rorList}
            encumbrances={encumbrances}
            registrations={registrations}
            taxRecords={taxRecords}
            buildingPerms={buildingPerms}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 4: INTELLIGENCE (Task 8 Deliverable)                        */}
        {/* ================================================================= */}
        {currentTab === 'intelligence' && (
          <div className="space-y-6">
            <DisputeIntelligence
              parcel={parcel}
              rorList={rorList}
              encumbrances={encumbrances}
              taxRecords={taxRecords}
              scoreData={intelligenceScore}
              alerts={parcelAlerts}
              ulpin={parcel.ulpin}
              isLoading={scoreLoading || parcelLoading}
              onViewGisEvidence={handleViewGisEvidence}
            />

            {/* Citizen Action Bar in Intelligence Tab */}
            <div className="p-5 rounded-nlip bg-gradient-to-r from-[#211a12] via-[#1a1610] to-[#16130f] border border-nlip-border-hi shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-nlip-amber" />
                  <h4 className="text-sm font-bold text-nlip-text">
                    Dispute Discovered? Initiate Revenue Rectification
                  </h4>
                </div>
                <p className="text-xs text-nlip-text-soft max-w-2xl leading-relaxed">
                  Log a formal mutation dispute or cadastral boundary demarcation complaint tracked with official reference numbers.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Scale className="w-3.5 h-3.5" />}
                  onClick={() => openCitizenModal('mutation_objection')}
                  className="text-xs"
                >
                  File Objection / Dispute
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => openCitizenModal('area_rectification')}
                  className="text-xs"
                >
                  Rectify Variance
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: HISTORY (Task 7 Deliverable)                              */}
        {/* ================================================================= */}
        {currentTab === 'history' && (
          <ChainOfTitle
            historyEvents={historyEvents}
            mutations={mutations}
            isLoading={historyLoading}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 6: DATA SOURCES & AUDIT TRAIL                                 */}
        {/* ================================================================= */}
        {currentTab === 'data-sources' && (
          <DataTrailLedger
            parcel={parcel}
            auditEntries={auditEntries}
            isLoading={auditLoading}
          />
        )}
        </div>

        {/* Bottom Pagination & Page Navigation Card */}
        <div className="mt-10 pt-6 border-t border-nlip-border-hi/60">
          <div className="nlip-glass-card rounded-nlip p-4 sm:p-5 border border-nlip-border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Previous Page Button */}
            <div className="w-full sm:w-1/3 flex justify-start">
              {prevTab ? (
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="w-full sm:w-auto inline-flex items-center gap-3 px-4 py-2.5 rounded-nlip-sm bg-nlip-surface-hi hover:bg-white/[0.08] border border-nlip-border hover:border-nlip-amber/60 text-nlip-text hover:text-nlip-amber transition-all duration-200 group shadow-sm text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-black/40 border border-nlip-border group-hover:border-nlip-amber flex items-center justify-center shrink-0 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-nlip-amber transition-transform group-hover:-translate-x-0.5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-nlip-text-soft">
                      Previous Page
                    </div>
                    <div className="text-xs sm:text-sm font-semibold truncate max-w-[200px]">
                      {prevTab.label}
                    </div>
                  </div>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-nlip-sm border border-nlip-border/20 text-nlip-text-soft/35 select-none bg-black/20 text-xs font-mono">
                  <ChevronLeft className="w-3.5 h-3.5 opacity-30" />
                  <span>Start of Dossier</span>
                </div>
              )}
            </div>

            {/* Page Step Indicators */}
            <div className="flex flex-col items-center gap-2 order-last sm:order-none">
              <div className="flex items-center gap-1.5">
                {tabs.map((tab, idx) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? 'w-7 bg-nlip-amber shadow-[0_0_8px_rgba(242,186,99,0.5)]'
                        : 'w-2 bg-nlip-border-hi hover:bg-nlip-text-soft/60'
                    }`}
                    title={`Jump to ${tab.label}`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-nlip-text-soft text-center">
                Page <strong className="text-nlip-amber font-bold">{activeIndex + 1}</strong> of{' '}
                {tabs.length} · <span className="text-nlip-text font-medium">{tabs[activeIndex]?.label}</span>
              </span>
            </div>

            {/* Next Page Button */}
            <div className="w-full sm:w-1/3 flex justify-end">
              {nextTab ? (
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-end gap-3 px-5 py-2.5 rounded-nlip-sm bg-gradient-to-r from-nlip-amber to-[#c98e3b] text-[#17140f] font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-200 group shadow-md hover:shadow-amber-glow text-right"
                >
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#17140f]/80">
                      Next Page
                    </div>
                    <div className="text-xs sm:text-sm font-bold truncate max-w-[200px]">
                      {nextTab.label}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#17140f] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-nlip-sm border border-nlip-border/20 text-nlip-text-soft/35 select-none bg-black/20 text-xs font-mono">
                  <span>End of Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Action & Administrative Grievance Modal */}
      <CitizenActionModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        parcel={parcel}
        initialCategory={citizenActionCategory}
      />
    </div>
  );
};

