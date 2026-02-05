import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Participant } from '@/types/competition';

interface ParticipantListItemProps {
    participant: Participant;
    showActions?: boolean;
    onRemove?: () => void;
}

export const ParticipantListItem = React.memo<ParticipantListItemProps>(({
    participant,
    showActions,
    onRemove,
}) => {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
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
            {showActions && onRemove && (
                <button
                    onClick={onRemove}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Rimuovi partecipante"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
});

ParticipantListItem.displayName = 'ParticipantListItem';
