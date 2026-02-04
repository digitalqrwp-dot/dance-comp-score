import React from 'react';
import { cn } from '@/lib/utils';

interface ParticipantBadgeProps {
  number: number;
  name?: string;
  isSelected?: boolean;
  isFinalist?: boolean;
  position?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

const positionColors: Record<number, string> = {
  1: 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-amber-200',
  2: 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 shadow-slate-200',
  3: 'bg-gradient-to-br from-orange-400 to-orange-700 text-orange-950 shadow-orange-200',
};

export const ParticipantBadge: React.FC<ParticipantBadgeProps> = ({
  number,
  name,
  isSelected = false,
  isFinalist = false,
  position,
  size = 'md',
  onClick,
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const baseClasses = cn(
    'relative flex items-center justify-center rounded-xl font-display font-bold transition-all duration-200',
    'touch-target select-none',
    sizeClasses[size],
    {
      'cursor-pointer hover:scale-105 active:scale-95': onClick && !disabled,
      'cursor-not-allowed opacity-50': disabled,
      'bg-primary text-primary-foreground shadow-medium': !isSelected && !position,
      'bg-success text-success-foreground shadow-lg ring-4 ring-success/30': isSelected && !position,
      'bg-gradient-to-br from-gold to-gold-dark text-navy-dark shadow-lg': isFinalist && !position,
    },
    position && positionColors[position],
    !position && !isSelected && !isFinalist && 'bg-primary text-primary-foreground shadow-soft'
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      type="button"
    >
      <span className="relative z-10">{number}</span>
      {position && (
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-md">
          {position}°
        </span>
      )}
      {name && size === 'lg' && (
        <span className="absolute -bottom-6 left-0 right-0 text-xs text-center text-muted-foreground truncate font-sans font-normal">
          {name}
        </span>
      )}
      {isSelected && !position && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-success text-success-foreground rounded-full flex items-center justify-center">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
};
