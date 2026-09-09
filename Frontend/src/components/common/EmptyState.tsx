import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, Lightbulb, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  onSelectSandboxParcel?: (ulpin: string) => void;
  showSuggestions?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Parcel Record Not Found',
  description = 'No parcel record matched your search query in the selected state registry.',
  actionText,
  onAction,
  onSelectSandboxParcel,
  showSuggestions = true,
  className,
}) => {
  const sandboxParcels = [
    { label: '📍 UP: Khasra K-2234', ulpin: 'UP09412601001' },
    { label: '⚠️ MH: 7/12-0501 (Variance)', ulpin: 'MH27830501001' },
    { label: '📍 KA: Koramangala 15/03', ulpin: 'KA29150301001' },
    { label: '📍 TN: Chennai 62/08', ulpin: 'TN33620801001' },
    { label: '⚠️ TS: Hyderabad (Dispute Demo)', ulpin: 'TS36280201001' },
    { label: '🌾 PB: Amritsar Farmland', ulpin: 'PB03140701001' },
    { label: '🚨 MP: Bhopal (Fraud Demo)', ulpin: 'MP23090401001' },
  ];

  return (
    <div
      className={twMerge(
        clsx(
          'nlip-glass-card p-6 md:p-8 rounded-nlip border border-nlip-border text-center max-w-2xl mx-auto my-6',
          className
        )
      )}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-nlip-surface-hi border border-nlip-border-hi flex items-center justify-center text-nlip-amber">
        {icon ?? <Search className="w-7 h-7" />}
      </div>

      <h3 className="text-xl font-bold font-display text-nlip-text mb-2">
        {title}
      </h3>

      <p className="text-sm text-nlip-text-soft mb-6 max-w-md mx-auto">
        {description}
      </p>

      {showSuggestions && (
        <div className="text-left bg-black/20 border border-nlip-border rounded-nlip-sm p-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-nlip-amber uppercase tracking-wider mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Suggestions for successful search</span>
          </div>
          <ul className="text-xs text-nlip-text-soft space-y-1.5 list-disc list-inside">
            <li>
              Check your identifier format (e.g., <code className="text-nlip-amber font-mono">K-2234</code>, <code className="text-nlip-amber font-mono">412/601</code>, or 14-digit ULPIN).
            </li>
            <li>
              Ensure the correct <strong className="text-nlip-text">State / UT</strong> is selected in the dropdown.
            </li>
            <li>
              Try our verified <strong className="text-nlip-text">pre-indexed sandbox parcels</strong> below:
            </li>
          </ul>

          {onSelectSandboxParcel && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-nlip-border/60">
              {sandboxParcels.map((p) => (
                <button
                  key={p.ulpin}
                  type="button"
                  onClick={() => onSelectSandboxParcel(p.ulpin)}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-nlip-surface-hi border border-nlip-border-hi text-nlip-text hover:border-nlip-amber hover:text-nlip-amber transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {actionText && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
