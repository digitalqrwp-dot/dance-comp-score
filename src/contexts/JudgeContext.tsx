/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/contexts/README.md] PRIMA DI MODIFICARE ⚠️ */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { JudgeEventAccessJoin } from '@/types/competition';
import { useToast } from '@/hooks/use-toast';

interface JudgeSession {
    accessCode: string;
    eventId: string;
    eventName: string;
    judgeId: string;
    judgeName: string;
    judgeSurname: string;
}

interface JudgeContextType {
    judgeSession: JudgeSession | null;
    isValidating: boolean;
    loginAsJudge: (accessCode: string) => Promise<boolean>;
    logoutJudge: () => void;
}

const JudgeContext = createContext<JudgeContextType | undefined>(undefined);

export const useJudge = () => {
    const context = useContext(JudgeContext);
    if (!context) throw new Error('useJudge must be used within a JudgeProvider');
    return context;
};

export const JudgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [judgeSession, setJudgeSession] = useState<JudgeSession | null>(null);
    const [isValidating, setIsValidating] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const savedCode = localStorage.getItem('judge_access_code');
        if (savedCode) {
            validateAndLogin(savedCode).finally(() => setIsValidating(false));
        } else {
            setIsValidating(false);
        }
    }, []);

    const validateAndLogin = async (code: string) => {
        try {
            const cleanCode = code.trim().toUpperCase();

            const { data: raw, error } = await supabase
                .from('judge_event_access')
                .select(`
                  event_id,
                  judge_id,
                  events:event_id (name),
                  judges_registry:judge_id (first_name, last_name)
                `)
                .eq('access_code', cleanCode)
                .single();

            if (error || !raw) return false;

            const data = (raw as unknown as JudgeEventAccessJoin);

            const session: JudgeSession = {
                accessCode: cleanCode,
                eventId: data.event_id || '',
                eventName: data.events?.name || 'Evento Sconosciuto',
                judgeId: data.judge_id || '',
                judgeName: data.judges_registry?.first_name || 'Giudice',
                judgeSurname: data.judges_registry?.last_name || ''
            };

            setJudgeSession(session);
            localStorage.setItem('judge_access_code', cleanCode);
            return true;
        } catch (err) {
            console.error('Errore validazione giudice:', err);
            return false;
        }
    };

    const loginAsJudge = async (accessCode: string) => {
        const success = await validateAndLogin(accessCode);
        if (!success) {
            toast({
                title: "Codice non valido",
                description: "Il codice inserito è errato o scaduto.",
                variant: "destructive",
            });
        }
        return success;
    };

    const logoutJudge = useCallback(() => {
        setJudgeSession(null);
        localStorage.removeItem('judge_access_code');
    }, []);

    return (
        <JudgeContext.Provider value={{ judgeSession, isValidating, loginAsJudge, logoutJudge }}>
            {children}
        </JudgeContext.Provider>
    );
};
