import React from 'react';
import { ParticipantBadge } from './ParticipantBadge';
import type { Participant } from '@/types/competition';
import { cn } from '@/lib/utils';

interface SelectionGridProps {
  participants: Participant[];
  selectedIds: string[];
  onToggleSelection: (participantId: string) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
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
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Seleziona i partecipanti per la finale
        </p>
        <span className={cn(
          'text-sm font-semibold px-3 py-1 rounded-full',
          selectedIds.length === maxSelections 
            ? 'bg-success/10 text-success' 
            : 'bg-muted text-muted-foreground'
        )}>
          {selectedIds.length} / {maxSelections}
        </span>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 justify-items-center">
        {participants.map((participant) => (
          <div key={participant.id} className="flex flex-col items-center gap-2">
            <ParticipantBadge
              number={participant.competitionNumber}
              isSelected={selectedIds.includes(participant.id)}
              onClick={() => handleToggle(participant.id)}
              disabled={disabled || (!selectedIds.includes(participant.id) && selectedIds.length >= maxSelections)}
              size="lg"
            />
            <span className="text-xs text-muted-foreground text-center truncate max-w-[80px]">
              {participant.name} {participant.surname.charAt(0)}.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
