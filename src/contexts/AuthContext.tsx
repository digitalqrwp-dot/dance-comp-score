import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export type UserRole = Database['public']['Enums']['user_role'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    // Ref per evitare ricaricamenti inutili dello stesso profilo
    const lastProfileId = React.useRef<string | null>(null);
    const profileLoadingRef = React.useRef<boolean>(false);

    const fetchProfile = async (userId: string) => {
        // Evitiamo fetch ridondanti per lo stesso utente se già in corso o completato
        if (lastProfileId.current === userId && (profile || profileLoadingRef.current)) return;

        try {
            profileLoadingRef.current = true;
            console.log('[Auth] Caricamento profilo per:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.message?.includes('abort')) {
                    console.log('[Auth] Fetch profilo abortito');
                    return;
                }
                console.error('[Auth] Errore fetchProfile:', error);
                setProfile(null);
            } else {
                console.log('[Auth] Profilo caricato:', data?.role);
                setProfile(data);
                lastProfileId.current = userId;
            }
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message?.includes('abort')) {
                console.log('[Auth] Eccezione fetchProfile abortita');
            } else {
                console.error('[Auth] Eccezione fetchProfile:', err);
                setProfile(null);
            }
        } finally {
            profileLoadingRef.current = false;
        }
    };

    useEffect(() => {
        let isMounted = true;
        let authInitialized = false;

        console.log('[Auth] Inizializzazione AuthProvider...');

        // Gestore unico per l'aggiornamento dello stato dell'utente e del profilo
        const handleStateChange = async (event: string, session: any) => {
            if (!isMounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
                lastProfileId.current = null;
            }

            // Segnaliamo che l'autenticazione è pronta solo dopo il primo evento o sessione
            if (!authInitialized) {
                authInitialized = true;
                setLoading(false);
                console.log('[Auth] Autenticazione Pronta');
            }
        };

        // 1. Recupero sessione iniziale (Reidratazione)
        const initAuth = async () => {
            try {
                // Tentativo immediato di prendere la sessione locale (veloce)
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth] Errore getSession:', error);
                }

                if (isMounted && !authInitialized) {
                    await handleStateChange('INITIAL_SESSION', session);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('[Auth] Errore getSession iniziale:', err);
                }
            } finally {
                // Assicuriamoci di sbloccare l'app in ogni caso dopo un breve check
                if (isMounted && !authInitialized) {
                    authInitialized = true;
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Timeout di sicurezza ridotto (10s) - se Supabase è morto, sblocchiamo comunque
        const fallbackTimer = setTimeout(() => {
            if (isMounted && !authInitialized) {
                console.warn('[Auth] Fallback caricamento scattato (10s)');
                authInitialized = true;
                setLoading(false);
            }
        }, 10000);

        // 2. Sottoscrizione ai cambiamenti futuri
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth] Evento Supabase: ${event}`);
            // Evitiamo di processare INITIAL_SESSION se initAuth ha già finito con lo stesso utente
            if (event === 'INITIAL_SESSION' && authInitialized) return;
            handleStateChange(event, session);
        });

        return () => {
            isMounted = false;
            clearTimeout(fallbackTimer);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {/* Renderizziamo sempre il container del context, ma mostriamo i figli solo a caricamento finito */}
            {/* Se loading è true, mostriamo uno spinner o nulla, MA MAI bloccare l'intero albero se non necessario */}
            {!loading ? children : (
                <div className="h-screen w-screen flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground font-display animate-pulse">Sincronizzazione in corso...</p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
