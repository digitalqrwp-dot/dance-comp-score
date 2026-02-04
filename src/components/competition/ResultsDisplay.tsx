import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Competition, Participant } from '@/types/competition';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface ResultsDisplayProps {
  competition: Competition;
  className?: string;
}

const positionStyles: Record<number, { bg: string; icon: string; text: string }> = {
  1: { 
    bg: 'bg-gradient-to-br from-amber-400 to-amber-600', 
    icon: 'text-amber-950',
    text: 'text-amber-950'
  },
  2: { 
    bg: 'bg-gradient-to-br from-slate-300 to-slate-400', 
    icon: 'text-slate-700',
    text: 'text-slate-700'
  },
  3: { 
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600', 
    icon: 'text-orange-950',
    text: 'text-orange-950'
  },
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  competition,
  className,
}) => {
  const getParticipant = (id: string): Participant | undefined => {
    return competition.participants.find(p => p.id === id);
  };

  if (competition.results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nessun risultato disponibile
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-primary to-navy-light text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Classifica Finale
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {competition.results.map((result) => {
            const participant = getParticipant(result.participantId);
            if (!participant) return null;
            
            const style = positionStyles[result.position];
            const isTopThree = result.position <= 3;
            
            return (
              <div
                key={result.participantId}
                className={cn(
                  'flex items-center gap-4 p-4 transition-colors',
                  isTopThree && 'bg-muted/30'
                )}
              >
                {/* Position */}
                <div 
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0',
                    style?.bg || 'bg-muted',
                    style?.text || 'text-muted-foreground'
                  )}
                >
                  {result.position <= 3 ? (
                    <Medal className={cn('w-6 h-6', style?.icon)} />
                  ) : (
                    result.position
                  )}
                </div>
                
                {/* Participant info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {participant.competitionNumber}
                    </span>
                    <div>
                      <p className="font-medium truncate">
                        {participant.name} {participant.surname}
                      </p>
                      {participant.club && (
                        <p className="text-sm text-muted-foreground truncate">
                          {participant.club}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Score details */}
                <div className="text-right shrink-0">
                  <p className="text-2xl font-display font-bold text-primary">
                    {result.totalScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({result.individualScores.join(', ')})
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
