import React from 'react';
import { useCompetition } from '@/contexts/CompetitionContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ResultsDisplay, CompetitionCard } from '@/components/competition';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const ResultsPage: React.FC = () => {
  const { currentEvent, activeCompetition, setActiveCompetition } = useCompetition();

  const completedCompetitions = currentEvent?.competitions.filter(c => c.currentPhase === 'completed') || [];

  if (!currentEvent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-muted-foreground" />}
          title="Nessun evento attivo"
          description="I risultati appariranno qui quando le competizioni saranno completate."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <PageHeader 
        title="Risultati"
        description={currentEvent.name}
      />

      {completedCompetitions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<Trophy className="w-8 h-8 text-muted-foreground" />}
              title="Nessun risultato disponibile"
              description="I risultati appariranno qui quando le competizioni saranno completate."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold">Competizioni Completate</h2>
            <div className="space-y-3">
              {completedCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onSelect={() => setActiveCompetition(competition.id)}
                  showAction={false}
                />
              ))}
            </div>
          </div>
          
          <div>
            {activeCompetition && activeCompetition.currentPhase === 'completed' ? (
              <ResultsDisplay competition={activeCompetition} />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    title="Seleziona una competizione"
                    description="Clicca su una competizione completata per vedere i risultati"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
