import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-white/5 flex items-center justify-center mb-6 relative group">
          <div className="absolute inset-0 bg-gold/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative text-muted-foreground/40 group-hover:text-gold transition-colors duration-500 scale-110">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-xl font-display font-black text-navy tracking-tighter mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground font-sans font-medium max-w-sm mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="animate-in fade-in zoom-in duration-500 delay-300">
          {action}
        </div>
      )}
    </div>
  );
};
