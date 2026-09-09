import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading land records...',
  size = 'md',
  className,
}) => {
  const spinnerSize = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )
      )}
    >
      <div className="relative mb-4">
        <div
          className={clsx(
            'rounded-full border-nlip-border-hi border-t-nlip-amber animate-spin',
            spinnerSize[size]
          )}
        />
        <div className="absolute inset-0 rounded-full blur-sm bg-nlip-amber/20 animate-pulse pointer-events-none" />
      </div>
      {label && (
        <p className="text-sm font-medium text-nlip-text-soft font-mono animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={twMerge(
      'animate-pulse rounded-md bg-white/[0.06] border border-white/[0.04]',
      className
    )}
  />
);
