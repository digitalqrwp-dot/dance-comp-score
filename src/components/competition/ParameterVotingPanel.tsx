/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/README.md] PRIMA DI MODIFICARE ⚠️ */
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Send, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Parameter {
    id: string;
    name: string;
}

interface Performance {
    id: string;
    bib_number: number;
    name: string;
}

interface ParameterVotingPanelProps {
    performances: Performance[];
    parameters: Parameter[];
    onSubmitScores: (performanceId: string, scores: Record<string, number>) => Promise<void>;
}

export const ParameterVotingPanel: React.FC<ParameterVotingPanelProps> = ({
    performances,
    parameters,
    onSubmitScores
}) => {
    const [activePerfIndex, setActivePerfIndex] = useState(0);
    const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [completed, setCompleted] = useState<Record<string, boolean>>({});

    const currentPerf = performances[activePerfIndex];

    const handleSetScore = (paramId: string, value: number) => {
        setScores(prev => ({
            ...prev,
            [currentPerf.id]: {
                ...(prev[currentPerf.id] || {}),
                [paramId]: value
            }
        }));
    };

    const handleSendScores = async () => {
        if (!currentPerf) return;
        const perfScores = scores[currentPerf.id];

        // Verifica se tutti i parametri hanno un voto
        if (!perfScores || Object.keys(perfScores).length < parameters.length) {
            alert("Assegna un voto a tutti i parametri prima di inviare.");
            return;
        }

        setSubmitting(currentPerf.id);
        try {
            await onSubmitScores(currentPerf.id, perfScores);
            setCompleted(prev => ({ ...prev, [currentPerf.id]: true }));

            // Passa alla prossima performance se presente
            if (activePerfIndex < performances.length - 1) {
                setTimeout(() => setActivePerfIndex(prev => prev + 1), 500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(null);
        }
    };

    if (!currentPerf) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Navigazione Performance */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
                {performances.map((p, idx) => (
                    <button
                        key={p.id}
                        className={cn(
                            "flex-shrink-0 min-w-[70px] h-14 flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-300 relative border-2",
                            activePerfIndex === idx
                                ? "bg-navy text-white border-white/20 shadow-xl scale-110 z-10"
                                : completed[p.id]
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-white text-navy/40 border-navy/5 shadow-sm hover:border-navy/20"
                        )}
                        onClick={() => setActivePerfIndex(idx)}
                    >
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">BIB</span>
                        <span className="text-lg font-display font-black leading-none">{p.bib_number}</span>
                        {completed[p.id] && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success text-white rounded-lg flex items-center justify-center animate-in zoom-in">
                                <Check className="w-2.5 h-2.5" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Scheda Voto Performance Corrente */}
            <Card className="border-navy/5 overflow-hidden rounded-[2.5rem] shadow-2xl bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-8 duration-700">
                <div className="bg-navy p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center shadow-xl rotate-3">
                            <span className="text-navy font-display font-black text-xl">#{currentPerf.bib_number}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-black text-white tracking-tight">{currentPerf.name}</h3>
                            <p className="text-[10px] font-bold text-gold/60 uppercase tracking-widest">Valutazione Atleta</p>
                        </div>
                    </div>
                    {completed[currentPerf.id] && (
                        <div className="bg-success text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-success/20">
                            <Check className="w-4 h-4" />
                            Votato
                        </div>
                    )}
                </div>
                <CardContent className="p-8 space-y-10">
                    {parameters.map((param, pIdx) => {
                        const currentScore = scores[currentPerf.id]?.[param.id] || 0;
                        return (
                            <div
                                key={param.id}
                                className="space-y-4 animate-in slide-in-from-left-4 duration-500"
                                style={{ animationDelay: `${pIdx * 100}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 ml-1">
                                        {param.name}
                                    </Label>
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center rounded-2xl text-2xl font-display font-black tabular-nums transition-all border-2",
                                        currentScore > 0
                                            ? "bg-gold text-navy border-white/20 shadow-lg scale-110"
                                            : "bg-slate-50 text-navy/10 border-navy/5"
                                    )}>
                                        {currentScore || '-'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                        <button
                                            key={val}
                                            className={cn(
                                                "h-12 rounded-xl text-lg font-display font-black transition-all duration-300 relative overflow-hidden group/btn",
                                                currentScore === val
                                                    ? "bg-navy text-white shadow-xl scale-105 border-white/20"
                                                    : "bg-white text-navy/40 border border-navy/5 shadow-sm hover:border-gold hover:text-navy hover:shadow-md"
                                            )}
                                            onClick={() => handleSetScore(param.id, val)}
                                        >
                                            <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                            <span className="relative z-10">{val}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div className="pt-6">
                        <Button
                            size="lg"
                            className={cn(
                                "w-full h-18 text-[12px] font-display font-black uppercase tracking-[0.3em] gap-3 rounded-[1.5rem] transition-all duration-500",
                                completed[currentPerf.id]
                                    ? "bg-slate-100 text-navy/30"
                                    : "bg-gold hover:bg-gold-dark text-white shadow-gold-glow hover:scale-[1.02] active:scale-95"
                            )}
                            disabled={submitting === currentPerf.id || (!completed[currentPerf.id] && Object.keys(scores[currentPerf.id] || {}).length < parameters.length)}
                            onClick={handleSendScores}
                        >
                            {submitting === currentPerf.id ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : completed[currentPerf.id] ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    Voto Inviato
                                </>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" />
                                    Conferma Valutazione
                                </>
                            )}
                        </Button>
                        <p className="text-center text-[9px] font-bold text-navy/20 uppercase tracking-widest mt-6">
                            Il voto verrà archiviato permanentemente con firma digitale
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", className)}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
        {children}
    </span>
);
