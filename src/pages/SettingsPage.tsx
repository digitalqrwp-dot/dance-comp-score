import React from 'react';
import { useCompetition } from '@/contexts/CompetitionContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Info, Database, Wifi } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { currentEvent } = useCompetition();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <PageHeader 
        title="Impostazioni"
        description="Configurazione dell'applicazione"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-5 h-5" />
              Informazioni App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Versione</span>
              <Badge variant="secondary">1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Nome App</span>
              <span className="font-medium">DanceScore</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-5 h-5" />
              Stato Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Evento attivo</span>
              <Badge variant={currentEvent ? 'default' : 'outline'}>
                {currentEvent ? 'Sì' : 'No'}
              </Badge>
            </div>
            {currentEvent && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Competizioni</span>
                  <span className="font-medium">{currentEvent.competitions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Giudici</span>
                  <span className="font-medium">{currentEvent.judges.length}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="w-5 h-5" />
              Connessione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <div>
                <p className="font-medium">Modalità Locale</p>
                <p className="text-sm text-muted-foreground">
                  I dati sono salvati localmente. Per la sincronizzazione in tempo reale tra tablet, 
                  sarà necessario collegare un database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
