import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMyConsents, patchConsent, createConsent } from '@/lib/api';
import type { Consent, ConsentScopeKey, CreateConsentRequest } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { Modal } from '@/components/common/Modal';
import {
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Key,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Plus,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';

const SCOPE_LABELS: Record<ConsentScopeKey, { name: string; desc: string }> = {
  ror: { name: 'Record of Rights (RoR)', desc: 'Landholder identity, joint shares, and Khatauni' },
  encumbrance: { name: 'Encumbrance Registry', desc: 'Mortgages, liens, court caveats, and liabilities' },
  registration: { name: 'Registered Title Deeds', desc: 'Sale deeds, consideration values, and SRO volume' },
  tax: { name: 'Property Tax Records', desc: 'Municipal assessment and payment clearances' },
  building_permission: { name: 'Sanctioned Layouts', desc: 'Town planning building permissions and FAR' },
};

export const ConsentPortalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'citizen' | 'request'>('citizen');
  const [selectedConsentForRevoke, setSelectedConsentForRevoke] = useState<Consent | null>(null);

  // New consent form state (Bank/Requester perspective)
  const [reqParcelId, setReqParcelId] = useState('pcl-mh-001');
  const [reqPurpose, setReqPurpose] = useState('Priority agri-lending verification for Kisan Credit Card expansion');
  const [reqScopes, setReqScopes] = useState<ConsentScopeKey[]>(['ror', 'encumbrance']);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Fetch consents
  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['consents'],
    queryFn: () => listMyConsents(),
  });

  // Patch consent mutation (approve or revoke)
  const patchMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'revoked' }) =>
      patchConsent(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      setSelectedConsentForRevoke(null);
    },
  });

  // Create consent mutation
  const createMutation = useMutation({
    mutationFn: (body: CreateConsentRequest) => createConsent(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      setFormSuccessMessage('Consent request dispatched to registered landholder via Bhu-Aadhaar gateway.');
      setTimeout(() => setFormSuccessMessage(null), 5000);
      setActiveView('citizen');
    },
  });

  const handleToggleScope = (scope: ConsentScopeKey) => {
    setReqScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqParcelId || !reqPurpose || reqScopes.length === 0) return;
    createMutation.mutate({
      parcel_id: reqParcelId,
      purpose: reqPurpose,
      scope: reqScopes,
    });
  };

  const pendingConsents = consents.filter((c) => c.status === 'pending');
  const activeConsents = consents.filter((c) => c.status === 'approved');

  return (
    <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner & DPDP Explainer */}
      <div className="pb-6 border-b border-nlip-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nlip-surface-hi border border-nlip-border text-xs font-mono text-nlip-amber mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-nlip-amber" />
          <span>DEPA Architecture · Section 6 DPDP Act 2023 Compliant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-nlip-text">
          Consent-Based Land Data Exchange (DEPA)
        </h1>
        <p className="text-xs sm:text-sm text-nlip-text-soft mt-1 max-w-3xl">
          Under India&apos;s Digital Personal Data Protection Act, landholders retain absolute ownership over non-public records.
          Financial institutions request time-boxed, purpose-bound electronic tokens; every access is digitally signed and logged.
        </p>
      </div>

      {/* 4 DPI Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="flex items-center gap-2 text-nlip-amber mb-1.5">
            <Lock className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase font-mono">Purpose Bound</h3>
          </div>
          <p className="text-[11px] text-nlip-text-soft leading-relaxed">
            Data can strictly only be used for the declared loan due diligence or title verification purpose.
          </p>
        </div>

        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="flex items-center gap-2 text-sky-400 mb-1.5">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase font-mono">Time-Boxed Validity</h3>
          </div>
          <p className="text-[11px] text-nlip-text-soft leading-relaxed">
            Tokens expire automatically after the validity period (typically 30–90 days).
          </p>
        </div>

        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="flex items-center gap-2 text-rose-400 mb-1.5">
            <RefreshCw className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase font-mono">1-Click Revocation</h3>
          </div>
          <p className="text-[11px] text-nlip-text-soft leading-relaxed">
            Citizens can instantly withdraw consent anytime, immediately invalidating active API access keys.
          </p>
        </div>

        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
            <Scale className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase font-mono">Cryptographic Audit</h3>
          </div>
          <p className="text-[11px] text-nlip-text-soft leading-relaxed">
            Every grant, query, and revocation is recorded into a SHA-256 hash-chained immutable audit log.
          </p>
        </div>
      </div>

      {/* Perspective Toggle Buttons */}
      <div className="flex items-center gap-3 border-b border-nlip-border pb-1">
        <button
          type="button"
          onClick={() => setActiveView('citizen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors border-b-2 ${
            activeView === 'citizen'
              ? 'text-nlip-amber border-nlip-amber bg-white/[0.04]'
              : 'text-nlip-text-soft border-transparent hover:text-nlip-text'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>My Consents Dashboard (Landholder View) ({consents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('request')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors border-b-2 ${
            activeView === 'request'
              ? 'text-nlip-amber border-nlip-amber bg-white/[0.04]'
              : 'text-nlip-text-soft border-transparent hover:text-nlip-text'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Request Data Access (Bank / FI Simulator)</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* VIEW 1: CITIZEN CONSENT DASHBOARD                                   */}
      {/* =================================================================== */}
      {activeView === 'citizen' && (
        <div className="space-y-6">
          {formSuccessMessage && (
            <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12"><Loader size="md" label="Loading consent artefacts..." /></div>
          ) : consents.length === 0 ? (
            <div className="nlip-glass-card p-10 rounded-nlip border border-nlip-border text-center space-y-3">
              <Shield className="w-10 h-10 text-nlip-text-faint mx-auto" />
              <h3 className="text-base font-bold text-nlip-text">No Consent Artefacts</h3>
              <p className="text-xs text-nlip-text-soft max-w-md mx-auto">
                There are no active or pending consent requests for your land parcels.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consents.map((consent) => {
                const isPending = consent.status === 'pending';
                const isApproved = consent.status === 'approved';
                const isRevoked = consent.status === 'revoked';

                return (
                  <div
                    key={consent.id}
                    className="nlip-glass-card p-5 rounded-nlip border border-nlip-border hover:border-nlip-border-hi transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-nlip-border gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            isApproved
                              ? 'green'
                              : isPending
                              ? 'amber'
                              : isRevoked
                              ? 'red'
                              : 'neutral'
                          }
                          size="sm"
                          dot
                        >
                          {consent.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-nlip-text">
                          Artefact ID: #{consent.id}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-nlip-text-soft">
                        Requested: {consent.created_at.slice(0, 10)}
                        {consent.valid_until && (
                          <span className="ml-2 text-emerald-400">
                            · Expires: {consent.valid_until.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-nlip-text-faint block mb-1">
                          Requesting Entity / Institution
                        </span>
                        <div className="font-bold text-nlip-text flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-nlip-amber" />
                          <span>{consent.requester?.name ?? 'Registered Bank Official'}</span>
                        </div>
                        <span className="text-[11px] text-nlip-text-soft block mt-0.5">
                          {consent.requester?.email ?? 'official@bank.in'} ({consent.requester?.role?.replace(/_/g, ' ')})
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-[10px] font-mono uppercase text-nlip-text-faint block mb-1">
                          Declared Statutory Purpose
                        </span>
                        <p className="text-xs text-nlip-text bg-nlip-surface-hi/40 p-2.5 rounded border border-nlip-border/60 font-mono leading-relaxed">
                          &ldquo;{consent.purpose}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Scopes Requested */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-nlip-text-faint block mb-1.5">
                        Authorised Data Scope
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {consent.scope.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-nlip-surface-hi border border-nlip-border text-[11px] font-mono text-nlip-text"
                          >
                            <Key className="w-3 h-3 text-nlip-amber" />
                            <span>{SCOPE_LABELS[s]?.name ?? s}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-nlip-border/40 gap-3">
                      <span className="text-[11px] font-mono text-nlip-text-faint">
                        Target Parcel: <strong className="text-nlip-amber">{consent.parcel_id}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                              onClick={() =>
                                patchMutation.mutate({ id: consent.id, status: 'revoked' })
                              }
                              isLoading={patchMutation.isPending}
                            >
                              Deny
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              onClick={() =>
                                patchMutation.mutate({ id: consent.id, status: 'approved' })
                              }
                              isLoading={patchMutation.isPending}
                            >
                              Approve Token (Grant Access)
                            </Button>
                          </>
                        )}

                        {isApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-400 border-rose-900/50 hover:bg-rose-950/20"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedConsentForRevoke(consent)}
                          >
                            Revoke Access Immediately
                          </Button>
                        )}

                        {isRevoked && (
                          <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Access Revoked by Landholder
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: REQUEST ACCESS (BANK / FI SIMULATOR)                        */}
      {/* =================================================================== */}
      {activeView === 'request' && (
        <div className="nlip-glass-card p-6 md:p-8 rounded-nlip border border-nlip-border max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-nlip-border">
            <Plus className="w-4 h-4 text-nlip-amber" />
            <h2 className="text-sm font-bold text-nlip-text">
              Submit New Data Access Request (Banking / Verification Simulator)
            </h2>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
                Target Parcel Canonical Reference / ULPIN
              </label>
              <input
                type="text"
                value={reqParcelId}
                onChange={(e) => setReqParcelId(e.target.value)}
                placeholder="e.g. pcl-mh-001 or MH27830501001"
                className="w-full px-3.5 py-2.5 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
                Declared Statutory Purpose (DPDP Act Requirement)
              </label>
              <textarea
                value={reqPurpose}
                onChange={(e) => setReqPurpose(e.target.value)}
                placeholder="State the exact business/legal purpose..."
                className="w-full h-20 px-3.5 py-2.5 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber resize-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-2">
                Requested Data Scopes
              </label>
              <div className="space-y-2">
                {(Object.keys(SCOPE_LABELS) as ConsentScopeKey[]).map((scope) => (
                  <label
                    key={scope}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      reqScopes.includes(scope)
                        ? 'bg-nlip-amber/10 border-nlip-amber/40 text-nlip-text'
                        : 'bg-nlip-surface-hi/40 border-nlip-border text-nlip-text-soft hover:text-nlip-text'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={reqScopes.includes(scope)}
                      onChange={() => handleToggleScope(scope)}
                      className="mt-0.5 rounded border-nlip-border text-nlip-amber focus:ring-0 focus:ring-offset-0"
                    />
                    <div>
                      <span className="font-mono font-bold block">{SCOPE_LABELS[scope].name}</span>
                      <span className="text-[11px] text-nlip-text-soft leading-tight block">
                        {SCOPE_LABELS[scope].desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full py-2.5"
                isLoading={createMutation.isPending}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Transmit Consent Request to Citizen
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {selectedConsentForRevoke && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConsentForRevoke(null)}
          title="Confirm Immediate Consent Revocation"
        >
          <div className="space-y-4 text-xs">
            <p className="text-nlip-text-soft leading-relaxed">
              Are you sure you want to revoke data exchange token{' '}
              <strong className="text-nlip-text font-mono">#{selectedConsentForRevoke.id}</strong>{' '}
              for <strong className="text-nlip-amber">{selectedConsentForRevoke.requester?.name}</strong>?
            </p>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs">
              This action immediately terminates all API read access and invalidates any active cached certificates per Section 6(4) of the DPDP Act 2023.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedConsentForRevoke(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-500"
                isLoading={patchMutation.isPending}
                onClick={() =>
                  patchMutation.mutate({
                    id: selectedConsentForRevoke.id,
                    status: 'revoked',
                  })
                }
              >
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
