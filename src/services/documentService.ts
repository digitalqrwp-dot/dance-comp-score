import { supabase } from '@/lib/supabase';

export const documentService = {
    /**
     * Recupera i documenti di un atleta
     */
    async getAthleteDocuments(athleteId: string) {
        const { data, error } = await supabase
            .from('athlete_documents')
            .select('*')
            .eq('athlete_id', athleteId);

        if (error) throw error;
        return data;
    },

    /**
     * Carica un nuovo documento
     */
    async upload(athleteId: string, file: File, docType: string) {
        // 1. Upload su Storage
        const fileName = `${athleteId}/${Date.now()}_${file.name}`;
        const { data: storageData, error: storageError } = await supabase.storage
            .from('athlete-docs')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Crea record nel DB
        const { data, error } = await supabase
            .from('athlete_documents')
            .insert({
                athlete_id: athleteId,
                bucket_path: storageData.path,
                doc_type: docType
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Genera una URL pubblica/firmata per il documento
     */
    async getUrl(path: string) {
        const { data, error } = await supabase.storage
            .from('athlete-docs')
            .createSignedUrl(path, 3600); // 1 ora

        if (error) throw error;
        return data.signedUrl;
    },

    /**
     * Elimina un documento
     */
    async delete(id: string, path: string) {
        // 1. Elimina da Storage
        await supabase.storage.from('athlete-docs').remove([path]);

        // 2. Elimina da DB
        const { error } = await supabase
            .from('athlete_documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
