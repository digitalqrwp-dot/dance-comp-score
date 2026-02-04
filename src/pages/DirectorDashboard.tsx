import React, { useState } from 'react';
import { useCompetition } from '@/contexts/CompetitionContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { CompetitionCard } from '@/components/competition/CompetitionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, CalendarDays, MapPin, Users, Trophy, Trash2 } from 'lucide-react';
import { AGE_CATEGORIES, COMPETITION_CLASSES, DANCE_STYLES, DANCES } from '@/constants/competition';
import type { AgeCategory, CompetitionClass, DanceStyle, Dance } from '@/types/competition';

const DirectorDashboard: React.FC = () => {
  const { 
    currentEvent, 
    createEvent, 
    createCompetition, 
    setActiveCompetition,
    addParticipant,
    removeParticipant,
    startHeats,
    addJudge,
    activeCompetition
  } = useCompetition();

  // Event creation
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Competition creation
  const [compName, setCompName] = useState('');
  const [compAge, setCompAge] = useState<AgeCategory>('under_10');
  const [compClass, setCompClass] = useState<CompetitionClass>('C');
  const [compStyle, setCompStyle] = useState<DanceStyle>('latin');
  const [compDances, setCompDances] = useState<Dance[]>([]);
  const [showCompDialog, setShowCompDialog] = useState(false);

  // Participant addition
  const [partName, setPartName] = useState('');
  const [partSurname, setPartSurname] = useState('');
  const [partClub, setPartClub] = useState('');
  const [showPartDialog, setShowPartDialog] = useState(false);

  // Judge addition
  const [judgeName, setJudgeName] = useState('');
  const [judgeCode, setJudgeCode] = useState('');
  const [showJudgeDialog, setShowJudgeDialog] = useState(false);

  const handleCreateEvent = () => {
    if (eventName.trim()) {
      createEvent(eventName, new Date(), eventLocation);
      setEventName('');
      setEventLocation('');
      setShowEventDialog(false);
    }
  };

  const handleCreateCompetition = () => {
    if (compName.trim() && compDances.length > 0) {
      createCompetition(compName, compAge, compClass, compStyle, compDances);
      setCompName('');
      setCompDances([]);
      setShowCompDialog(false);
    }
  };

  const handleAddParticipant = () => {
    if (activeCompetition && partName.trim() && partSurname.trim()) {
      addParticipant(activeCompetition.id, partName, partSurname, partClub || undefined);
      setPartName('');
      setPartSurname('');
      setPartClub('');
      setShowPartDialog(false);
    }
  };

  const handleAddJudge = () => {
    if (judgeName.trim() && judgeCode.trim()) {
      addJudge(judgeName, judgeCode);
      setJudgeName('');
      setJudgeCode('');
      setShowJudgeDialog(false);
    }
  };

  const handleToggleDance = (dance: Dance) => {
    setCompDances(prev => 
      prev.includes(dance) 
        ? prev.filter(d => d !== dance)
        : [...prev, dance]
    );
  };

  const availableDances = Object.entries(DANCES)
    .filter(([_, info]) => info.style === compStyle)
    .map(([key]) => key as Dance);

  // No event yet
  if (!currentEvent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<CalendarDays className="w-8 h-8 text-muted-foreground" />}
          title="Nessun evento attivo"
          description="Crea un nuovo evento per iniziare a gestire le competizioni di danza."
          action={
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Crea Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuovo Evento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Nome Evento</Label>
                    <Input
                      id="eventName"
                      placeholder="es. Campionato Regionale 2024"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Località</Label>
                    <Input
                      id="eventLocation"
                      placeholder="es. Palazzetto dello Sport, Milano"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateEvent} className="w-full">
                    Crea Evento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Event header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-primary to-navy-light text-primary-foreground">
        <div>
          <h1 className="text-2xl font-display font-bold">{currentEvent.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-primary-foreground/80 text-sm">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              {currentEvent.date.toLocaleDateString('it-IT')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {currentEvent.location}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showJudgeDialog} onOpenChange={setShowJudgeDialog}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1">
                <Users className="w-4 h-4" />
                Giudici ({currentEvent.judges.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gestione Giudici</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {currentEvent.judges.length > 0 && (
                  <div className="space-y-2">
                    {currentEvent.judges.map(judge => (
                      <div key={judge.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <span className="font-medium">{judge.name}</span>
                        <Badge variant="outline">Codice: {judge.code}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">Aggiungi Giudice</h4>
                  <Input
                    placeholder="Nome giudice"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                  />
                  <Input
                    placeholder="Codice accesso"
                    value={judgeCode}
                    onChange={(e) => setJudgeCode(e.target.value)}
                  />
                  <Button onClick={handleAddJudge} className="w-full">
                    Aggiungi
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Competitions list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold">Competizioni</h2>
            <Dialog open={showCompDialog} onOpenChange={setShowCompDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Nuova
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuova Competizione</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      placeholder="es. Solo Latin Style"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={compAge} onValueChange={(v) => setCompAge(v as AgeCategory)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AGE_CATEGORIES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Classe</Label>
                      <Select value={compClass} onValueChange={(v) => setCompClass(v as CompetitionClass)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COMPETITION_CLASSES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Stile</Label>
                    <Select value={compStyle} onValueChange={(v) => {
                      setCompStyle(v as DanceStyle);
                      setCompDances([]);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DANCE_STYLES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Balli (combinata)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableDances.map((dance) => (
                        <div key={dance} className="flex items-center space-x-2">
                          <Checkbox
                            id={dance}
                            checked={compDances.includes(dance)}
                            onCheckedChange={() => handleToggleDance(dance)}
                          />
                          <Label htmlFor={dance} className="text-sm font-normal cursor-pointer">
                            {DANCES[dance].name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateCompetition} 
                    className="w-full"
                    disabled={!compName.trim() || compDances.length === 0}
                  >
                    Crea Competizione
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {currentEvent.competitions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  icon={<Trophy className="w-6 h-6 text-muted-foreground" />}
                  title="Nessuna competizione"
                  description="Aggiungi la prima competizione per iniziare"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {currentEvent.competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onSelect={() => setActiveCompetition(competition.id)}
                  onAction={() => {
                    if (competition.currentPhase === 'registration' && competition.participants.length >= 2) {
                      startHeats(competition.id);
                    }
                  }}
                  actionLabel={competition.currentPhase === 'registration' ? 'Avvia Batterie' : 'Gestisci'}
                  showAction={competition.currentPhase === 'registration' && competition.participants.length >= 2}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected competition details */}
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold">
            {activeCompetition ? 'Partecipanti' : 'Dettagli Competizione'}
          </h2>
          
          {!activeCompetition ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  icon={<Users className="w-6 h-6 text-muted-foreground" />}
                  title="Seleziona una competizione"
                  description="Clicca su una competizione per vedere e gestire i partecipanti"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {activeCompetition.name}
                  </CardTitle>
                  {activeCompetition.currentPhase === 'registration' && (
                    <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Plus className="w-4 h-4" />
                          Aggiungi
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nuovo Partecipante</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Nome</Label>
                              <Input
                                placeholder="Mario"
                                value={partName}
                                onChange={(e) => setPartName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Cognome</Label>
                              <Input
                                placeholder="Rossi"
                                value={partSurname}
                                onChange={(e) => setPartSurname(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Club (opzionale)</Label>
                            <Input
                              placeholder="ASD Dance Academy"
                              value={partClub}
                              onChange={(e) => setPartClub(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleAddParticipant} className="w-full">
                            Aggiungi Partecipante
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {activeCompetition.participants.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Nessun partecipante registrato
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeCompetition.participants.map((participant) => (
                      <div 
                        key={participant.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display font-bold">
                            {participant.competitionNumber}
                          </span>
                          <div>
                            <p className="font-medium">
                              {participant.name} {participant.surname}
                            </p>
                            {participant.club && (
                              <p className="text-xs text-muted-foreground">
                                {participant.club}
                              </p>
                            )}
                          </div>
                        </div>
                        {activeCompetition.currentPhase === 'registration' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParticipant(activeCompetition.id, participant.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
