import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconRight,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium font-body rounded-nlip-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-nlip-amber/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-nlip-amber to-[#c98e3b] text-[#17140f] font-semibold hover:brightness-110 shadow-md hover:shadow-amber-glow',
    secondary:
      'bg-nlip-surface-hi text-nlip-text hover:bg-white/15 border border-nlip-border-hi',
    outline:
      'bg-transparent text-nlip-amber border border-nlip-amber/40 hover:bg-nlip-amber/10 hover:border-nlip-amber',
    ghost:
      'bg-transparent text-nlip-text-soft hover:text-nlip-text hover:bg-white/5',
    danger:
      'bg-red-900/40 text-red-300 border border-red-700/50 hover:bg-red-800/50',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
};
