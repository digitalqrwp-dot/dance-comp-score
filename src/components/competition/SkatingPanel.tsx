import React, { useState, useEffect } from 'react';
import { ParticipantBadge } from './ParticipantBadge';
import type { Participant } from '@/types/competition';
import { cn } from '@/lib/utils';
import { MAX_RANKING_POSITION } from '@/constants/competition';

interface SkatingPanelProps {
  finalists: Participant[];
  onSubmitRankings: (rankings: Record<string, number>) => void;
  disabled?: boolean;
  className?: string;
}

export const SkatingPanel: React.FC<SkatingPanelProps> = ({
  finalists,
  onSubmitRankings,
  disabled = false,
  className,
}) => {
  const [rankings, setRankings] = useState<Record<string, number>>({});
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const positions = Array.from({ length: MAX_RANKING_POSITION }, (_, i) => i + 1);
  
  const usedPositions = Object.values(rankings);
  const assignedParticipants = Object.keys(rankings);

  const handleParticipantClick = (participantId: string) => {
    if (disabled) return;

    if (selectedPosition !== null) {
      // Assign position to participant
      const newRankings = { ...rankings };
      
      // Remove this position from any other participant
      Object.entries(newRankings).forEach(([pId, pos]) => {
        if (pos === selectedPosition) {
          delete newRankings[pId];
        }
      });
      
      // Remove previous position from this participant
      delete newRankings[participantId];
      
      // Assign new position
      newRankings[participantId] = selectedPosition;
      
      setRankings(newRankings);
      setSelectedPosition(null);
    }
  };

  const handlePositionClick = (position: number) => {
    if (disabled) return;
    setSelectedPosition(selectedPosition === position ? null : position);
  };

  const isComplete = assignedParticipants.length === finalists.length;

  useEffect(() => {
    if (isComplete && !disabled) {
      onSubmitRankings(rankings);
    }
  }, [isComplete, rankings, onSubmitRankings, disabled]);

  const getParticipantPosition = (participantId: string) => rankings[participantId];

  return (
    <div className={cn('space-y-8', className)}>
      {/* Position selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          1. Seleziona una posizione
        </h3>
        <div className="flex justify-center gap-3">
          {positions.map((position) => {
            const isUsed = usedPositions.includes(position);
            const isActive = selectedPosition === position;
            
            return (
              <button
                key={position}
                onClick={() => handlePositionClick(position)}
                disabled={disabled}
                className={cn(
                  'w-14 h-14 rounded-xl font-display font-bold text-xl transition-all',
                  'touch-target flex items-center justify-center',
                  isActive && 'bg-accent text-accent-foreground ring-4 ring-accent/30 scale-110',
                  isUsed && !isActive && 'bg-success/20 text-success',
                  !isUsed && !isActive && 'bg-muted text-muted-foreground hover:bg-muted/80',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {position}°
              </button>
            );
          })}
        </div>
      </div>

      {/* Finalists grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          2. Assegna ai finalisti
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 justify-items-center">
          {finalists.map((finalist) => {
            const position = getParticipantPosition(finalist.id);
            const isAssigned = position !== undefined;
            
            return (
              <div key={finalist.id} className="flex flex-col items-center gap-2">
                <ParticipantBadge
                  number={finalist.competitionNumber}
                  position={position}
                  onClick={() => handleParticipantClick(finalist.id)}
                  disabled={disabled || (selectedPosition === null && !isAssigned)}
                  size="lg"
                />
                <span className="text-xs text-muted-foreground text-center truncate max-w-[80px]">
                  {finalist.name} {finalist.surname.charAt(0)}.
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <span className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
          isComplete ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        )}>
          {isComplete ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Classifica completata
            </>
          ) : (
            <>
              Posizioni assegnate: {assignedParticipants.length} / {finalists.length}
            </>
          )}
        </span>
      </div>
    </div>
  );
};
