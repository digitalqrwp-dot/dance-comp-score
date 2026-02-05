import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Info, Database, Wifi, ShieldCheck, User } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { profile, signOut } = useAuth();

    return (
        <div className="space-y-12 pb-24 md:pb-12 max-w-5xl mx-auto px-4 pt-6 animate-in fade-in duration-1000">
            <div className="space-y-2 px-4">
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-1">System Intelligence</p>
                <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter leading-none">Impostazioni</h1>
                <p className="text-sm text-navy/40 font-medium font-display">Configurazione centro di controllo</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="rounded-[3rem] shadow-2xl border-navy/5 overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="bg-navy p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <User className="w-6 h-6 text-gold" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-4">Identity Engine</p>
                        <CardTitle className="text-2xl font-display font-black uppercase tracking-tight">Profilo Direttore</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-navy/5 group-hover:bg-white transition-colors">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-navy flex items-center justify-center text-gold font-display font-black text-3xl shadow-xl rotate-3 group-hover:rotate-0 transition-all">
                                {profile?.full_name?.[0]}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-2xl font-display font-black text-navy tracking-tight">{profile?.full_name}</p>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-navy/5 text-navy/40 text-[9px] px-2 py-0 border-none uppercase font-black">{profile?.role}</Badge>
                                    <span className="text-[10px] text-navy/20 font-bold uppercase tracking-[0.2em]">Verified Hub</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-navy/5 text-navy font-display font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                            onClick={() => signOut()}
                        >
                            Log Out dalla Regia
                        </Button>
                    </CardContent>
                </Card>

                <Card className="rounded-[3rem] shadow-2xl border-navy/5 overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] mb-4">Security Protocol</p>
                        <CardTitle className="text-xl font-display font-black text-navy uppercase flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-success" />
                            Integrità Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 pt-2">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <Info className="w-4 h-4 text-navy/40" />
                                    <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Build Version</span>
                                </div>
                                <Badge className="bg-navy text-white font-black text-[9px] rounded-lg">V1.0.2-ENT</Badge>
                            </div>

                            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <Database className="w-4 h-4 text-navy/40" />
                                    <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Database Node</span>
                                </div>
                                <span className="text-[10px] font-black text-navy uppercase">Supabase Cloud (EU)</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-4 h-4 rounded-full bg-success animate-ping absolute inset-0" />
                                    <div className="w-4 h-4 rounded-full bg-success relative shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-navy uppercase tracking-widest">Sincronizzazione Real-time</p>
                                    <p className="text-[10px] text-navy/40 font-medium">Latenza: 42ms (Ottimale)</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-navy/40 leading-relaxed font-medium">
                                Tutti i voti dei giudici sono validati tramite protocollo SSL e cristallizzati
                                automaticamente nei verbali di fine competizione.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 rounded-[3rem] shadow-2xl border-navy/5 bg-navy text-white overflow-hidden p-1">
                    <div className="bg-white/5 backdrop-blur-md rounded-[2.8rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/20">
                                <Wifi className="w-4 h-4 text-gold" />
                                <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Network Operational</span>
                            </div>
                            <h2 className="text-3xl font-display font-black uppercase tracking-tight">Enterprise Cloud Sync</h2>
                            <p className="text-sm text-white/40 font-medium leading-relaxed max-w-xl">
                                Il sistema DanceScore utilizza un'infrastruttura di database distribuita per garantire che nessuna votazione
                                venga persa, anche in caso di disconnessione temporanea del router locale. I dati vengono riallineati
                                automanticamente non appena la connessione viene ripristinata.
                            </p>
                        </div>
                        <div className="w-40 h-40 rounded-[3rem] bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <div className="w-24 h-24 rounded-full border-b-2 border-r-2 border-gold flex items-center justify-center animate-spin-slow">
                                <ShieldCheck className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
