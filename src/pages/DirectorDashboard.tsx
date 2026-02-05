/* ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/README.md] PRIMA DI MODIFICARE ⚠️ */
import React, { useState, useEffect, useCallback } from 'react';
import { useEvent } from '@/contexts/EventContext';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { CompetitionCard } from '@/components/competition/CompetitionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, CalendarDays, MapPin, Users, Trophy, Loader2, Settings, Play, Send, Trash2, Edit } from 'lucide-react';
import { CreateEventForm } from '@/components/competition/forms/CreateEventForm';
import { AddCompetitionForm } from '@/components/competition/forms/AddCompetitionForm';
import { AddJudgeForm } from '@/components/competition/forms/AddJudgeForm';
import { AddPerformanceForm } from '@/components/competition/forms/AddPerformanceForm';
import { Performance, PerformanceWithMembers } from '@/types/competition';
import { performanceService } from '@/services/performanceService';
import { competitionService } from '@/services/competitionService';
import { ResultsDisplay } from '@/components/competition/ResultsDisplay';
import { cn } from '@/lib/utils';

const DirectorDashboard: React.FC = () => {
  const { currentEvent, competitions, loading: eventLoading, terminateEvent } = useEvent();
  const [activeCompId, setActiveCompId] = useState<string | null>(null);
  const [performances, setPerformances] = useState<PerformanceWithMembers[]>([]);
  const [perfLoading, setPerfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCompDialog, setShowCompDialog] = useState(false);
  const [showJudgeDialog, setShowJudgeDialog] = useState(false);
  const [showPerfDialog, setShowPerfDialog] = useState(false);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const refreshPerformances = useCallback(() => {
    if (activeCompId) {
      setPerfLoading(true);
      performanceService.getByCompetition(activeCompId)
        .then(setPerformances)
        .catch(err => console.error('Errore fetch performance:', err))
        .finally(() => setPerfLoading(false));
    } else {
      setPerformances([]);
    }
  }, [activeCompId]);

  // Funzione per caricare i risultati live
  const loadLiveResults = useCallback(async () => {
    if (!activeCompId) return;
    const activeComp = competitions.find(c => c.id === activeCompId);
    if (!activeComp) return;

    try {
      const { data: rounds } = await supabase
        .from('competition_rounds')
        .select('id, round_type')
        .eq('competition_id', activeCompId)
        .eq('status', 'open')
        .limit(1);

      if (rounds && rounds.length > 0) {
        const res = activeComp.disciplines?.scoring_type === 'parameters'
          ? await competitionService.getParameterResults(rounds[0].id)
          : await competitionService.getSkatingResults(rounds[0].id);
        setLiveResults(res || []);
      } else {
        setLiveResults([]);
      }
    } catch (e) {
      console.error('Errore loadLiveResults:', e);
    }
  }, [activeCompId, competitions]);

  // Caricamento iniziale e sottoscrizione real-time per i risultati
  useEffect(() => {
    if (!activeCompId) {
      setLiveResults([]);
      setPerformances([]);
      return;
    }

    refreshPerformances();
    setResultsLoading(true);
    loadLiveResults().finally(() => setResultsLoading(false));

    // Sottoscrizione ai cambiamenti dei giudizi per aggiornare la dashboard live
    const channel = supabase
      .channel(`live-dashboard-${activeCompId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'judgments_skating' },
        () => loadLiveResults()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'judgments_parameters' },
        () => loadLiveResults()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'performances', filter: `competition_id=eq.${activeCompId}` },
        () => refreshPerformances()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCompId, refreshPerformances, loadLiveResults]);

  const activeCompetition = competitions.find(c => c.id === activeCompId);

  if (eventLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-navy/5 border-t-gold rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-navy/20 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.4em] ml-1">Caricamento Asset Digitali</p>
          <h2 className="text-xl font-display font-black text-navy uppercase tracking-tight">Sincronizzazione Cloud Engine</h2>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-in zoom-in duration-700">
        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 border border-navy/5 shadow-inner">
          <CalendarDays className="w-10 h-10 text-navy/20" />
        </div>
        <div className="text-center space-y-4 max-w-md mb-12">
          <h1 className="text-4xl font-display font-black text-navy tracking-tighter uppercase">Nessun Evento Attivo</h1>
          <p className="text-sm text-navy/40 font-medium leading-relaxed">
            Il tuo cloud è vuoto. Inizia creando il tuo primo evento competitivo per sbloccare la regia digitale.
          </p>
        </div>

        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-16 px-12 bg-navy hover:bg-navy-dark text-white rounded-3xl font-display font-black uppercase tracking-widest gap-4 shadow-2xl shadow-navy/20 active:scale-95 transition-all">
              <Plus className="w-6 h-6 text-gold" />
              Nuovo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl p-6 border-navy/5">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-display font-black text-navy uppercase tracking-tight">Configura Evento</DialogTitle>
            </DialogHeader>
            <CreateEventForm onSuccess={() => setShowEventDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 pt-4 animate-in fade-in duration-700">
      {/* Header Evento Premium */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-navy text-white shadow-xl border border-white/10 group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Live Event Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter uppercase leading-none">{currentEvent.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gold" />
                {currentEvent.start_date ? new Date(currentEvent.start_date).toLocaleDateString('it-IT') : 'Data da definire'}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                {currentEvent.location || 'Sede da definire'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Dialog open={showJudgeDialog} onOpenChange={setShowJudgeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-10 px-6 rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md transition-all font-display font-black uppercase tracking-widest text-[10px]">
                  <Users className="w-4 h-4 mr-2 text-gold" />
                  Gestisci Giudici
                </Button>
              </DialogTrigger>
              <AddJudgeForm onSuccess={() => setShowJudgeDialog(false)} />
            </Dialog>
            {currentEvent.status === 'active' && (
              <Button
                variant="destructive"
                className="h-10 px-6 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-100 border-red-500/20 font-display font-black uppercase tracking-widest text-[10px]"
                onClick={async () => {
                  if (confirm("Attenzione: Terminerai l'evento e tutti i codici giudice verranno ELIMINATI. Procedere?")) {
                    await terminateEvent(currentEvent.id);
                  }
                }}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Termina Evento
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Lista Gare */}
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-1">Palinsesto</p>
              <h2 className="text-2xl font-display font-black text-navy tracking-tight uppercase">Competizioni</h2>
            </div>
            <Dialog open={showCompDialog} onOpenChange={setShowCompDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-10 rounded-xl px-5 gap-2 border-navy/5 bg-white shadow-sm hover:border-gold hover:text-gold transition-all font-display font-black uppercase tracking-widest text-[9px]">
                  <Plus className="w-4 h-4" />
                  Nuova Gara
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-2xl p-6 border-navy/5">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-display font-black text-navy uppercase tracking-tight">Crea Competizione</DialogTitle>
                </DialogHeader>
                <AddCompetitionForm eventId={currentEvent.id} onSuccess={() => setShowCompDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {competitions.length === 0 ? (
            <div className="p-8 bg-slate-50/50 rounded-2xl border border-dashed border-navy/10 text-center">
              <EmptyState
                title="Ancora nessuna gara"
                description="Aggiungi la prima competizione per iniziare a popolare l'evento."
              />
            </div>
          ) : (
            <div className="grid gap-6">
              {competitions.map((comp, idx) => (
                <div
                  key={comp.id}
                  onClick={() => setActiveCompId(comp.id)}
                  className={cn(
                    "transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
                    activeCompId === comp.id ? "scale-[1.02]" : "hover:scale-[1.01]"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CompetitionCard
                    competition={comp}
                    participantCount={0}
                    onSelect={() => setActiveCompId(comp.id)}
                    onAction={() => {
                      setActiveCompId(comp.id);
                      setShowPerfDialog(true);
                    }}
                    actionLabel="Iscrivi Atleta"
                    showAction={comp.current_phase === 'registration'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dettaglio Performance Gare */}
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
          {/* Monitoraggio Live Risultati (Spostato qui per visibilità immediata) */}
          {activeCompId && liveResults.length > 0 && (
            <Card className="border-gold/30 bg-gold/5 shadow-xl rounded-2xl overflow-hidden animate-in zoom-in duration-500">
              <CardHeader className="p-6 border-b border-gold/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gold/60 uppercase tracking-[0.3em] mb-1">Live Intelligence</p>
                  <CardTitle className="text-xl font-display font-black uppercase tracking-tight text-navy flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gold animate-ping" />
                    Scoring Feed
                  </CardTitle>
                </div>
                <Badge className="bg-gold text-navy font-black text-[9px] px-3 py-1 rounded-lg border-none shadow-lg shadow-gold/20 uppercase tracking-widest">In Tempo Reale</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gold/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {liveResults.map((res: any, idx: number) => (
                    <div key={res.performance_id} className="p-6 flex items-center justify-between hover:bg-gold/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="font-display font-black text-navy/20 w-6 text-xl">{idx + 1}</span>
                        <div className="w-10 h-10 rounded-xl bg-navy text-gold flex items-center justify-center font-display font-black text-sm shadow-lg rotate-3 group-hover:rotate-0">
                          {res.bib_number}
                        </div>
                        <span className="font-display font-black text-navy text-sm uppercase tracking-tight truncate max-w-[200px]">{res.performance_name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-black text-2xl text-navy leading-none tabular-nums">
                          {activeCompetition?.disciplines?.scoring_type === 'parameters' ? Number(res.total_score).toFixed(2) : res.total_rank}
                        </p>
                        <p className="text-[9px] text-navy/30 font-bold uppercase tracking-[0.2em] mt-1">
                          {activeCompetition?.disciplines?.scoring_type === 'parameters' ? 'AVG POINTS' : 'RANK SUM'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] mb-1">Dettaglio Operativo</p>
              <h2 className="text-2xl font-display font-black text-navy tracking-tight uppercase leading-none">
                {activeCompetition ? activeCompetition.name : 'Iscritti'}
              </h2>
            </div>
            {activeCompId && (
              <Dialog open={showPerfDialog} onOpenChange={setShowPerfDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-10 rounded-xl px-5 bg-gold hover:bg-gold-dark text-white shadow-lg shadow-gold/20 font-display font-black uppercase tracking-widest text-[9px]">
                    <Plus className="w-4 h-4 mr-2" /> Nuova Iscrizione
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl rounded-2xl p-6 border-navy/5">
                  <DialogHeader className="mb-6 text-center">
                    <DialogTitle className="text-2xl font-display font-black text-navy uppercase tracking-tighter italic">Pannello Iscrizione Cloud</DialogTitle>
                  </DialogHeader>
                  <AddPerformanceForm
                    competitionId={activeCompId || ''}
                    category={activeCompetition?.category || 'solo'}
                    onSuccess={() => {
                      setShowPerfDialog(false);
                      refreshPerformances();
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!activeCompId ? (
            <div className="p-12 bg-white rounded-2xl border border-navy/5 shadow-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-navy/10 animate-pulse" />
              </div>
              <h3 className="text-xl font-display font-black text-navy uppercase mb-2">Sincronizza una Gara</h3>
              <p className="text-sm text-navy/30 max-w-xs font-medium">Seleziona una competizione dal palinsesto per gestire gli iscritti e monitorare i verbali.</p>
            </div>
          ) : (
            <Card className="shadow-xl border-navy/5 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b bg-slate-50/50 p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-navy/40 uppercase tracking-[0.3em]">
                    {perfLoading ? 'Retrieving Data...' : `${performances.length} Asset Iscritti`}
                  </span>
                </div>

                <div className="flex gap-4">
                  {activeCompetition?.current_phase === 'registration' && (
                    <Button
                      size="sm"
                      className="h-10 px-6 bg-navy text-white rounded-xl font-display font-black uppercase tracking-widest text-[9px] shadow-lg hover:shadow-navy/20 transition-all hover:scale-105"
                      onClick={() => competitionService.updatePhase(activeCompId!, 'heats').then(refreshPerformances)}
                    >
                      <Play className="w-4 h-4 mr-2 text-gold" /> Start Batteria
                    </Button>
                  )}
                  {activeCompetition?.current_phase !== 'completed' && activeCompetition?.current_phase !== 'registration' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-10 px-6 rounded-xl font-display font-black uppercase tracking-widest text-[9px] shadow-xl shadow-red-500/10 hover:scale-105 transition-all"
                      onClick={async () => {
                        if (confirm("Sei sicuro di voler chiudere la gara? I risultati verranno cristallizzati e i codici giudice disattivati.")) {
                          await competitionService.closeAndCrystallize(activeCompId!);
                          refreshPerformances();
                        }
                      }}
                    >
                      <Trophy className="w-4 h-4 mr-2" /> Cristallizza Finali
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {perfLoading ? (
                  <div className="py-32 flex flex-col items-center gap-6">
                    <Loader2 className="w-12 h-12 animate-spin text-navy/10" />
                    <p className="text-[10px] font-black text-navy/20 uppercase tracking-widest">Connecting to performance node...</p>
                  </div>
                ) : performances.length === 0 ? (
                  <div className="py-24 text-center px-12">
                    <p className="text-navy/40 font-display font-black text-xl uppercase tracking-tighter mb-4">Nessun iscritto</p>
                    <p className="text-xs text-navy/20 font-bold uppercase tracking-widest">Il database per questa gara è attualmente vuoto.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-navy/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {performances.map((perf, pIdx) => (
                      <div
                        key={perf.id}
                        className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group animate-in fade-in"
                        style={{ animationDelay: `${pIdx * 50}ms` }}
                      >
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-2xl bg-navy/5 flex flex-col items-center justify-center text-navy border-2 border-transparent transition-all group-hover:bg-navy group-hover:text-white group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl">
                            <span className="text-[10px] uppercase font-black opacity-30 leading-none mb-1">BIB</span>
                            <span className="text-2xl font-display font-black leading-none">{perf.bib_number || '?'}</span>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-display font-black text-2xl text-navy tracking-tighter group-hover:text-gold-dark transition-colors" title={perf.name}>{perf.name}</h4>
                            <div className="flex gap-3">
                              <Badge className="bg-navy/5 text-navy/60 border-navy/10 hover:bg-navy/10 text-[9px] py-0.5 px-3 rounded-lg uppercase font-black tracking-widest transition-all">
                                {perf.category}
                              </Badge>
                              <div className="flex items-center gap-2 text-[9px] font-black text-navy/20 uppercase tracking-widest">
                                <Users className="w-4 h-4" /> {perf.members?.length || 0} Atleti
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-navy hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl shadow-navy/5">
                              <Settings className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-navy/5 shadow-2xl p-2 bg-white/80 backdrop-blur-xl">
                            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-navy py-3" onClick={() => alert("Modifica non ancora implementata")}>
                              <Edit className="w-4 h-4 text-gold" /> Modifica Iscrizione
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl gap-3 font-bold text-red-500 py-3 hover:bg-red-50 transition-colors"
                              onClick={async () => {
                                if (confirm(`Rimuovere definitivamente "${perf.name}"?`)) {
                                  await performanceService.delete(perf.id);
                                  refreshPerformances();
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" /> Elimina Iscrizione
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showPerfDialog} onOpenChange={setShowPerfDialog}>
        {activeCompId && (
          <AddPerformanceForm
            competitionId={activeCompId}
            category={competitions.find(c => c.id === activeCompId)?.category || 'solo'}
            onSuccess={() => {
              setShowPerfDialog(false);
              refreshPerformances();
            }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default DirectorDashboard;
