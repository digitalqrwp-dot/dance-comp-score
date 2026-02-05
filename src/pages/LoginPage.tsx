import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useJudge } from '@/contexts/JudgeContext';
import { Lock, User, KeyRound, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { loginAsJudge } = useJudge();

    const from = location.state?.from?.pathname || "/";

    const handleDirectorLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast({
                title: "Errore di accesso",
                description: "Credenziali non valide. Riprova.",
                variant: "destructive",
            });
        } else {
            navigate(from, { replace: true });
        }
        setLoading(false);
    };

    const handleJudgeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessCode.trim()) return;

        setLoading(true);
        const success = await loginAsJudge(accessCode);

        if (success) {
            navigate('/judge', { replace: true });
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-6">
            <Card className="w-full max-w-md shadow-2xl border-white/5 bg-white/80 backdrop-blur-sm rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-1000">
                <CardHeader className="space-y-2 text-center pt-10">
                    <div className="mx-auto w-16 h-16 bg-navy rounded-3xl flex items-center justify-center shadow-2xl rotate-3 mb-4 animate-in slide-in-from-top-4 duration-1000">
                        <Sparkles className="w-8 h-8 text-gold animate-pulse" />
                    </div>
                    <CardTitle className="text-4xl font-display font-black text-navy tracking-tighter">
                        DANCE<span className="text-gold">SCORE</span>
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                        Competition Management Cloud
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <Tabs defaultValue="director" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/80 p-1.5 rounded-2xl">
                            <TabsTrigger
                                value="director"
                                className="rounded-xl font-display font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-navy data-[state=active]:text-white transition-all duration-500"
                            >
                                Staff / Direttore
                            </TabsTrigger>
                            <TabsTrigger
                                value="judge"
                                className="rounded-xl font-display font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-navy data-[state=active]:text-white transition-all duration-500"
                            >
                                Giudice
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="director" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <form onSubmit={handleDirectorLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 ml-1">Email di Servizio</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/20 group-focus-within:text-gold transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="email@admin.it"
                                            className="h-12 pl-12 border-navy/5 bg-slate-50/50 focus:bg-white shadow-sm transition-all duration-300 rounded-2xl"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 ml-1">Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/20 group-focus-within:text-gold transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="h-12 pl-12 border-navy/5 bg-slate-50/50 focus:bg-white shadow-sm transition-all duration-300 rounded-2xl"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-navy hover:bg-navy-light text-white font-display font-black tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-navy/20 hover:scale-[1.01] active:scale-95 transition-all duration-300 mt-2"
                                    loading={loading}
                                >
                                    ACCEDI AL SISTEMA
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="judge" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <form onSubmit={handleJudgeLogin} className="space-y-6 text-center">
                                <div className="space-y-2 text-left">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 ml-1">Codice di Accesso Temporaneo</Label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/20 group-focus-within:text-gold transition-colors" />
                                        <Input
                                            id="accessCode"
                                            type="text"
                                            placeholder="ABCD12"
                                            className="h-16 pl-14 border-navy/5 bg-slate-50/50 focus:bg-white text-3xl font-mono font-black tracking-[0.4em] uppercase shadow-sm transition-all duration-300 rounded-2xl text-navy"
                                            value={accessCode}
                                            onChange={(e) => setAccessCode(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2 justify-center">
                                        <Sparkles className="w-3 h-3 text-gold" />
                                        Inserisci il codice fornito dal Direttore
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gold hover:bg-gold-dark text-white font-display font-black tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.01] active:scale-95 transition-all duration-300"
                                    loading={loading}
                                >
                                    ENTRA NEL PANEL GIUDICI
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-navy/5 py-6 bg-slate-50/50">
                    <p className="text-[9px] font-bold text-navy/20 uppercase tracking-[0.3em]">
                        &copy; 2024 DanceScore Cloud Edition
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
