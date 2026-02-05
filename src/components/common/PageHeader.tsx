import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 relative group', className)}>
      <div className="space-y-1 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-navy tracking-tighter leading-none">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground/80 font-sans font-medium text-sm sm:text-base max-w-2xl border-l-2 border-gold/20 pl-4 py-1">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 animate-in fade-in zoom-in duration-500 delay-200">
          {action}
        </div>
      )}
    </div>
  );
};
