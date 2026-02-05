import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-navy p-6 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                    <div className="max-w-lg w-full text-center space-y-8 relative z-10 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-gold/10 rounded-3xl flex items-center justify-center border border-gold/20 shadow-2xl shadow-gold/10 rotate-12 group hover:rotate-0 transition-transform duration-500">
                                <AlertTriangle className="w-12 h-12 text-gold animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-display font-black text-white tracking-tighter leading-none">
                                SISTEMA IN <span className="text-gold">STALLO</span>
                            </h1>
                            <p className="text-white/60 font-sans font-medium text-lg leading-relaxed max-w-sm mx-auto">
                                Si è verificato un errore inatteso nel modulo di rendering. La tua sessione è protetta nel Cloud.
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="bg-navy-dark/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-left max-h-40 overflow-auto scrollbar-hide group">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-2 opacity-50 group-hover:opacity-100 transition-opacity">Dettagli Tecnici</p>
                                <code className="text-[11px] font-mono text-white/40 break-all leading-tight">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}
                        <Button
                            onClick={this.handleReset}
                            className="w-full bg-gold hover:bg-gold-dark text-navy font-black py-7 rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 gap-3"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            RIAVVIA INTERFACCIA
                        </Button>
                        <p className="text-[9px] uppercase font-black tracking-[0.3em] text-white/20">
                            DanceScore Enterprise Recovery System
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
