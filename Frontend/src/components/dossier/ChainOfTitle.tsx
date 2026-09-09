import React, { useState, useMemo } from 'react';
import type { HistoryEvent, Mutation } from '@/types';
import { Badge } from '@/components/common/Badge';
import {
  FileText,
  ArrowRightLeft,
  ShieldAlert,
  AlertTriangle,
  Building,
  Calendar,
  Clock,
  User,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export interface ChainOfTitleProps {
  historyEvents?: HistoryEvent[];
  mutations?: Mutation[];
  isLoading?: boolean;
}

export const ChainOfTitle: React.FC<ChainOfTitleProps> = ({
  historyEvents = [],
  mutations = [],
  isLoading = false,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // Compute mutation velocity (e.g. total mutations over time)
  const mutationCount = mutations.length;
  const isHighVelocity = mutationCount >= 3;

  // Filtered timeline items
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return historyEvents;
    return historyEvents.filter((ev) => ev.event_type === filterType);
  }, [historyEvents, filterType]);

  const getEventIcon = (type: HistoryEvent['event_type']) => {
    switch (type) {
      case 'registration':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'mutation':
        return <ArrowRightLeft className="w-4 h-4 text-nlip-amber" />;
      case 'encumbrance':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'building_permission':
        return <Building className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-nlip-text-soft" />;
    }
  };

  const getEventBadge = (type: HistoryEvent['event_type']) => {
    switch (type) {
      case 'registration':
        return <Badge variant="blue" size="sm">REGISTRATION</Badge>;
      case 'mutation':
        return <Badge variant="amber" size="sm">MUTATION</Badge>;
      case 'encumbrance':
        return <Badge variant="red" size="sm">ENCUMBRANCE</Badge>;
      case 'alert':
        return <Badge variant="amber" size="sm">SATELLITE ALERT</Badge>;
      case 'building_permission':
        return <Badge variant="purple" size="sm">SANCTION</Badge>;
      default:
        return <Badge variant="neutral" size="sm">EVENT</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Velocity Callout */}
      <div className="nlip-glass-card p-5 rounded-nlip border border-nlip-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-nlip-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-nlip-amber" />
            <span>Chronological Chain of Title &amp; Mutation Ledger</span>
          </h2>
          <p className="text-xs text-nlip-text-soft mt-0.5">
            Immutable timeline of deed executions, revenue mutations, court caveats, and satellite alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHighVelocity ? (
            <Badge variant="amber" size="sm" dot>
              High Mutation Velocity ({mutationCount} transfers)
            </Badge>
          ) : (
            <Badge variant="green" size="sm" dot>
              Stable Chain ({mutationCount} mutations)
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-nlip-text-faint flex items-center gap-1 font-mono uppercase text-[11px] mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {[
          { id: 'all', label: 'All Events' },
          { id: 'registration', label: 'Registrations' },
          { id: 'mutation', label: 'Mutations' },
          { id: 'encumbrance', label: 'Encumbrances' },
          { id: 'alert', label: 'Satellite Alerts' },
          { id: 'building_permission', label: 'Building Permits' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-full font-mono text-xs transition-colors border ${
              filterType === f.id
                ? 'bg-nlip-amber/15 text-nlip-amber border-nlip-amber/40 font-semibold'
                : 'bg-nlip-surface text-nlip-text-soft border-nlip-border hover:text-nlip-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-nlip-text-soft font-mono">
          Loading title history ledger...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="nlip-glass-card p-8 rounded-nlip border border-nlip-border text-center text-xs text-nlip-text-soft">
          No historical events found for the selected category.
        </div>
      ) : (
        <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-nlip-border-hi">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Dot Icon on line */}
              <div className="absolute -left-6 md:-left-8 top-1.5 w-6 h-6 rounded-full bg-nlip-bg-2 border border-nlip-border-hi flex items-center justify-center group-hover:border-nlip-amber transition-colors shadow-sm">
                {getEventIcon(event.event_type)}
              </div>

              {/* Event Content Card */}
              <div className="nlip-glass-card p-4 rounded-nlip border border-nlip-border hover:border-nlip-border-hi transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-nlip-border/50 gap-2">
                  <div className="flex items-center gap-2">
                    {getEventBadge(event.event_type)}
                    <h3 className="text-sm font-bold text-nlip-text">{event.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-nlip-text-soft">
                    <Calendar className="w-3 h-3 text-nlip-amber" />
                    <span>{event.event_date}</span>
                  </div>
                </div>

                <p className="text-xs text-nlip-text-soft leading-relaxed">
                  {event.description}
                </p>

                {/* Additional metadata context if mutation */}
                {event.event_type === 'mutation' && (
                  <div className="mt-3 pt-2.5 border-t border-nlip-border/30 flex items-center gap-3 text-[11px] font-mono text-nlip-text-faint">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Tehsildar Sanctioned
                    </span>
                    <span>·</span>
                    <span>Audit Trail Hash Linked</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
