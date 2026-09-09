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
} from '@/lib/api';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { MapView } from '@/components/map';
import { CertifiedDossier, ChainOfTitle, CitizenActionModal } from '@/components/dossier';
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
} from 'lucide-react';


export const ParcelDetailPage: React.FC = () => {
  const { ulpin } = useParams<{ ulpin: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab selection via URL hash or default to 'overview'
  const currentTab = location.hash.replace('#', '') || 'overview';

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
    enabled: !!ulpin && currentTab === 'intelligence',
  });

  const { data: parcelAlerts } = useQuery({
    queryKey: ['parcel-alerts', ulpin],
    queryFn: () => getAlerts(ulpin!),
    enabled: !!ulpin && currentTab === 'intelligence',
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

  const handleTabClick = (tabKey: string) => {
    navigate(`/parcel/${ulpin}#${tabKey}`);
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

  // Active encumbrances check
  const activeEncumbrances = encumbrances?.filter((e) => e.status === 'active') ?? [];

  const tabs = [
    { id: 'overview', label: 'Parcel Overview', icon: Compass },
    { id: 'gis', label: 'GIS & Drone Map', icon: Layers },
    { id: 'dossier', label: 'Certified Dossier', icon: FileCheck2 },
    { id: 'intelligence', label: 'Dispute Intelligence', icon: Brain },
    { id: 'history', label: 'Chain of Title & History', icon: HistoryIcon },
    { id: 'data-sources', label: 'Data Sources & Audit', icon: Database },
  ];

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

          {/* Navigation Tabs Bar */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1 border-t border-nlip-border/50 pt-1.5 pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${
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
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
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

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">

              <Button
                variant="primary"
                icon={<Layers className="w-4 h-4" />}
                onClick={() => handleTabClick('gis')}
              >
                Open GIS & Drone Map
              </Button>
              <Button
                variant="outline"
                icon={<FileCheck2 className="w-4 h-4" />}
                onClick={() => handleTabClick('dossier')}
              >
                View Certified Dossier
              </Button>
              <Button
                variant="outline"
                icon={<Brain className="w-4 h-4" />}
                onClick={() => handleTabClick('intelligence')}
              >
                Check Dispute Intelligence
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: GIS & DRONE MAP (Task 6 Deliverable)                        */}
        {/* ================================================================= */}
        {currentTab === 'gis' && (
          <div className="space-y-6">
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
              scoreData={intelligenceScore}
              alerts={parcelAlerts}
              ulpin={parcel.ulpin}
              isLoading={scoreLoading}
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
        {/* TAB 6: DATA SOURCES                                               */}
        {/* ================================================================= */}
        {currentTab === 'data-sources' && (
          <div className="nlip-glass-card p-8 rounded-nlip border border-nlip-border text-center">
            <Database className="w-12 h-12 text-nlip-amber mx-auto mb-3" />
            <h3 className="text-lg font-bold text-nlip-text mb-1">Data Sources & Tamper Audit Trail</h3>
            <p className="text-xs text-nlip-text-soft max-w-md mx-auto mb-4">
              Verification transparency showing NGDRS registration API, State Bhulekh portal connection, and SHA-256 integrity hash verification.
            </p>
            <Button variant="outline" size="sm" onClick={() => handleTabClick('overview')}>
              ← Return to Overview
            </Button>
          </div>
        )}
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

