import { useAuth } from '@/contexts/AuthContext';

export const useRole = () => {
    const { profile, loading } = useAuth();

    return {
        role: profile?.role || null,
        isAdmin: profile?.role === 'admin',
        isDirector: profile?.role === 'director',
        isJudge: profile?.role === 'judge',
        loading
    };
};
