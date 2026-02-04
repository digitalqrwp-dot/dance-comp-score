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
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium text-muted-foreground">Batteria</span>
      <div className="flex gap-1">
        {Array.from({ length: totalHeats }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
              index === currentHeat 
                ? 'bg-primary text-primary-foreground shadow-soft scale-110' 
                : index < currentHeat 
                  ? 'bg-success/20 text-success' 
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
