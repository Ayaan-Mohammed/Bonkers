import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'green' | 'red' | 'blue' | 'purple' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 font-mono font-medium rounded-full border transition-colors';

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs tracking-wide',
    md: 'px-3 py-1 text-sm tracking-normal',
  };

  const variantStyles = {
    amber:
      'bg-nlip-amber/10 text-nlip-amber border-nlip-amber/30',
    green:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    red:
      'bg-rose-500/10 text-rose-400 border-rose-500/30',
    blue:
      'bg-sky-500/10 text-sky-400 border-sky-500/30',
    purple:
      'bg-purple-500/10 text-purple-400 border-purple-500/30',
    neutral:
      'bg-nlip-surface-hi text-nlip-text-soft border-nlip-border-hi',
    outline:
      'bg-transparent text-nlip-text-soft border-nlip-border',
  };

  const dotColor = {
    amber: 'bg-nlip-amber',
    green: 'bg-emerald-400',
    red: 'bg-rose-400',
    blue: 'bg-sky-400',
    purple: 'bg-purple-400',
    neutral: 'bg-nlip-text-faint',
    outline: 'bg-nlip-text-faint',
  };

  return (
    <span
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColor[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
