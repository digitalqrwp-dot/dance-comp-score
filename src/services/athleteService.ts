/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/services/README.md] PRIMA DI MODIFICARE ⚠️ */
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { validateItalianTaxId } from '@/lib/validation';

export type Athlete = Database['public']['Tables']['athletes']['Row'];
export type AthleteInsert = Database['public']['Tables']['athletes']['Insert'];

export const athleteService = {
    /**
     * Cerca atleti per nome, cognome o codice fiscale (AX02)
     */
    async search(query: string) {
        if (!query || query.length < 2) return [];

        const cleanQuery = query.trim();

        // Sfruttiamo il fatto che spesso si cerca per "Inizio Cognome" o "Inizio CF"
        // Il Nome rimane con %query% per flessibilità, ma Cognome e CF scalano meglio con prefisso
        const { data, error } = await supabase
            .from('athletes')
            .select('*')
            .or(`first_name.ilike.%${cleanQuery}%,last_name.ilike.${cleanQuery}%,tax_id.ilike.${cleanQuery}%`)
            .limit(10);

        if (error) throw error;
        return data as Athlete[];
    },

    /**
     * Crea un nuovo atleta con validazione CF obbligatoria (AX08)
     */
    async create(athlete: AthleteInsert) {
        // 1. Validazione Formale Codice Fiscale
        if (!validateItalianTaxId(athlete.tax_id)) {
            throw new Error('Codice Fiscale non valido o malformato.');
        }

        // 2. Normalizzazione CF (Upper Case)
        const normalizedTaxId = athlete.tax_id.toUpperCase().trim();

        // 3. Controllo Duplicati Rigoroso (per prevenire race conditions)
        const { data: existing } = await supabase
            .from('athletes')
            .select('id')
            .eq('tax_id', normalizedTaxId)
            .maybeSingle();

        if (existing) {
            return existing; // Se esiste già, restituiamo l'id esistente invece di dare errore (silently safe)
        }

        const { data, error } = await supabase
            .from('athletes')
            .insert({
                ...athlete,
                tax_id: normalizedTaxId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Recupera gli atleti associati a una specifica performance (AX05)
     */
    async getByPerformance(performanceId: string) {
        const { data, error } = await supabase
            .from('performance_members')
            .select('athletes(*)')
            .eq('performance_id', performanceId);

        if (error) throw error;
        return (data as unknown as { athletes: Athlete | null }[]).map(item => item.athletes).filter((a): a is Athlete => !!a);
    }
};
