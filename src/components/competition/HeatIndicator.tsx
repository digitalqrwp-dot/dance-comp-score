import React from 'react';
import { cn } from '@/lib/utils';

interface HeatIndicatorProps {
  currentHeat: number;
  totalHeats: number;
  className?: string;
}

export const HeatIndicator: React.FC<HeatIndicatorProps> = ({
  currentHeat,
  totalHeats,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-navy/5', className)}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 ml-2">Batterie</span>
      <div className="flex gap-2">
        {Array.from({ length: totalHeats }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-black transition-all duration-300',
              index === currentHeat
                ? 'bg-gold text-navy shadow-gold-glow scale-110'
                : index < currentHeat
                  ? 'bg-navy/10 text-navy/40'
                  : 'bg-white text-slate-300 border border-slate-100'
            )}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
