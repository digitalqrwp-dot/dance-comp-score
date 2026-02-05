import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-4">
                <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-navy/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground font-display font-black uppercase tracking-[0.2em] animate-pulse">
                    Accesso Protetto...
                </p>
            </div>
        );
    }

    if (!user) {
        // Reindirizza al login se non autenticato
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Reindirizza a una pagina di unauthorized o alla home se il ruolo non è permesso
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
