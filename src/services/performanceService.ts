/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/services/README.md] PRIMA DI MODIFICARE ⚠️ */
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

import { PerformanceWithMembers, Athlete } from '@/types/competition';

export type PerformanceInsert = Database['public']['Tables']['performances']['Insert'];

export const performanceService = {
    /**
     * Recupera tutte le performance di una competizione, includendo i membri (atleti)
     */
    async getByCompetition(competitionId: string) {
        const { data, error } = await supabase
            .from('performances')
            .select(`
        *,
        performance_members (
          athlete_id,
          athletes (*)
        )
      `)
            .eq('competition_id', competitionId);

        if (error) throw error;

        // Mapping per appiattire la struttura dei membri
        return data.map(p => {
            const perf = p as unknown as PerformanceWithMembers;
            return {
                ...perf,
                members: perf.performance_members?.map(pm => pm.athletes).filter((a): a is Athlete => !!a) || []
            };
        });
    },

    /**
     * Crea una nuova performance e associa gli atleti
     */
    async create(performance: PerformanceInsert, athleteIds: string[]) {
        const { data, error } = await supabase.rpc('create_performance_with_members', {
            p_competition_id: performance.competition_id!,
            p_name: performance.name,
            p_bib_number: performance.bib_number!,
            p_category: performance.category!,
            p_athlete_ids: athleteIds
        });

        if (error) throw error;

        // Recuperiamo la performance appena creata per completezza
        const { data: newPerf, error: fetchError } = await supabase
            .from('performances')
            .select('*')
            .eq('id', data)
            .single();

        if (fetchError) throw fetchError;
        return newPerf;
    },

    /**
     * Elimina una performance (e a cascata i suoi membri grazie alla FK onDelete Cascade)
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('performances')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
