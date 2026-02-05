import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Gavel, Trophy, Settings, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJudge } from '@/contexts/JudgeContext';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { judgeSession } = useJudge();

  const isDirector = profile?.role === 'director' || profile?.role === 'admin';
  const isJudge = !!judgeSession;

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: isDirector
    },
    {
      path: '/judge',
      label: 'Giudice',
      icon: Gavel,
      visible: isJudge || isDirector
    },
    {
      path: '/results',
      label: 'Risultati',
      icon: Trophy,
      visible: true
    },
    {
      path: '/settings',
      label: 'Impostazioni',
      icon: Settings,
      visible: isDirector
    },
  ].filter(item => item.visible);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300">
        <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold via-gold/90 to-gold-dark flex items-center justify-center shadow-xl shadow-gold/20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 border border-white/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-black text-navy leading-none tracking-tighter">
                Dance<span className="text-gold">Score</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/60">
                  Enterprise Cloud
                </p>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group',
                      isActive
                        ? 'bg-navy text-white shadow-xl shadow-navy/20'
                        : 'text-muted-foreground hover:text-navy hover:bg-white/50'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-gold" : "group-hover:text-gold transition-colors")} />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                    )}
                  </Link>
                );
              })}
            </div>

            <UserSection />
          </nav>

          <div className="md:hidden flex items-center">
            <UserSection />
          </div>
        </div>
      </header>

      <main className="container py-8 min-h-[calc(100vh-8rem)] px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
        {children || <Outlet />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 z-50 rounded-t-3xl shadow-2xl shadow-navy/20 border-white/5">
        <div className="flex justify-around items-center h-20 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1.5 px-4 py-2 transition-all duration-300 relative',
                  isActive
                    ? 'text-navy scale-110'
                    : 'text-muted-foreground/60 hover:text-navy'
                )}
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive ? "bg-gold text-white shadow-lg shadow-gold/30" : "bg-transparent"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold animate-ping" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const UserSection = () => {
  const { user, profile, signOut } = useAuth();
  const { judgeSession, logoutJudge } = useJudge();

  if (user) {
    return (
      <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-4 group">
        <div className="hidden lg:block text-right transition-all duration-300 group-hover:pr-1">
          <p className="text-xs font-bold leading-tight tracking-tight">{profile?.full_name}</p>
          <p className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">{profile?.role}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-destructive h-9 w-9 p-0 rounded-full hover:bg-destructive/10 transition-all duration-300"
          title="Esci"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (judgeSession) {
    return (
      <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-4 group">
        <div className="hidden lg:block text-right transition-all duration-300 group-hover:pr-1">
          <p className="text-xs font-bold leading-tight tracking-tight">{judgeSession.judgeName}</p>
          <p className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">Giudice</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutJudge()}
          className="text-muted-foreground hover:text-destructive h-9 w-9 p-0 rounded-full hover:bg-destructive/10 transition-all duration-300"
          title="Esci"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Link to="/login" className="ml-4">
      <Button size="sm" className="h-9 gap-2 bg-gold hover:bg-gold-dark text-navy font-bold shadow-gold-glow px-5 rounded-full border-none trasition-all duration-300 hover:scale-105">
        <LogIn className="w-4 h-4" />
        Accedi
      </Button>
    </Link>
  );
};
