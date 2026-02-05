/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/services/README.md] PRIMA DI MODIFICARE ⚠️ */
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type JudgmentInsert = Database['public']['Tables']['judgments_skating']['Insert'];

export const judgmentService = {
    /**
     * Invia un voto per una batteria (Heats/Passaggi turno)
     */
    async submitSelection(params: {
        roundId: string;
        judgeId: string;
        judgeCode: string;
        performanceIds: string[];
        judgeName: string;
        judgeSurname: string;
    }) {
        const { roundId, judgeCode, performanceIds, judgeName, judgeSurname } = params;

        const { error } = await supabase.rpc('submit_batch_judgments_skating', {
            p_round_id: roundId,
            p_judge_code: judgeCode,
            p_judge_name: judgeName,
            p_judge_surname: judgeSurname,
            p_performance_ids: performanceIds
        });

        if (error) throw error;
        return true;
    },

    /**
     * Invia la classifica finale per una competizione (Finals/Skating Rule 1-9)
     */
    async submitFinalRanking(params: {
        roundId: string;
        judgeId: string;
        judgeCode: string;
        rankings: Record<string, number>;
        judgeName: string;
        judgeSurname: string;
    }) {
        const { roundId, judgeCode, rankings, judgeName, judgeSurname } = params;

        const formattedRankings = Object.entries(rankings).map(([perfId, rank]) => ({
            performance_id: perfId,
            rank: rank
        }));

        const { error } = await supabase.rpc('submit_batch_rankings_skating', {
            p_round_id: roundId,
            p_judge_code: judgeCode,
            p_judge_name: judgeName,
            p_judge_surname: judgeSurname,
            p_rankings: formattedRankings
        });

        if (error) throw error;
        return true;
    },

    /**
     * Invia i voti parametri per una specifica performance
     */
    async submitParameterScores(params: {
        roundId: string;
        performanceId: string;
        judgeCode: string;
        judgeName: string;
        judgeSurname: string;
        scores: Record<string, number>;
    }) {
        const { roundId, performanceId, judgeCode, judgeName, judgeSurname, scores } = params;

        const { error } = await supabase.rpc('submit_performance_parameter_scores', {
            p_round_id: roundId,
            p_performance_id: performanceId,
            p_judge_code: judgeCode,
            p_judge_name: judgeName,
            p_judge_surname: judgeSurname,
            p_scores: scores
        });

        if (error) throw error;
        return true;
    }
};
