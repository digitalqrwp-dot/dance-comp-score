import React, { useState, useEffect } from 'react';
import { ParticipantBadge } from './ParticipantBadge';
interface Participant {
  id: string;
  competitionNumber: number;
  name: string;
  surname: string;
  club: string;
}
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
    <div className={cn('space-y-10', className)}>
      {/* Position selector */}
      <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-3 ml-2">
          <div className="w-6 h-6 rounded-lg bg-navy flex items-center justify-center text-[10px] font-black text-gold shadow-lg">1</div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
            Seleziona Posizione
          </h3>
        </div>
        <div className="flex flex-wrap justify-center gap-3 bg-slate-50/50 p-6 rounded-[2rem] border border-navy/5 shadow-inner">
          {positions.map((position) => {
            const isUsed = usedPositions.includes(position);
            const isActive = selectedPosition === position;

            return (
              <button
                key={position}
                onClick={() => handlePositionClick(position)}
                disabled={disabled}
                className={cn(
                  'w-14 h-14 rounded-2xl font-display font-black text-xl transition-all duration-300 relative group',
                  'touch-target flex items-center justify-center',
                  isActive
                    ? 'bg-gold text-navy shadow-gold-glow scale-110 z-10 border-2 border-white/20'
                    : isUsed
                      ? 'bg-navy/10 text-navy/20 cursor-default'
                      : 'bg-white text-navy/40 hover:bg-white hover:text-navy hover:shadow-md border border-navy/5 shadow-sm',
                  disabled && 'opacity-30 cursor-not-allowed'
                )}
              >
                {position}°
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-navy rounded-full animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finalists grid */}
      <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 delay-100">
        <div className="flex items-center gap-3 ml-2">
          <div className="w-6 h-6 rounded-lg bg-navy flex items-center justify-center text-[10px] font-black text-gold shadow-lg">2</div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
            Assegna al Finalista
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-y-12 gap-x-4 justify-items-center py-6">
          {finalists.map((finalist, index) => {
            const position = getParticipantPosition(finalist.id);
            const isAssigned = position !== undefined;

            return (
              <div
                key={finalist.id}
                className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ParticipantBadge
                  number={finalist.competitionNumber}
                  position={position}
                  onClick={() => handleParticipantClick(finalist.id)}
                  disabled={disabled || (selectedPosition === null && !isAssigned)}
                  size="lg"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className={cn(
          'inline-flex items-center gap-3 px-8 py-4 rounded-3xl text-sm font-display font-black uppercase tracking-[0.2em] transition-all duration-500 border-2',
          isComplete
            ? 'bg-success text-white border-white/20 shadow-xl shadow-success/20 overflow-hidden relative group'
            : 'bg-slate-100/80 text-navy/20 border-navy/5'
        )}>
          {isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          )}
          {isComplete ? (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Classifica Pronta
            </>
          ) : (
            <>
              Posizioni: {assignedParticipants.length} <span className="opacity-30">/</span> {finalists.length}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
