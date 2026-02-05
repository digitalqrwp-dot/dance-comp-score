/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/README.md] PRIMA DI MODIFICARE ⚠️ */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database';
import { PHASE_LABELS } from '@/constants/competition';
import { cn } from '@/lib/utils';
import { Users, Play, Trophy, ChevronRight } from 'lucide-react';

type Competition = Database['public']['Tables']['competitions']['Row'] & {
  disciplines?: { scoring_type: string };
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  operating_cost?: number;
  estimated_revenue?: number;
};

interface CompetitionCardProps {
  competition: Competition;
  participantCount?: number;
  onSelect?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
}

const phaseConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  registration: { label: 'Iscrizioni', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Users className="w-3 h-3" /> },
  heats: { label: 'Eliminatorie', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Play className="w-3 h-3" /> },
  semifinal: { label: 'Semifinale', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: <Play className="w-3 h-3" /> },
  final: { label: 'Finale', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: <Trophy className="w-3 h-3" /> },
  completed: { label: 'Conclusa', color: 'bg-success/10 text-success border-success/20', icon: <Trophy className="w-3 h-3" /> },
};

export const CompetitionCard = React.memo<CompetitionCardProps>(({
  competition,
  participantCount = 0,
  onSelect,
  onAction,
  actionLabel,
  showAction = true,
}) => {
  const config = phaseConfig[competition.current_phase as string] || { label: competition.current_phase, color: 'bg-slate-100', icon: null };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-500 rounded-2xl border-navy/5 bg-white/80 backdrop-blur-sm',
        onSelect ? 'cursor-pointer hover:shadow-xl hover:shadow-navy/10 hover:-translate-y-1 hover:border-gold/30' : 'shadow-lg'
      )}
      onClick={onSelect}
    >
      <div className="absolute top-0 right-0 p-4">
        <Badge variant="outline" className={cn('gap-1.5 px-3 py-1 rounded-xl font-display font-black uppercase tracking-widest text-[9px] border shadow-sm transition-all duration-500 group-hover:scale-105', config.color)}>
          {config.icon}
          {config.label}
        </Badge>
      </div>

      <CardHeader className="p-6 pb-2">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy/40 group-hover:bg-gold group-hover:text-navy transition-all duration-500 rotate-3 group-hover:rotate-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-display font-black text-navy leading-tight tracking-tight group-hover:text-gold-dark transition-colors">
              {competition.name}
            </CardTitle>
            <div className="flex gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy/30">
                {competition.category}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <div className="flex items-center justify-between pt-6 border-t border-navy/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-navy/40 border border-navy/5">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold font-display">{participantCount}</span>
            </div>

            {competition.actual_start_date && (
              <div className="flex items-center gap-2 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                <Play className="w-3.5 h-3.5" />
                {new Date(competition.actual_start_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {showAction && onAction && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="h-10 px-4 rounded-xl gap-2 font-display font-black uppercase tracking-widest text-[9px] hover:bg-navy hover:text-white transition-all shadow-sm hover:shadow-md"
            >
              {actionLabel || 'Gestisci'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

CompetitionCard.displayName = 'CompetitionCard';
