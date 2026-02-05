import React from 'react';
import { ParticipantBadge } from './ParticipantBadge';
import { cn } from '@/lib/utils';
interface Participant {
  id: string;
  competitionNumber: number;
  name: string;
}

interface SelectionGridProps {
  participants: Participant[];
  selectedIds: string[];
  onToggleSelection: (participantId: string) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

export const SelectionGrid = React.memo<SelectionGridProps>(({
  participants,
  selectedIds,
  onToggleSelection,
  maxSelections = 6,
  disabled = false,
  className,
}) => {
  const handleToggle = (participantId: string) => {
    const isSelected = selectedIds.includes(participantId);

    if (!isSelected && selectedIds.length >= maxSelections) {
      return; // Don't allow more selections
    }

    onToggleSelection(participantId);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-navy/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center shadow-lg">
            <span className="text-gold font-display font-black text-xs">X</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/60">
            Seleziona Passaggi Turno
          </p>
        </div>
        <div className={cn(
          'flex items-center px-4 py-2 rounded-xl transition-all duration-500 border',
          selectedIds.length === maxSelections
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-white text-navy/40 border-navy/5 shadow-sm'
        )}>
          <span className="text-xs font-display font-black tracking-widest tabular-nums">
            {selectedIds.length} <span className="opacity-30">/</span> {maxSelections}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-10 gap-x-4 justify-items-center py-4">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ParticipantBadge
              number={participant.competitionNumber}
              isSelected={selectedIds.includes(participant.id)}
              onClick={() => handleToggle(participant.id)}
              disabled={disabled}
              size="lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

SelectionGrid.displayName = 'SelectionGrid';
