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
    'relative flex items-center justify-center rounded-[1.5rem] md:rounded-[2rem] font-display font-black transition-all duration-300',
    'touch-target select-none overflow-visible group',
    sizeClasses[size],
    {
      'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-xl': onClick && !disabled,
      'cursor-not-allowed opacity-30 grayscale': disabled,

      // Stato Default (Navy)
      'bg-navy text-white shadow-lg border border-white/5': !isSelected && !position && !isFinalist,

      // Stato Selezione (Gold Glow)
      'bg-gold text-navy shadow-gold-glow border-2 border-white/20 scale-105': isSelected && !position,

      // Stato Finalista
      'bg-gradient-to-br from-gold via-gold to-gold-dark text-navy shadow-xl': isFinalist && !position,
    },
    position && positionColors[position],
    // Animazione di ingresso pulsata se selezionato
    isSelected && 'animate-pulse-soft'
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      type="button"
    >
      {/* Glossy Effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-[inherit]" />

      <span className="relative z-10 tracking-tighter tabular-nums drop-shadow-sm">{number}</span>

      {position && (
        <span className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-navy text-white rounded-2xl flex items-center justify-center text-xs md:text-sm font-black shadow-2xl border-2 border-white/10 animate-in zoom-in duration-300">
          {position}°
        </span>
      )}

      {name && size === 'lg' && (
        <span className="absolute -bottom-7 left-0 right-0 text-[9px] font-black uppercase tracking-widest text-navy/40 truncate px-1">
          {name}
        </span>
      )}

      {isSelected && !position && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-success text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 animate-in zoom-in duration-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
