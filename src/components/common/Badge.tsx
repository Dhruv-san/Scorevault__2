import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'outline' | 'verified';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon
}) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
    outline: 'bg-transparent text-slate-600 border-slate-300',
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 font-medium'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border font-medium whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
