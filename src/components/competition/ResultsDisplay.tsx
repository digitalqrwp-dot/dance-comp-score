/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/README.md] PRIMA DI MODIFICARE ⚠️ */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface ResultsDisplayProps {
  results: any[];
  scoringType: 'skating' | 'parameters';
  className?: string;
}

const positionStyles: Record<number, { bg: string; icon: string; text: string; shadow: string }> = {
  1: {
    bg: 'bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37]',
    icon: 'text-navy',
    text: 'text-navy',
    shadow: 'shadow-[0_0_20px_rgba(253,185,49,0.3)]'
  },
  2: {
    bg: 'bg-gradient-to-br from-[#E6E8FA] via-[#C0C0C0] to-[#A9A9A9]',
    icon: 'text-navy',
    text: 'text-navy',
    shadow: 'shadow-[0_0_20px_rgba(192,192,192,0.2)]'
  },
  3: {
    bg: 'bg-gradient-to-br from-[#CD7F32] via-[#B87333] to-[#8B4513]',
    icon: 'text-white',
    text: 'text-white',
    shadow: 'shadow-[0_0_20px_rgba(184,115,51,0.2)]'
  },
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  scoringType,
  className,
}) => {
  if (!results || results.length === 0) {
    return (
      <Card className={cn("border-dashed border-2 bg-slate-50/50 rounded-2xl", className)}>
        <CardContent className="py-12 text-center">
          <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">In attesa di risultati ufficiali</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden shadow-xl border-navy/5 rounded-2xl bg-white/80 backdrop-blur-sm animate-in fade-in duration-700', className)}>
      <CardHeader className="bg-navy p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Classifica Ufficiale</p>
            <CardTitle className="flex items-center gap-3 text-xl font-display font-black text-white uppercase tracking-tighter">
              <Trophy className="w-5 h-5 text-gold" />
              {scoringType === 'parameters' ? 'Valutazione B' : 'Sistema Skating'}
            </CardTitle>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Real-time Feed</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-navy/5">
          {results.map((result, idx) => {
            const position = result.final_position || (idx + 1);
            const style = positionStyles[position];
            const isTopThree = position <= 3;

            return (
              <div
                key={result.performance_id}
                className={cn(
                  'flex items-center gap-6 p-4 md:p-6 transition-all duration-500 hover:bg-slate-50/50 group animate-in slide-in-from-left-4',
                  isTopThree && 'relative z-10'
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Position Badge */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg shrink-0 transition-all duration-500 border-2',
                    style?.bg || 'bg-white text-navy/20 border-navy/5',
                    style?.shadow || 'shadow-sm',
                    isTopThree ? 'rotate-3 group-hover:rotate-0 scale-110 shadow-lg' : 'group-hover:text-navy group-hover:border-navy/20'
                  )}
                >
                  {position <= 3 ? (
                    <div className="relative">
                      <Medal className={cn('w-7 h-7', style?.icon)} />
                      {position === 1 && <div className="absolute -top-4 -right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-bounce shadow-lg"><Trophy className="w-3 h-3 text-gold" /></div>}
                    </div>
                  ) : (
                    position
                  )}
                </div>

                {/* Participant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center font-display font-black text-[9px] text-navy/40 border border-navy/5 transition-colors group-hover:bg-navy group-hover:text-white">
                      #{result.bib_number}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-base text-navy tracking-tight truncate group-hover:text-gold-dark transition-colors uppercase">
                        {result.performance_name}
                      </h4>
                      <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mt-0.5">
                        {scoringType === 'parameters' ? 'Parameter Analytics' : 'Skating Scrutiny'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="text-right shrink-0">
                  <div className="relative inline-block">
                    <p className={cn(
                      "text-2xl font-display font-black leading-none tabular-nums tracking-tighter",
                      isTopThree ? "text-navy" : "text-navy/60"
                    )}>
                      {scoringType === 'parameters'
                        ? Number(result.total_score).toFixed(2)
                        : result.total_rank}
                    </p>
                    {isTopThree && (
                      <div className="absolute -inset-1 bg-gold/10 blur-xl rounded-full -z-10 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[9px] font-black text-navy/20 uppercase tracking-[0.3em] mt-2 italic">
                    {scoringType === 'parameters' ? 'POINTS' : 'RANK SUM'}
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
