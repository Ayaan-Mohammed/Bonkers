import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listAlerts, patchAlert, listGrievances, patchGrievance } from '@/lib/api';
import type { ChangeDetectionAlert, Grievance, AlertStatus, GrievanceStatus } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { Modal } from '@/components/common/Modal';
import {
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Eye,
  Satellite,
  UserCheck,
  Building,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'alerts' | 'grievances'>('alerts');
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [grievanceFilter, setGrievanceFilter] = useState<string>('all');

  // Selected item for action modal
  const [selectedAlert, setSelectedAlert] = useState<ChangeDetectionAlert | null>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [actionStatus, setActionStatus] = useState<string>('');
  const [actionRemarks, setActionRemarks] = useState<string>('');

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['officer-alerts', alertFilter],
    queryFn: () => listAlerts(alertFilter !== 'all' ? { status: alertFilter } : undefined),
  });

  // Fetch grievances
  const { data: grievancesData, isLoading: grievancesLoading } = useQuery({
    queryKey: ['officer-grievances'],
    queryFn: () => listGrievances({ officer: 'me' }),
  });

  // Mutation for patching alert status
  const updateAlertMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'under_review' | 'resolved' }) =>
      patchAlert(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-alerts'] });
      setSelectedAlert(null);
    },
  });

  // Mutation for patching grievance status
  const updateGrievanceMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: GrievanceStatus; remarks?: string }) =>
      patchGrievance(id, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-grievances'] });
      setSelectedGrievance(null);
    },
  });

  const alerts = alertsData?.items ?? [];
  const grievances = grievancesData?.items ?? [];

  const openAlertsCount = alerts.filter((a) => a.status === 'open').length;
  const inReviewAlertsCount = alerts.filter((a) => a.status === 'under_review').length;
  const pendingGrievancesCount = grievances.filter((g) => g.status !== 'resolved').length;

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'all') return true;
    return a.status === alertFilter;
  });

  const filteredGrievances = grievances.filter((g) => {
    if (grievanceFilter === 'all') return true;
    return g.status === grievanceFilter;
  });

  const handleOpenAlertModal = (alert: ChangeDetectionAlert) => {
    setSelectedAlert(alert);
    setActionStatus(alert.status === 'open' ? 'under_review' : 'resolved');
  };

  const handleOpenGrievanceModal = (grv: Grievance) => {
    setSelectedGrievance(grv);
    setActionStatus(grv.status === 'open' ? 'in_progress' : 'resolved');
    setActionRemarks('');
  };

  const handleSaveAlertStatus = () => {
    if (!selectedAlert) return;
    updateAlertMutation.mutate({
      id: selectedAlert.id,
      status: actionStatus as 'under_review' | 'resolved',
    });
  };

  const handleSaveGrievanceStatus = () => {
    if (!selectedGrievance) return;
    updateGrievanceMutation.mutate({
      id: selectedGrievance.id,
      status: actionStatus as GrievanceStatus,
      remarks: actionRemarks,
    });
  };

  return (
    <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-nlip-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nlip-surface-hi border border-nlip-border text-xs font-mono text-nlip-amber mb-2">
            <Shield className="w-3.5 h-3.5 text-nlip-amber" />
            <span>Revenue &amp; Planning Officer Portal · Tehsildar Division</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-nlip-text">
            Officer Verification &amp; Grievance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-nlip-text-soft mt-1">
            Review satellite change detection anomalies, boundary disputes, and citizen grievances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            Role: Revenue Officer
          </Badge>
          <Badge variant="green" size="md" dot>
            Jurisdiction: Active
          </Badge>
        </div>
      </div>

      {/* KPI Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="text-[11px] font-mono text-nlip-text-faint uppercase mb-1 flex items-center justify-between">
            <span>Open Satellite Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {openAlertsCount}
          </div>
          <div className="text-xs text-nlip-text-soft mt-1">
            Requires immediate inspection
          </div>
        </div>

        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="text-[11px] font-mono text-nlip-text-faint uppercase mb-1 flex items-center justify-between">
            <span>Under Review</span>
            <Clock className="w-3.5 h-3.5 text-nlip-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-nlip-amber">
            {inReviewAlertsCount}
          </div>
          <div className="text-xs text-nlip-text-soft mt-1">
            Field inquiry underway
          </div>
        </div>

        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="text-[11px] font-mono text-nlip-text-faint uppercase mb-1 flex items-center justify-between">
            <span>Pending Grievances</span>
            <FileText className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">
            {pendingGrievancesCount}
          </div>
          <div className="text-xs text-nlip-text-soft mt-1">
            Within 30-day SLA window
          </div>
        </div>

        <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border">
          <div className="text-[11px] font-mono text-nlip-text-faint uppercase mb-1 flex items-center justify-between">
            <span>Encroachment Detection</span>
            <Satellite className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            SVAMITVA
          </div>
          <div className="text-xs text-nlip-text-soft mt-1">
            Drone &amp; Multi-temporal optical
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-nlip-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'alerts'
              ? 'text-nlip-amber border-nlip-amber bg-white/[0.04]'
              : 'text-nlip-text-soft border-transparent hover:text-nlip-text'
          }`}
        >
          <Satellite className="w-4 h-4" />
          <span>Satellite &amp; Cadastral Alerts ({alerts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grievances')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'grievances'
              ? 'text-nlip-amber border-nlip-amber bg-white/[0.04]'
              : 'text-nlip-text-soft border-transparent hover:text-nlip-text'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Citizen Grievances ({grievances.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: SATELLITE & CADASTRAL ALERTS                                */}
      {/* =================================================================== */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-nlip-text-faint uppercase text-[11px]">Filter:</span>
              {['all', 'open', 'under_review', 'resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAlertFilter(st)}
                  className={`px-3 py-1 rounded-full font-mono transition-colors border ${
                    alertFilter === st
                      ? 'bg-nlip-amber/15 text-nlip-amber border-nlip-amber/40 font-bold'
                      : 'bg-nlip-surface text-nlip-text-soft border-nlip-border hover:text-nlip-text'
                  }`}
                >
                  {st.replace(/_/g, ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <div className="text-xs text-nlip-text-soft">
              Showing {filteredAlerts.length} alert(s)
            </div>
          </div>

          {alertsLoading ? (
            <div className="py-12"><Loader size="md" label="Loading alerts..." /></div>
          ) : filteredAlerts.length === 0 ? (
            <div className="nlip-glass-card p-8 rounded-nlip border border-nlip-border text-center text-xs text-nlip-text-soft">
              No alerts found for status "{alertFilter}".
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="nlip-glass-card p-5 rounded-nlip border border-nlip-border hover:border-nlip-border-hi transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge
                        variant={
                          alert.status === 'open'
                            ? 'red'
                            : alert.status === 'under_review'
                            ? 'amber'
                            : 'green'
                        }
                        size="sm"
                        dot
                      >
                        {alert.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>

                      <span className="text-sm font-bold text-nlip-text uppercase font-mono">
                        {alert.alert_type.replace(/_/g, ' ')}
                      </span>

                      {/* MANDATORY PRD BADGE: Simulated Data */}
                      {alert.is_simulated && (
                        <Badge variant="purple" size="sm">
                          Simulated Satellite Data
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-nlip-text-soft">
                      <div>
                        <span className="text-nlip-text-faint">Detected Date:</span>{' '}
                        <span className="font-mono text-nlip-text">{alert.detected_date}</span>
                      </div>
                      <div>
                        <span className="text-nlip-text-faint">Confidence Score:</span>{' '}
                        <span className="font-mono font-bold text-nlip-amber">
                          {(alert.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-nlip-text-faint">Parcel Reference:</span>{' '}
                        <span className="font-mono text-nlip-text">{alert.parcel_id}</span>
                      </div>
                    </div>

                    {alert.snapshot_before_ref && (
                      <div className="text-[11px] font-mono text-nlip-text-faint truncate">
                        Imagery Baseline: {alert.snapshot_before_ref}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/parcel/TS36280201001#gis`}>
                      <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Inspect GIS
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAlertModal(alert)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: CITIZEN GRIEVANCES                                          */}
      {/* =================================================================== */}
      {activeTab === 'grievances' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-nlip-text-faint uppercase text-[11px]">Filter:</span>
              {['all', 'open', 'in_progress', 'resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setGrievanceFilter(st)}
                  className={`px-3 py-1 rounded-full font-mono transition-colors border ${
                    grievanceFilter === st
                      ? 'bg-nlip-amber/15 text-nlip-amber border-nlip-amber/40 font-bold'
                      : 'bg-nlip-surface text-nlip-text-soft border-nlip-border hover:text-nlip-text'
                  }`}
                >
                  {st.replace(/_/g, ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <div className="text-xs text-nlip-text-soft">
              Showing {filteredGrievances.length} grievance(s)
            </div>
          </div>

          {grievancesLoading ? (
            <div className="py-12"><Loader size="md" label="Loading grievances..." /></div>
          ) : filteredGrievances.length === 0 ? (
            <div className="nlip-glass-card p-8 rounded-nlip border border-nlip-border text-center text-xs text-nlip-text-soft">
              No grievances found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGrievances.map((grv) => (
                <div
                  key={grv.id}
                  className="nlip-glass-card p-5 rounded-nlip border border-nlip-border hover:border-nlip-border-hi transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge
                        variant={
                          grv.status === 'open'
                            ? 'red'
                            : grv.status === 'in_progress'
                            ? 'amber'
                            : 'green'
                        }
                        size="sm"
                        dot
                      >
                        {grv.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm font-bold text-nlip-text">
                        {grv.category}
                      </span>
                      <span className="text-xs font-mono text-nlip-text-faint">
                        #{grv.id}
                      </span>
                    </div>

                    <p className="text-xs text-nlip-text-soft leading-relaxed">
                      {grv.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-nlip-text-soft pt-1">
                      <div>
                        <span className="text-nlip-text-faint">Complainant:</span>{' '}
                        <span className="text-nlip-text font-medium">
                          {grv.applicant?.name ?? 'Registered Citizen'}
                        </span>
                      </div>
                      <div>
                        <span className="text-nlip-text-faint">Filed:</span>{' '}
                        <span className="font-mono text-nlip-text">{grv.created_at.slice(0, 10)}</span>
                      </div>
                      <div>
                        <span className="text-nlip-text-faint">SLA Deadline:</span>{' '}
                        <span className="font-mono text-nlip-amber">
                          {grv.sla_due_date ?? 'Within 30 Days'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenGrievanceModal(grv)}
                    >
                      Resolve / Reassign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Modal for Alert */}
      {selectedAlert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
          title="Update Satellite Alert Status"
        >
          <div className="space-y-4 text-xs">
            <p className="text-nlip-text-soft">
              Change verification state for alert{' '}
              <strong className="text-nlip-text uppercase">
                {selectedAlert.alert_type.replace(/_/g, ' ')}
              </strong>.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
                Target Status
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber font-mono"
              >
                <option value="under_review">UNDER REVIEW (Field Visit Scheduled)</option>
                <option value="resolved">RESOLVED (Action Completed / Cleared)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={updateAlertMutation.isPending}
                onClick={handleSaveAlertStatus}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Action Modal for Grievance */}
      {selectedGrievance && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedGrievance(null)}
          title={`Update Grievance #${selectedGrievance.id}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
                Resolution Status
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber font-mono"
              >
                <option value="in_progress">IN PROGRESS (Officer Assigned)</option>
                <option value="resolved">RESOLVED (Action Taken)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
                Officer Remarks
              </label>
              <textarea
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder="Enter field inspection notes or resolution outcome..."
                className="w-full h-24 px-3 py-2 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedGrievance(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={updateGrievanceMutation.isPending}
                onClick={handleSaveGrievanceStatus}
              >
                Submit Resolution
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
