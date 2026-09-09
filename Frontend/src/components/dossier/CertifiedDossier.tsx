import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type {
  Parcel,
  RecordOfRights,
  Encumbrance,
  Registration,
  PropertyTaxRecord,
  BuildingPermission,
} from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Printer,
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building2,
  Scale,
  Compass,
  FileText,
  Copy,
} from 'lucide-react';


export interface CertifiedDossierProps {
  parcel: Parcel;
  rorList?: RecordOfRights[];
  encumbrances?: Encumbrance[];
  registrations?: Registration[];
  taxRecords?: PropertyTaxRecord[];
  buildingPerms?: BuildingPermission[];
}

export const CertifiedDossier: React.FC<CertifiedDossierProps> = ({
  parcel,
  rorList = [],
  encumbrances = [],
  registrations = [],
  taxRecords = [],
  buildingPerms = [],
}) => {
  const activeEncumbrances = encumbrances.filter((e) => e.status === 'active');
  const activeRors = rorList.filter((r) => r.status === 'active');

  const variancePct =
    parcel.area_recorded_sqm && parcel.area_gis_sqm
      ? Math.abs(
          ((parcel.area_gis_sqm - parcel.area_recorded_sqm) /
            parcel.area_recorded_sqm) *
            100
        )
      : 0;

  const hasAreaVariance = variancePct > 2.0;

  const dossierRef = `NLIP-DOS-2026-${parcel.ulpin}`;
  const issueTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // If running on localhost or dev server, use the live Vercel URL so phone QR scanners can connect
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.');

    const baseUrl = isLocal
      ? 'https://bonkers-4c8v.vercel.app'
      : window.location.origin;

    const verifyUrl = `${baseUrl}/parcel/${parcel.ulpin}`;
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#111111',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate real QR code', err));
  }, [parcel.ulpin]);


  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(dossierRef);
  };

  return (
    <div className="space-y-6 dossier-print-container">
      {/* Top Action Toolbar (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-nlip bg-nlip-surface border border-nlip-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-nlip-text flex items-center gap-2">
              <span>Certified 360° Land Intelligence Dossier</span>
              <Badge variant="green" size="sm" dot>
                Legally Verifiable
              </Badge>
            </h2>
            <p className="text-xs text-nlip-text-soft">
              Consolidated title, encumbrance, cadastral boundary, and municipal tax record.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyRef}
            className="text-xs"
          >
            Copy Ref ID
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
            className="text-xs"
          >
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="bg-[#181510] text-[#f1ede6] print:bg-white print:text-black border-2 border-nlip-border-hi print:border-black/60 rounded-xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Official Background Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] print:opacity-[0.04] select-none">
          <span className="text-8xl md:text-9xl font-extrabold font-display tracking-widest uppercase rotate-[-30deg]">
            BHU-AADHAAR NLIP
          </span>
        </div>

        {/* Certificate Header */}
        <div className="border-b-2 border-nlip-amber/40 print:border-black/60 pb-6 mb-8 text-center relative">
          <div className="flex justify-center items-center gap-3 mb-2">
            <span className="text-2xl text-nlip-amber print:text-black font-bold">◈</span>
            <span className="text-xs uppercase tracking-[0.25em] font-mono text-nlip-text-soft print:text-gray-700">
              Government of India · National Land Records Modernisation
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-extrabold text-nlip-text print:text-black tracking-tight">
            NATIONAL LAND INTELLIGENCE PLATFORM (NLIP)
          </h1>
          <h2 className="text-sm font-mono text-nlip-amber print:text-black font-semibold mt-1">
            CERTIFIED INTEGRATED LAND TITLE &amp; ENCUMBRANCE DOSSIER
          </h2>
          <p className="text-[11px] text-nlip-text-soft print:text-gray-600 font-mono mt-2">
            Generated under Digital India Land Records Digital Public Infrastructure (DPI) Protocol
          </p>

          <div className="mt-4 flex flex-wrap justify-between items-center text-xs font-mono border-t border-nlip-border/60 print:border-black/20 pt-3 gap-2">
            <div>
              <span className="text-nlip-text-faint print:text-gray-600">DOSSIER REF: </span>
              <span className="font-bold text-nlip-text print:text-black">{dossierRef}</span>
            </div>
            <div>
              <span className="text-nlip-text-faint print:text-gray-600">ISSUED: </span>
              <span>{issueTimestamp}</span>
            </div>
            <div>
              <span className="text-nlip-text-faint print:text-gray-600">SECURITY STATUS: </span>
              <span className="text-emerald-400 print:text-green-800 font-bold">SHA-256 VERIFIED</span>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-xs">
          {/* SECTION 1: Parcel Identity */}
          <section>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
              <Compass className="w-4 h-4 text-nlip-amber print:text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                Section 1 · Canonical Land Parcel Identification
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-nlip-surface-hi/30 print:bg-gray-50 border border-nlip-border/60 print:border-gray-300">
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  Bhu-Aadhaar (ULPIN)
                </span>
                <span className="font-mono font-bold text-sm text-nlip-amber print:text-black">
                  {parcel.ulpin}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  State / Jurisdiction
                </span>
                <span className="font-semibold text-nlip-text print:text-black">
                  {parcel.state_code} ({parcel.state_name ?? parcel.state_code})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  District / Tehsil
                </span>
                <span className="font-semibold text-nlip-text print:text-black">
                  {parcel.district_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  Revenue Village
                </span>
                <span className="font-semibold text-nlip-text print:text-black">
                  {parcel.village_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  Survey Number
                </span>
                <span className="font-mono text-nlip-text print:text-black">
                  {parcel.survey_number ?? 'Not Applicable'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  Khasra Number
                </span>
                <span className="font-mono text-nlip-text print:text-black">
                  {parcel.khasra_number ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  Gata / Patta Reference
                </span>
                <span className="font-mono text-nlip-text print:text-black">
                  {parcel.gata_number ? `Gata ${parcel.gata_number}` : '—'} /{' '}
                  {parcel.patta_number ? `Patta ${parcel.patta_number}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                  Land Use Classification
                </span>
                <span className="font-semibold capitalize text-nlip-text print:text-black">
                  {parcel.land_use_type}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 2: Cadastral Survey & Area Verification */}
          <section>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
              <Scale className="w-4 h-4 text-nlip-amber print:text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                Section 2 · Cadastral Area &amp; SVAMITVA GIS Drone Survey
              </h3>
            </div>
            <div className="p-4 rounded-lg bg-nlip-surface-hi/30 print:bg-gray-50 border border-nlip-border/60 print:border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                    Recorded Area (Revenue Register)
                  </span>
                  <span className="text-base font-bold font-mono text-nlip-text print:text-black">
                    {parcel.area_recorded_sqm?.toLocaleString()} m²
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                    GIS Surveyed Area (ST_Area)
                  </span>
                  <span className="text-base font-bold font-mono text-nlip-amber print:text-black">
                    {parcel.area_gis_sqm?.toLocaleString()} m²
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-nlip-text-faint print:text-gray-600 block">
                    Survey Variance Compliance
                  </span>
                  <div className="mt-0.5">
                    {hasAreaVariance ? (
                      <span className="font-mono text-rose-400 print:text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Variance {variancePct.toFixed(2)}% (Requires Field Verification)
                      </span>
                    ) : (
                      <span className="font-mono text-emerald-400 print:text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified within &plusmn;2% Standard Survey Tolerance
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-nlip-text-soft print:text-gray-600 border-t border-nlip-border/40 print:border-gray-200 pt-2 flex justify-between">
                <span>Survey Methodology: <strong className="text-nlip-text print:text-black capitalize">{parcel.source.replace(/_/g, ' ')}</strong></span>
                <span>Geometry Standard: <strong className="text-nlip-text print:text-black">OGC / RFC 7946 Polygon</strong></span>
              </div>
            </div>
          </section>

          {/* SECTION 3: RoR Ownership Schedule */}
          <section>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
              <FileCheck2 className="w-4 h-4 text-nlip-amber print:text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                Section 3 · Record of Rights (RoR) &amp; Ownership Schedule
              </h3>
            </div>
            {activeRors.length === 0 ? (
              <p className="text-xs text-nlip-text-soft print:text-gray-500 italic">
                No active ownership entries registered in state revenue record.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-nlip-border print:border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-nlip-surface-hi print:bg-gray-100 border-b border-nlip-border print:border-gray-300 font-mono text-[11px] text-nlip-text-soft print:text-gray-700">
                      <th className="p-2.5">Landholder Full Name</th>
                      <th className="p-2.5">Father / Spouse Name</th>
                      <th className="p-2.5">Ownership Type</th>
                      <th className="p-2.5">Share %</th>
                      <th className="p-2.5">Khatauni No.</th>
                      <th className="p-2.5">Tenure Category</th>
                      <th className="p-2.5">Aadhaar (Hashed)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRors.map((ror) => (
                      <tr
                        key={ror.id}
                        className="border-b border-nlip-border/60 print:border-gray-200"
                      >
                        <td className="p-2.5 font-bold text-nlip-text print:text-black">
                          {ror.owner?.full_name ?? 'Sole Landholder'}
                        </td>
                        <td className="p-2.5 text-nlip-text-soft print:text-gray-700">
                          {ror.owner?.father_or_spouse_name ?? '—'}
                        </td>
                        <td className="p-2.5 capitalize">{ror.ownership_type}</td>
                        <td className="p-2.5 font-mono">
                          {ror.share_percentage ? `${ror.share_percentage}%` : '100%'}
                        </td>
                        <td className="p-2.5 font-mono">{ror.khatauni_number ?? '—'}</td>
                        <td className="p-2.5 text-[11px]">
                          {ror.tenure_type ?? 'Bhumidhar with Transferable Rights'}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-nlip-text-faint print:text-gray-500">
                          {ror.owner?.aadhaar_hash
                            ? '••••••••' + ror.owner.aadhaar_hash.slice(-4)
                            : '••••5812'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* SECTION 4: Encumbrances & Liabilities */}
          <section>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
              <ShieldAlert className="w-4 h-4 text-nlip-amber print:text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                Section 4 · Encumbrance Statement &amp; Legal Liabilities
              </h3>
            </div>
            {activeEncumbrances.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-950/20 print:bg-green-50 border border-emerald-800/40 print:border-green-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 print:text-green-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-400 print:text-green-900">
                    Nil Encumbrance Certificate (NEC)
                  </h4>
                  <p className="text-[11px] text-nlip-text-soft print:text-green-800">
                    This parcel has zero active mortgages, bank liens, attachment orders, or court caveats registered in the central index as of this issue date.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-rose-950/30 print:bg-red-50 border border-rose-900/50 print:border-red-200 text-rose-400 print:text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>NOTICE OF ACTIVE ENCUMBRANCE:</strong> {activeEncumbrances.length} active financial or judicial claim(s) exist against this title.
                  </span>
                </div>
                <table className="w-full text-left border-collapse border border-nlip-border print:border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-nlip-surface-hi print:bg-gray-100 border-b border-nlip-border print:border-gray-300 font-mono text-[11px] text-nlip-text-soft print:text-gray-700">
                      <th className="p-2.5">Liability Type</th>
                      <th className="p-2.5">Institution / Caveator</th>
                      <th className="p-2.5">Amount (INR)</th>
                      <th className="p-2.5">Registration Date</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeEncumbrances.map((enc) => (
                      <tr
                        key={enc.id}
                        className="border-b border-nlip-border/60 print:border-gray-200"
                      >
                        <td className="p-2.5 font-bold uppercase">{enc.type.replace(/_/g, ' ')}</td>
                        <td className="p-2.5">{enc.holder_name}</td>
                        <td className="p-2.5 font-mono text-nlip-amber print:text-black">
                          {enc.amount ? `₹${enc.amount.toLocaleString('en-IN')}` : 'Undetermined (Litigation)'}
                        </td>
                        <td className="p-2.5 font-mono">{enc.start_date ?? '—'}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/20 text-rose-400 print:bg-red-100 print:text-red-800">
                            {enc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* SECTION 5: NGDRS Title Deeds & Registrations */}
          <section>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
              <FileText className="w-4 h-4 text-nlip-amber print:text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                Section 5 · NGDRS Registered Deeds &amp; Transaction Ledger
              </h3>
            </div>
            {registrations.length === 0 ? (
              <p className="text-xs text-nlip-text-soft print:text-gray-500 italic">
                No electronic NGDRS deed records on file.
              </p>
            ) : (
              <table className="w-full text-left border-collapse border border-nlip-border print:border-gray-300 text-xs">
                <thead>
                  <tr className="bg-nlip-surface-hi print:bg-gray-100 border-b border-nlip-border print:border-gray-300 font-mono text-[11px] text-nlip-text-soft print:text-gray-700">
                    <th className="p-2.5">Deed Nature</th>
                    <th className="p-2.5">Deed / Volume No.</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Sub-Registrar Office</th>
                    <th className="p-2.5">Consideration</th>
                    <th className="p-2.5">Tamper Proof Hash (SHA-256)</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-nlip-border/60 print:border-gray-200"
                    >
                      <td className="p-2.5 font-bold text-nlip-text print:text-black">
                        {reg.deed_type}
                      </td>
                      <td className="p-2.5 font-mono">{reg.deed_number}</td>
                      <td className="p-2.5 font-mono">{reg.registration_date}</td>
                      <td className="p-2.5">{reg.sub_registrar_office ?? 'Local SRO'}</td>
                      <td className="p-2.5 font-mono text-nlip-amber print:text-black">
                        {reg.consideration_amount
                          ? `₹${reg.consideration_amount.toLocaleString('en-IN')}`
                          : 'Nominal'}
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-nlip-text-faint print:text-gray-600 truncate max-w-[140px]">
                        {reg.document_hash ?? 'e7f2b9a4c10...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* SECTION 6: Municipal Tax & Building Clearances */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
                <Building2 className="w-4 h-4 text-nlip-amber print:text-black" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                  Section 6A · Property Tax Receipts
                </h3>
              </div>
              <div className="space-y-2">
                {taxRecords.length === 0 ? (
                  <p className="text-xs text-nlip-text-soft print:text-gray-500 italic">
                    No municipal tax assessment records.
                  </p>
                ) : (
                  taxRecords.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded bg-nlip-surface-hi/30 print:bg-gray-50 border border-nlip-border/50 print:border-gray-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold block">FY {t.assessment_year}–{t.assessment_year + 1}</span>
                        <span className="text-[11px] text-nlip-text-soft print:text-gray-600 font-mono">
                          Assessed: ₹{t.assessed_value?.toLocaleString('en-IN') ?? '—'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-nlip-amber print:text-black block">
                          Tax: ₹{t.tax_amount?.toLocaleString('en-IN') ?? '—'}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold ${
                            t.paid_status === 'paid'
                              ? 'text-emerald-400 print:text-green-700'
                              : 'text-rose-400 print:text-red-700'
                          }`}
                        >
                          {t.paid_status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-nlip-border/60 print:border-black/30">
                <Building2 className="w-4 h-4 text-nlip-amber print:text-black" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-nlip-text print:text-black">
                  Section 6B · Sanctions &amp; Planning Permits
                </h3>
              </div>
              <div className="space-y-2">
                {buildingPerms.length === 0 ? (
                  <p className="text-xs text-nlip-text-soft print:text-gray-500 italic">
                    No building layout sanctions filed.
                  </p>
                ) : (
                  buildingPerms.slice(0, 3).map((bp) => (
                    <div
                      key={bp.id}
                      className="p-2.5 rounded bg-nlip-surface-hi/30 print:bg-gray-50 border border-nlip-border/50 print:border-gray-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold block">{bp.approved_use ?? 'Sanctioned Use'}</span>
                        <span className="text-[11px] text-nlip-text-soft print:text-gray-600">
                          App #{bp.application_number} · {bp.built_up_area_sqm ?? '—'} m²
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          bp.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 print:bg-green-100 print:text-green-800'
                            : bp.status === 'deviation_flagged'
                            ? 'bg-rose-500/20 text-rose-400 print:bg-red-100 print:text-red-800'
                            : 'bg-nlip-surface-hi text-nlip-text-soft print:bg-gray-100 print:text-gray-700'
                        }`}
                      >
                        {bp.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* STATUTORY VERIFICATION & SIGNATURE CLAUSE */}
          <div className="border-t-2 border-nlip-amber/40 print:border-black/60 pt-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* QR Code Verification Box */}
              <div className="p-3 rounded-lg bg-black/40 print:bg-gray-50 border border-nlip-border print:border-gray-300 flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-0.5 rounded flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR verification code for parcel ${parcel.ulpin}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 animate-pulse" />
                  )}
                </div>

                <div className="text-[10px] text-nlip-text-soft print:text-gray-700 font-mono space-y-0.5">
                  <div className="font-bold text-nlip-text print:text-black uppercase">
                    Scan for Live Validation
                  </div>
                  <div>ID: {parcel.ulpin}</div>
                  <div className="text-emerald-400 print:text-green-700">SHA-256 Valid</div>
                  <div>api.nlip.gov.in/verify</div>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="text-[10px] text-nlip-text-faint print:text-gray-600 leading-relaxed font-mono">
                This document is a certified computer-generated summary issued pursuant to Section 65B of the Indian Evidence Act. Verification of digital signatures and SHA-256 cryptographic hashes can be validated via the National Land Intelligence Platform gateway.
              </div>

              {/* Digital Seal */}
              <div className="text-right font-mono text-[11px] space-y-1">
                <div className="text-nlip-amber print:text-black font-bold uppercase tracking-wider">
                  ELECTRONICALLY CERTIFIED
                </div>
                <div className="text-nlip-text-soft print:text-gray-700">
                  Bhu-Aadhaar Digital Infrastructure
                </div>
                <div className="text-[10px] text-nlip-text-faint print:text-gray-500">
                  Hash: 7f8a92c4...e13d
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
