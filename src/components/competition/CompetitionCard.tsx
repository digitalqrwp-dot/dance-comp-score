import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Competition } from '@/types/competition';
import { AGE_CATEGORIES, COMPETITION_CLASSES, DANCE_STYLES, DANCES, PHASE_LABELS } from '@/constants/competition';
import { cn } from '@/lib/utils';
import { Users, Play, Trophy, ChevronRight } from 'lucide-react';

interface CompetitionCardProps {
  competition: Competition;
  onSelect?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
}

const phaseColors: Record<string, string> = {
  registration: 'bg-info/10 text-info border-info/30',
  heats: 'bg-warning/10 text-warning border-warning/30',
  semifinal: 'bg-warning/10 text-warning border-warning/30',
  final: 'bg-accent/10 text-accent-foreground border-accent/30',
  completed: 'bg-success/10 text-success border-success/30',
};

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onSelect,
  onAction,
  actionLabel,
  showAction = true,
}) => {
  const danceNames = competition.dances.map(d => DANCES[d].name).join(', ');

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-medium',
        onSelect && 'cursor-pointer hover:ring-2 hover:ring-primary/20'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-display leading-tight">
              {competition.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {AGE_CATEGORIES[competition.ageCategory]} • {COMPETITION_CLASSES[competition.competitionClass]}
            </p>
          </div>
          <Badge variant="outline" className={cn('shrink-0', phaseColors[competition.currentPhase])}>
            {PHASE_LABELS[competition.currentPhase]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="font-normal">
              {DANCE_STYLES[competition.style]}
            </Badge>
            <span className="text-muted-foreground">{danceNames}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{competition.participants.length} partecipanti</span>
            </div>
            
            {showAction && onAction && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                className="gap-1"
              >
                {competition.currentPhase === 'registration' && <Play className="w-4 h-4" />}
                {competition.currentPhase === 'completed' && <Trophy className="w-4 h-4" />}
                {actionLabel || 'Apri'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
