/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/contexts/README.md] PRIMA DI MODIFICARE ⚠️ */
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useEvent } from './EventContext';
import { useJudge } from './JudgeContext';
import { Database } from '@/types/database';
import { judgmentService } from '@/services/judgmentService';
import { Performance } from '@/types/competition';

import { Competition, PerformanceWithMembers, Athlete } from '@/types/competition';
export type Round = Database['public']['Tables']['competition_rounds']['Row'];

interface CompetitionContextType {
  activeCompetition: Competition | null;
  setActiveCompetition: (competitionId: string | null) => void;
  performances: PerformanceWithMembers[];
  activeRound: Round | null;
  disciplineParameters: { id: string, name: string }[];
  loading: boolean;
  submitSelection: (competitionId: string, selectedParticipantIds: string[]) => Promise<void>;
  submitFinalRanking: (competitionId: string, rankings: Record<string, number>) => Promise<void>;
  submitParameterScores: (competitionId: string, performanceId: string, scores: Record<string, number>) => Promise<void>;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) throw new Error('useCompetition must be used within a CompetitionProvider');
  return context;
};

export const CompetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentEvent, competitions } = useEvent();
  const { judgeSession } = useJudge();
  const [activeCompetitionId, setActiveCompetitionId] = useState<string | null>(null);
  const [performances, setPerformances] = useState<PerformanceWithMembers[]>([]);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [disciplineParameters, setDisciplineParameters] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const activeCompetition = useMemo(() =>
    competitions.find(c => c.id === activeCompetitionId) || null
    , [competitions, activeCompetitionId]);

  const setActiveCompetition = useCallback((id: string | null) => setActiveCompetitionId(id), []);

  // Caricamento dati della gara selezionata
  React.useEffect(() => {
    if (!activeCompetitionId) {
      setPerformances([]);
      setActiveRound(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Carica Performance
        const { data: perfs, error: perfErr } = await supabase
          .from('performances')
          .select(`
            *,
            performance_members (
              athletes (*)
            )
          `)
          .eq('competition_id', activeCompetitionId)
          .order('bib_number', { ascending: true });

        if (perfErr) throw perfErr;

        const mappedPerfs = perfs.map(p => {
          const perf = p as unknown as PerformanceWithMembers;
          return {
            ...perf,
            members: (perf.performance_members)?.map(pm => pm.athletes).filter((a): a is Athlete => !!a) || []
          };
        });

        setPerformances(mappedPerfs);

        // 2. Carica Round Attivo
        const { data: rounds, error: roundErr } = await supabase
          .from('competition_rounds')
          .select('*')
          .eq('competition_id', activeCompetitionId)
          .eq('status', 'open')
          .order('order_index', { ascending: false })
          .limit(1);

        if (roundErr) throw roundErr;

        if (rounds && rounds.length > 0) {
          setActiveRound(rounds[0]);
        } else {
          setActiveRound(null);
        }

        // 3. Carica Parametri se Sistema B
        if (activeCompetition?.disciplines?.scoring_type === 'parameters') {
          const { data: params, error: paramErr } = await supabase
            .from('discipline_parameters')
            .select(`
              parameter_id,
              scoring_parameters (id, name)
            `)
            .eq('discipline_id', activeCompetition.discipline_id || '');

          if (!paramErr && params) {
            setDisciplineParameters(params.map((p: any) => ({
              id: p.scoring_parameters.id,
              name: p.scoring_parameters.name
            })));
          }
        } else {
          setDisciplineParameters([]);
        }
      } catch (err) {
        console.error('[CompetitionContext] Errore caricamento dati:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeCompetitionId, activeCompetition?.disciplines?.scoring_type, activeCompetition?.discipline_id]); // Aggiunto scoring_type e discipline_id come DIP per ricaricare se cambia gara

  // 4. Sottoscrizione Real-time per Giudizi (per aggiornamento Ranking Live)
  React.useEffect(() => {
    if (!activeRound) return;

    const channelSkating = supabase
      .channel(`judgments-skating-${activeRound.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'judgments_skating',
          filter: `round_id=eq.${activeRound.id}`
        },
        () => {
          console.log('[Realtime] Cambio rilevato in judgments_skating');
          // Qui potremmo emettere un evento o ricaricare i calcoli rpc
        }
      )
      .subscribe();

    const channelParams = supabase
      .channel(`judgments-params-${activeRound.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'judgments_parameters',
          filter: `round_id=eq.${activeRound.id}`
        },
        () => {
          console.log('[Realtime] Cambio rilevato in judgments_parameters');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSkating);
      supabase.removeChannel(channelParams);
    };
  }, [activeRound]);

  const submitSelection = useCallback(async (compId: string, selectedIds: string[]) => {
    if (!judgeSession || !activeRound) return;

    try {
      await judgmentService.submitSelection({
        roundId: activeRound.id,
        judgeId: judgeSession.judgeId,
        judgeCode: judgeSession.accessCode,
        performanceIds: selectedIds,
        judgeName: judgeSession.judgeName,
        judgeSurname: judgeSession.judgeSurname
      });
      console.log('[Competition] Selezione inviata con successo');
    } catch (err) {
      console.error('[Competition] Errore invio selezione:', err);
    }
  }, [judgeSession, activeRound]);

  const submitFinalRanking = useCallback(async (compId: string, rankings: Record<string, number>) => {
    if (!judgeSession || !activeRound) return;

    try {
      await judgmentService.submitFinalRanking({
        roundId: activeRound.id,
        judgeId: judgeSession.judgeId,
        judgeCode: judgeSession.accessCode,
        rankings,
        judgeName: judgeSession.judgeName,
        judgeSurname: judgeSession.judgeSurname
      });
      console.log('[Competition] Ranking finale inviato con successo');
    } catch (err) {
      console.error('[Competition] Errore invio ranking:', err);
    }
  }, [judgeSession, activeRound]);

  const submitParameterScores = useCallback(async (compId: string, perfId: string, scores: Record<string, number>) => {
    if (!judgeSession || !activeRound) return;

    try {
      await judgmentService.submitParameterScores({
        roundId: activeRound.id,
        performanceId: perfId,
        judgeCode: judgeSession.accessCode,
        judgeName: judgeSession.judgeName,
        judgeSurname: judgeSession.judgeSurname,
        scores
      });
      console.log('[Competition] Voti parametri inviati con successo');
    } catch (err) {
      console.error('[Competition] Errore invio parametri:', err);
    }
  }, [judgeSession, activeRound]);

  return (
    <CompetitionContext.Provider value={{
      activeCompetition,
      setActiveCompetition,
      performances,
      activeRound,
      disciplineParameters,
      loading,
      submitSelection,
      submitFinalRanking,
      submitParameterScores,
    }}>
      {children}
    </CompetitionContext.Provider>
  );
};
