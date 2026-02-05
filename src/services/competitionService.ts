import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { SkatingResult, ParameterResult } from '@/types/competition';

export type CompetitionInsert = Database['public']['Tables']['competitions']['Insert'];

export const competitionService = {
    async create(competition: CompetitionInsert) {
        const { data, error } = await supabase
            .from('competitions')
            .insert(competition)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getByEvent(eventId: string) {
        const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .eq('event_id', eventId);

        if (error) throw error;
        return data;
    },

    async updatePhase(id: string, phase: Database['public']['Enums']['competition_phase']) {
        const { error } = await supabase
            .from('competitions')
            .update({ current_phase: phase })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Calcola i risultati Skating via RPC (Rule 10/11)
     */
    async getSkatingResults(roundId: string) {
        const { data, error } = await supabase
            .rpc('calculate_skating_results', { p_round_id: roundId });

        if (error) throw error;
        return (data as unknown as SkatingResult[]) || [];
    },

    /**
     * Calcola i risultati a Parametri via RPC (Sistema B)
     */
    async getParameterResults(round_id: string) {
        const { data, error } = await supabase
            .rpc('calculate_parameter_results', { p_round_id: round_id });

        if (error) throw error;
        return (data as unknown as ParameterResult[]) || [];
    },

    /**
     * Chiusura definitiva e cristallizzazione (AX01, AX08)
     */
    async closeAndCrystallize(competitionId: string) {
        const { data, error } = await supabase
            .rpc('close_competition_and_crystallize', { p_competition_id: competitionId });

        if (error) throw error;
        return data;
    }
};
