import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useJudge } from '@/contexts/JudgeContext';
import { useCompetition } from '@/contexts/CompetitionContext';
import { useEvent } from '@/contexts/EventContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { CompetitionCard, SelectionGrid, SkatingPanel, HeatIndicator, ParameterVotingPanel } from '@/components/competition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Gavel, LogIn, LogOut, Send, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const JudgePanel: React.FC = () => {
  const { judgeSession, loginAsJudge, logoutJudge, isValidating } = useJudge();
  const {
    activeCompetition,
    setActiveCompetition,
    submitSelection,
    submitFinalRanking,
    performances,
    activeRound,
    disciplineParameters,
    loading: competitionLoading,
    submitParameterScores
  } = useCompetition();
  const { competitions, loading: competitionsLoading } = useEvent();

  const [loginCode, setLoginCode] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!loginCode.trim()) return;
    setIsLoggingIn(true);
    const success = await loginAsJudge(loginCode);
    if (success) {
      setLoginCode('');
      setShowLoginDialog(false);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    logoutJudge();
    setActiveCompetition(null);
    setSelectedIds([]);
  };

  const handleToggleSelection = useCallback((participantId: string) => {
    setSelectedIds(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  }, []);

  const handleSubmitSelection = () => {
    if (!activeCompetition) return;
    submitSelection(activeCompetition.id, selectedIds);
    setSelectedIds([]);
  };

  const handleSubmitFinalRanking = useCallback((rankings: Record<string, number>) => {
    if (!activeCompetition) return;
    submitFinalRanking(activeCompetition.id, rankings);
  }, [activeCompetition, submitFinalRanking]);

  if (isValidating) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
          <Gavel className="absolute inset-0 m-auto w-6 h-6 text-navy animate-pulse" />
        </div>
        <p className="font-display font-black text-navy/40 uppercase tracking-[0.3em] text-[10px]">
          Verifica Identità Giudice
        </p>
      </div>
    );
  }

  if (!judgeSession) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in duration-700">
        <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center shadow-xl mb-6 relative group">
          <div className="absolute inset-0 bg-gold blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <Gavel className="w-8 h-8 text-gold relative z-10" />
        </div>
        <div className="text-center space-y-3 max-w-sm mb-10">
          <h1 className="text-2xl font-display font-black text-navy tracking-tight uppercase">Accesso Giudici</h1>
          <p className="text-sm text-navy/40 font-medium leading-relaxed">
            Inserisci il codice temporaneo fornito dal Direttore di Gara per accedere al terminale di voto.
          </p>
        </div>

        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 px-10 bg-navy hover:bg-navy-dark text-white rounded-2xl font-display font-black uppercase tracking-widest gap-4 shadow-xl shadow-navy/20 active:scale-95 transition-all">
              <LogIn className="w-5 h-5 text-gold" />
              Inizia Sessione
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl border-navy/5 p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-display font-black text-navy text-center uppercase tracking-tight">Codice Voto</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Input
                  id="judgeCode"
                  placeholder="ES. AB-1234"
                  className="h-14 text-center text-2xl font-display font-black tracking-[0.2rem] uppercase rounded-xl border-2 focus:border-gold focus:ring-gold/20 shadow-inner bg-slate-50"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  disabled={isLoggingIn}
                />
                <p className="text-[9px] text-center font-bold text-navy/30 uppercase tracking-widest">
                  Il codice è strettamente personale e monouso
                </p>
              </div>
              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-navy text-white rounded-xl font-display font-black uppercase tracking-widest text-base shadow-lg"
                disabled={isLoggingIn || loginCode.length < 4}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                ) : (
                  "Verifica & Accedi"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 md:pb-12 max-w-7xl mx-auto px-4 pt-6">
      {/* Header Judge */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white shadow-xl animate-in slide-in-from-top-8 duration-700">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
          <div className="w-12 h-12 rounded-xl bg-navy text-gold flex items-center justify-center shadow-lg rotate-3">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black bg-gold/20 text-gold px-2 py-0.5 rounded-lg uppercase tracking-widest">Pronto al Voto</span>
              <span className="text-[10px] font-black text-navy/20 uppercase tracking-widest">•</span>
              <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">{judgeSession.eventName}</span>
            </div>
            <h2 className="text-xl font-display font-black text-navy tracking-tight">{judgeSession.judgeName} {judgeSession.judgeSurname}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            className="h-10 rounded-xl border-navy/5 bg-white shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-display font-black uppercase tracking-widest text-[10px] px-6"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Chiudi Sessione
          </Button>
        </div>
      </div>

      {!activeCompetition ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-2">Sincronizzazione Real-time</p>
              <h3 className="text-3xl font-display font-black text-navy tracking-tighter uppercase">Competizioni Attive</h3>
            </div>
          </div>

          {competitionsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-50/50 rounded-2xl border border-dashed border-navy/10">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-navy/5 border-t-navy rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
                </div>
              </div>
              <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.2em] animate-pulse">Recupero tabelle di marcia...</p>
            </div>
          ) : competitions.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-navy/5 shadow-lg text-center flex flex-col items-center">
              <EmptyState
                icon={<div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4"><Gavel className="w-6 h-6 text-slate-200" /></div>}
                title="In attesa di gare"
                description="Le competizioni appariranno qui non appena verranno aperte dal Direttore."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {competitions.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <CompetitionCard
                    competition={comp}
                    onSelect={() => setActiveCompetition(comp.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-wrap items-center gap-4 bg-navy p-4 rounded-3xl shadow-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCompetition(null)}
              className="text-white hover:bg-white/10 hover:text-gold rounded-xl font-display font-black uppercase tracking-widest text-[9px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Tutte le gare
            </Button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-display font-black text-gold uppercase tracking-widest">{activeCompetition.name}</span>
              {activeRound && (
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  activeRound.round_type === 'eliminatory' ? "bg-orange-500/20 text-orange-400" : "bg-success/20 text-success"
                )}>
                  {activeRound.round_type === 'eliminatory' ? 'Eliminatorie' : 'Finale'}
                </span>
              )}
            </div>
          </div>

          {competitionLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <Loader2 className="w-10 h-10 animate-spin text-navy" />
              <p className="text-[10px] font-black text-navy/20 uppercase tracking-widest">Sincronizzazione atleti...</p>
            </div>
          ) : !activeRound ? (
            <div className="py-24 bg-white rounded-2xl border border-navy/5 shadow-xl flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                <Send className="w-8 h-8 text-navy/10 animate-bounce" />
              </div>
              <h3 className="text-xl font-display font-black text-navy uppercase mb-4 tracking-tight">Round non ancora aperto</h3>
              <p className="text-sm text-navy/40 max-w-sm leading-relaxed">
                Il Direttore di Gara ha selezionato la categoria, ma la sessione di voto per il round corrente non è ancora attiva.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {activeCompetition?.disciplines?.scoring_type === 'parameters' ? (
                <div className="max-w-4xl mx-auto">
                  <ParameterVotingPanel
                    performances={performances.map(p => ({
                      id: p.id,
                      bib_number: p.bib_number || 0,
                      name: p.name
                    }))}
                    parameters={disciplineParameters}
                    onSubmitScores={async (perfId, scores) => {
                      await submitParameterScores(activeCompetition.id, perfId, scores);
                    }}
                  />
                </div>
              ) : activeRound.round_type === 'eliminatory' ? (
                <Card className="border-navy/5 shadow-xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                  <div className="bg-navy p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-2">Modalità Eliminatorie</p>
                      <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase">Selezione Passaggi</h3>
                    </div>
                    <HeatIndicator currentHeat={activeRound.order_index + 1} totalHeats={1} />
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <SelectionGrid
                      participants={performances.map(p => ({
                        id: p.id,
                        competitionNumber: p.bib_number || 0,
                        name: p.name
                      }))}
                      selectedIds={selectedIds}
                      onToggleSelection={handleToggleSelection}
                      maxSelections={6}
                    />

                    <div className="mt-12 flex flex-col items-center gap-6">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full md:w-auto px-12 h-14 rounded-xl font-display font-black uppercase tracking-[0.2em] text-base transition-all duration-500",
                          selectedIds.length > 0
                            ? "bg-navy hover:bg-navy-dark text-white shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-95"
                            : "bg-slate-100 text-navy/20 border-navy/5"
                        )}
                        onClick={handleSubmitSelection}
                        disabled={selectedIds.length === 0}
                      >
                        <Send className="w-5 h-5 mr-3 text-gold" />
                        Invia Selezione
                      </Button>
                      <p className="text-[10px] font-bold text-navy/20 uppercase tracking-widest">
                        Confermando, i partecipanti selezionati verranno inviati al server
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-navy/5 shadow-xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                  <div className="bg-navy p-6 md:p-8 border-b border-white/5 text-center">
                    <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-2">Round Finale</p>
                    <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Classifica Skating</h1>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <SkatingPanel
                      finalists={performances.map(p => ({
                        id: p.id,
                        competitionNumber: p.bib_number || 0,
                        name: p.name,
                        surname: '',
                        club: p.members?.[0]?.club_name || ''
                      }))}
                      onSubmitRankings={handleSubmitFinalRanking}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JudgePanel;
