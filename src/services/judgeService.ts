import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export const judgeService = {
    /**
     * Recupera tutti i giudici assegnati a un evento con i loro codici di accesso
     */
    async getEventJudges(eventId: string) {
        const { data, error } = await supabase
            .from('judge_event_access')
            .select(`
        *,
        judges_registry (
          id,
          first_name,
          last_name
        )
      `)
            .eq('event_id', eventId);

        if (error) throw error;
        return data;
    },

    /**
     * Cerca giudici nell'anagrafica globale
     */
    async searchRegistry(query: string) {
        const { data, error } = await supabase
            .from('judges_registry')
            .select('*')
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
            .limit(10);

        if (error) throw error;
        return data;
    },

    /**
     * Crea un nuovo giudice nell'anagrafica e lo assegna all'evento
     */
    async createAndAssign(eventId: string, firstName: string, lastName: string, accessCode: string) {
        // 1. Crea in registry
        const { data: judge, error: regError } = await supabase
            .from('judges_registry')
            .insert({ first_name: firstName, last_name: lastName })
            .select()
            .single();

        if (regError) throw regError;

        // 2. Assegna all'evento
        const { error: accError } = await supabase
            .from('judge_event_access')
            .insert({
                event_id: eventId,
                judge_id: judge.id,
                access_code: accessCode.toUpperCase(),
                is_active: true
            });

        if (accError) throw accError;
        return judge;
    },

    /**
     * Assegna un giudice esistente all'evento
     */
    async assignExisting(eventId: string, judgeId: string, accessCode: string) {
        const { error } = await supabase
            .from('judge_event_access')
            .insert({
                event_id: eventId,
                judge_id: judgeId,
                access_code: accessCode.toUpperCase(),
                is_active: true
            });

        if (error) throw error;
    },

    /**
     * Rimuove un giudice dall'evento
     */
    async remove(accessId: string) {
        const { error } = await supabase
            .from('judge_event_access')
            .delete()
            .eq('id', accessId);

        if (error) throw error;
    }
};
