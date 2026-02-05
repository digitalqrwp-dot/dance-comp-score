/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/pages/README.md] PRIMA DI MODIFICARE ⚠️ */
import React from 'react';
import { useEvent } from '@/contexts/EventContext';
import { useCompetition } from '@/contexts/CompetitionContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ResultsDisplay, CompetitionCard } from '@/components/competition';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Printer } from 'lucide-react';
import { competitionService } from '@/services/competitionService';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { RoundWithCompetitionJoin, SkatingResult, ParameterResult } from '@/types/competition';

const ResultsPage: React.FC = () => {
  const { currentEvent, competitions } = useEvent();
  const { activeCompetition, setActiveCompetition } = useCompetition();
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Caricamento asincrono risultati
  useResultsLoader(activeCompetition?.id, setResults, setLoading);

  const completedCompetitions = competitions?.filter(c => c.current_phase === 'completed') || [];

  if (!currentEvent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-muted-foreground" />}
          title="Nessun evento attivo"
          description="I risultati appariranno qui quando le competizioni saranno completate."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 pt-4 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-1">Archive & Compliance</p>
          <h1 className="text-3xl font-display font-black text-navy uppercase tracking-tighter leading-none">Verbali & Risultati</h1>
          <p className="text-xs text-navy/40 font-medium font-display">{currentEvent.name}</p>
        </div>
        <Button
          size="lg"
          className="h-12 px-8 rounded-xl bg-navy hover:bg-navy-dark text-white font-display font-black uppercase tracking-widest text-[10px] shadow-xl shadow-navy/20 gap-3 active:scale-95 transition-all"
          onClick={() => window.print()}
          disabled={completedCompetitions.length === 0}
        >
          <Printer className="w-4 h-4 text-gold" />
          Esporta PDF Ufficiale
        </Button>
      </div>

      {completedCompetitions.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-2 bg-slate-50/50">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-xl font-display font-black text-navy uppercase mb-2">Archivio Vuoto</h3>
            <p className="text-sm text-navy/30 max-w-xs mx-auto font-medium leading-relaxed">
              I risultati verranno cristallizzati e archiviati qui non appena le competizioni saranno concluse dal Direttore.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
            <div className="px-4">
              <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] mb-1">Select Competition</p>
              <h2 className="text-2xl font-display font-black text-navy uppercase tracking-tight">Competizioni Concluse</h2>
            </div>
            <div className="grid gap-6">
              {completedCompetitions.map((competition, idx) => (
                <div
                  key={competition.id}
                  className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CompetitionCard
                    competition={competition}
                    onSelect={() => setActiveCompetition(competition.id)}
                    showAction={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in slide-in-from-right-8 duration-700">
            {activeCompetition && activeCompetition.current_phase === 'completed' ? (
              loading ? (
                <Card className="rounded-2xl shadow-xl border-navy/5 overflow-hidden">
                  <CardContent className="py-24 flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-navy/5 border-t-gold rounded-full animate-spin" />
                      <Trophy className="absolute inset-0 m-auto w-5 h-5 text-navy/10 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.4em]">Decryption Service</p>
                      <h4 className="text-sm font-display font-black text-navy uppercase tracking-widest">Recupero Dati Cristallizzati...</h4>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ResultsDisplay
                  results={results}
                  scoringType={(activeCompetition.disciplines?.scoring_type as 'parameters' | 'skating') || 'skating'}
                />
              )
            ) : (
              <div className="p-12 bg-white rounded-2xl border border-navy/5 shadow-xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                  <Printer className="w-8 h-8 text-navy/10 animate-pulse" />
                </div>
                <h3 className="text-xl font-display font-black text-navy uppercase mb-2">Visualizzazione Verbale</h3>
                <p className="text-sm text-navy/30 max-w-xs font-medium">Seleziona una competizione conclusa per generare il verbale ufficiale e visualizzare la classifica finale.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook per caricamento dati
const useResultsLoader = (compId: string | undefined, setResults: (data: any[]) => void, setLoading: (l: boolean) => void) => {
  React.useEffect(() => {
    if (!compId) return;

    const loadResults = async () => {
      setLoading(true);
      try {
        // 1. Cerchiamo se ci sono risultati cristallizzati
        const { data: crystallized } = await supabase
          .from('crystallized_competition_results')
          .select('results_json')
          .eq('competition_id', compId)
          .maybeSingle();

        if (crystallized) {
          const results = crystallized.results_json as unknown as (SkatingResult[] | ParameterResult[]);
          setResults(results || []);
        } else {
          // 2. Se non cristallizzati, proviamo a calcolarli dall'ultimo round
          const { data: rounds } = await supabase
            .from('competition_rounds')
            .select('id, competition_id, competitions(disciplines(scoring_type))')
            .eq('competition_id', compId)
            .order('order_index', { ascending: false })
            .limit(1);

          if (rounds && rounds.length > 0) {
            const roundData = rounds[0] as unknown as RoundWithCompetitionJoin;
            const scoringType = roundData.competitions?.disciplines?.scoring_type;
            const res = scoringType === 'parameters'
              ? await competitionService.getParameterResults(roundData.id)
              : await competitionService.getSkatingResults(roundData.id);
            setResults(res);
          }
        }
      } catch (e) {
        console.error('Errore caricamento risultati:', e);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [compId]);
};

export default ResultsPage;
