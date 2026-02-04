import React, { useState, useCallback } from 'react';
import { useCompetition } from '@/contexts/CompetitionContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { CompetitionCard, SelectionGrid, SkatingPanel, HeatIndicator } from '@/components/competition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Gavel, LogIn, LogOut, Send, ChevronLeft } from 'lucide-react';

const JudgePanel: React.FC = () => {
  const { 
    currentEvent, 
    currentJudge, 
    setCurrentJudge,
    activeCompetition,
    setActiveCompetition,
    submitSelection,
    submitFinalRanking,
    getParticipantsByIds
  } = useCompetition();

  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLogin = () => {
    if (!currentEvent) return;
    
    const judge = currentEvent.judges.find(j => j.code === loginCode);
    if (judge) {
      setCurrentJudge(judge.id);
      setLoginCode('');
      setLoginError('');
      setShowLoginDialog(false);
    } else {
      setLoginError('Codice non valido');
    }
  };

  const handleLogout = () => {
    setCurrentJudge(null);
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

  // Get current heat participants
  const currentHeatParticipants = activeCompetition?.currentPhase === 'heats' && activeCompetition.heats[activeCompetition.currentHeatIndex]
    ? getParticipantsByIds(activeCompetition, activeCompetition.heats[activeCompetition.currentHeatIndex].participants)
    : [];

  // Get finalists
  const finalists = activeCompetition?.currentPhase === 'final'
    ? getParticipantsByIds(activeCompetition, activeCompetition.finalists)
    : [];

  // Not logged in
  if (!currentJudge) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Gavel className="w-8 h-8 text-muted-foreground" />}
          title="Accesso Giudici"
          description="Inserisci il tuo codice di accesso per iniziare a giudicare."
          action={
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <LogIn className="w-5 h-5" />
                  Accedi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accesso Giudice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="judgeCode">Codice Accesso</Label>
                    <Input
                      id="judgeCode"
                      placeholder="Inserisci il codice..."
                      value={loginCode}
                      onChange={(e) => {
                        setLoginCode(e.target.value);
                        setLoginError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    {loginError && (
                      <p className="text-sm text-destructive">{loginError}</p>
                    )}
                  </div>
                  <Button onClick={handleLogin} className="w-full">
                    Accedi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
      </div>
    );
  }

  // No event
  if (!currentEvent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Gavel className="w-8 h-8 text-muted-foreground" />}
          title="Nessun evento attivo"
          description="L'organizzatore deve prima creare un evento."
        />
      </div>
    );
  }

  // Judge logged in - show competition selection or judging panel
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Judge header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-semibold">{currentJudge.name}</p>
            <p className="text-sm text-muted-foreground">Giudice</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
          <LogOut className="w-4 h-4" />
          Esci
        </Button>
      </div>

      {/* Competition selection */}
      {!activeCompetition ? (
        <div className="space-y-4">
          <PageHeader 
            title="Seleziona Competizione"
            description="Scegli la gara da giudicare"
          />
          
          {currentEvent.competitions.filter(c => c.currentPhase !== 'registration' && c.currentPhase !== 'completed').length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  title="Nessuna gara attiva"
                  description="Le competizioni appariranno qui quando inizieranno"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {currentEvent.competitions
                .filter(c => c.currentPhase !== 'registration' && c.currentPhase !== 'completed')
                .map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    onSelect={() => setActiveCompetition(competition.id)}
                    showAction={false}
                  />
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Active judging panel */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setActiveCompetition(null);
                setSelectedIds([]);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-display font-semibold text-lg">{activeCompetition.name}</h2>
              <Badge variant="secondary">
                {activeCompetition.currentPhase === 'heats' && 'Batterie'}
                {activeCompetition.currentPhase === 'semifinal' && 'Semifinale'}
                {activeCompetition.currentPhase === 'final' && 'Finale'}
              </Badge>
            </div>
          </div>

          {/* Heat selection */}
          {activeCompetition.currentPhase === 'heats' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selezione Batteria</CardTitle>
                  <HeatIndicator 
                    currentHeat={activeCompetition.currentHeatIndex}
                    totalHeats={activeCompetition.heats.length}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <SelectionGrid
                  participants={currentHeatParticipants}
                  selectedIds={selectedIds}
                  onToggleSelection={handleToggleSelection}
                  maxSelections={6}
                />
                
                <div className="flex justify-center pt-4 border-t">
                  <Button 
                    size="lg" 
                    onClick={handleSubmitSelection}
                    disabled={selectedIds.length !== 6}
                    className="gap-2 min-w-[200px]"
                  >
                    <Send className="w-5 h-5" />
                    Invia Selezione
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final ranking */}
          {activeCompetition.currentPhase === 'final' && (
            <Card>
              <CardHeader>
                <CardTitle>Sistema Skating - Finale</CardTitle>
              </CardHeader>
              <CardContent>
                <SkatingPanel
                  finalists={finalists}
                  onSubmitRankings={handleSubmitFinalRanking}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default JudgePanel;
