import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type EventInsert = Database['public']['Tables']['events']['Insert'];

export const eventService = {
    async create(event: EventInsert) {
        const { data, error } = await supabase
            .from('events')
            .insert({
                ...event,
                director_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async getAllByDirector() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Termina l'evento e pulisce i codici di accesso temporanei dei giudici (AX09)
     */
    async terminateEvent(eventId: string) {
        // 1. Aggiorna lo stato dell'evento a 'finished'
        const { error: eventError } = await supabase
            .from('events')
            .update({ status: 'finished' })
            .eq('id', eventId);

        if (eventError) throw eventError;

        // 2. Elimina i codici di accesso temporanei dei giudici per questo evento
        const { error: accessError } = await supabase
            .from('judge_event_access')
            .delete()
            .eq('event_id', eventId);

        if (accessError) throw accessError;

        return true;
    }
};
