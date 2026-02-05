/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/contexts/README.md] PRIMA DI MODIFICARE ⚠️ */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useJudge } from './JudgeContext';
import { Database } from '@/types/database';
import { eventService } from '@/services/eventService';

import { Competition } from '@/types/competition';

export type Event = Database['public']['Tables']['events']['Row'];

interface EventContextType {
    currentEvent: Event | null;
    competitions: Competition[];
    loading: boolean;
    judges: any[];
    refreshEvent: () => Promise<void>;
    terminateEvent: (eventId: string) => Promise<void>;
    addJudge: (firstName: string, lastName: string, code: string) => Promise<void>;
    removeJudge: (accessId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) throw new Error('useEvent must be used within an EventProvider');
    return context;
};

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, profile } = useAuth();
    const { judgeSession } = useJudge();
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchEventData = useCallback(async () => {
        // Usciamo se non c'è né un utente auth né una sessione giudice
        const hasAuth = !!user;
        const hasJudge = !!judgeSession;

        if (!hasAuth && !hasJudge) {
            setCurrentEvent(null);
            setCompetitions([]);
            return;
        }

        setLoading(true);
        try {
            // Caso 1: Direttore / Admin (via Auth)
            if (profile?.role === 'director' || profile?.role === 'admin') {
                const { data: event, error: eventErr } = await supabase
                    .from('events')
                    .select('*')
                    .eq('director_id', user!.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (event && !eventErr) {
                    setCurrentEvent(event);
                    const { data: comps } = await supabase
                        .from('competitions')
                        .select('*, disciplines(scoring_type)')
                        .eq('event_id', event.id);
                    setCompetitions(comps || []);
                } else {
                    setCurrentEvent(null);
                    setCompetitions([]);
                }
            }
            // Caso 2: Giudice (via JudgeSession)
            else if (hasJudge) {
                const { data: event } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', judgeSession.eventId)
                    .single();

                if (event) {
                    setCurrentEvent(event);
                    const { data: comps } = await supabase
                        .from('competitions')
                        .select('*, disciplines(scoring_type)')
                        .eq('event_id', event.id);
                    setCompetitions(comps || []);

                    // Carica Giudici
                    const { data: jds } = await supabase
                        .from('judge_event_access')
                        .select('*, judges_registry(*)')
                        .eq('event_id', event.id);
                    setJudges(jds || []);
                }
            }
        } catch (err) {
            console.error('Errore fetchEventData:', err);
        } finally {
            setLoading(false);
        }
    }, [user, profile, judgeSession]);

    useEffect(() => {
        fetchEventData();
    }, [fetchEventData]);

    // Sottoscrizione Real-time per Competizioni (fondamentale per i Giudici)
    useEffect(() => {
        if (!currentEvent) return;

        const channel = supabase
            .channel('competitions-status')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'competitions',
                    filter: `event_id=eq.${currentEvent.id}`
                },
                () => {
                    console.log('[Realtime] Aggiornamento competizioni ricevuto');
                    fetchEventData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentEvent, fetchEventData]);

    return (
        <EventContext.Provider value={{
            currentEvent,
            competitions,
            judges,
            loading,
            refreshEvent: fetchEventData,
            terminateEvent: async (id: string) => {
                const { eventService } = await import('@/services/eventService');
                await eventService.terminateEvent(id);
                await fetchEventData();
            },
            addJudge: async (firstName, lastName, code) => {
                if (!currentEvent) return;
                const { judgeService } = await import('@/services/judgeService');
                await judgeService.createAndAssign(currentEvent.id, firstName, lastName, code);
                await fetchEventData();
            },
            removeJudge: async (accessId) => {
                const { judgeService } = await import('@/services/judgeService');
                await judgeService.remove(accessId);
                await fetchEventData();
            }
        }}>
            {children}
        </EventContext.Provider>
    );
};
