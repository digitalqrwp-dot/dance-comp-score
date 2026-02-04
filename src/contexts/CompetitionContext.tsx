import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { 
  Competition, 
  Event, 
  Judge, 
  Participant, 
  JudgeSelection, 
  FinalRanking,
  AgeCategory,
  CompetitionClass,
  DanceStyle,
  Dance
} from '@/types/competition';
import { 
  generateId, 
  generateHeats, 
  calculateFinalists, 
  calculateSkatingResults 
} from '@/utils/competition';

interface CompetitionContextType {
  // State
  currentEvent: Event | null;
  activeCompetition: Competition | null;
  currentJudge: Judge | null;
  
  // Event actions
  createEvent: (name: string, date: Date, location: string) => void;
  
  // Competition actions
  createCompetition: (
    name: string,
    ageCategory: AgeCategory,
    competitionClass: CompetitionClass,
    style: DanceStyle,
    dances: Dance[]
  ) => void;
  setActiveCompetition: (competitionId: string | null) => void;
  
  // Participant actions
  addParticipant: (competitionId: string, name: string, surname: string, club?: string) => void;
  removeParticipant: (competitionId: string, participantId: string) => void;
  
  // Phase management
  startHeats: (competitionId: string) => void;
  advanceToNextHeat: (competitionId: string) => void;
  startFinal: (competitionId: string) => void;
  completeCompetition: (competitionId: string) => void;
  
  // Judge actions
  addJudge: (name: string, code: string) => void;
  setCurrentJudge: (judgeId: string | null) => void;
  
  // Selection actions (for judges during heats/semifinal)
  submitSelection: (competitionId: string, selectedParticipantIds: string[]) => void;
  
  // Final ranking actions
  submitFinalRanking: (competitionId: string, rankings: Record<string, number>) => void;
  
  // Utility
  getCompetitionById: (id: string) => Competition | undefined;
  getParticipantsByIds: (competition: Competition, ids: string[]) => Participant[];
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
};

interface CompetitionProviderProps {
  children: ReactNode;
}

export const CompetitionProvider: React.FC<CompetitionProviderProps> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [activeCompetitionId, setActiveCompetitionId] = useState<string | null>(null);
  const [currentJudge, setCurrentJudgeState] = useState<Judge | null>(null);

  const createEvent = useCallback((name: string, date: Date, location: string) => {
    const newEvent: Event = {
      id: generateId(),
      name,
      date,
      location,
      competitions: [],
      judges: [],
    };
    setCurrentEvent(newEvent);
  }, []);

  const createCompetition = useCallback((
    name: string,
    ageCategory: AgeCategory,
    competitionClass: CompetitionClass,
    style: DanceStyle,
    dances: Dance[]
  ) => {
    if (!currentEvent) return;

    const newCompetition: Competition = {
      id: generateId(),
      name,
      ageCategory,
      competitionClass,
      style,
      dances,
      participants: [],
      heats: [],
      currentPhase: 'registration',
      currentHeatIndex: 0,
      judgeSelections: [],
      finalRankings: [],
      finalists: [],
      results: [],
      createdAt: new Date(),
    };

    setCurrentEvent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        competitions: [...prev.competitions, newCompetition],
      };
    });
  }, [currentEvent]);

  const setActiveCompetition = useCallback((competitionId: string | null) => {
    setActiveCompetitionId(competitionId);
  }, []);

  const activeCompetition = currentEvent?.competitions.find(c => c.id === activeCompetitionId) || null;

  const addParticipant = useCallback((competitionId: string, name: string, surname: string, club?: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      const newNumber = competition.participants.length + 1;
      
      const newParticipant: Participant = {
        id: generateId(),
        competitionNumber: newNumber,
        name,
        surname,
        club,
      };

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        participants: [...competition.participants, newParticipant],
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, []);

  const removeParticipant = useCallback((competitionId: string, participantId: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      const updatedParticipants = competition.participants
        .filter(p => p.id !== participantId)
        .map((p, index) => ({ ...p, competitionNumber: index + 1 }));

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        participants: updatedParticipants,
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, []);

  const startHeats = useCallback((competitionId: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      const heats = generateHeats(competition.participants);

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        heats,
        currentPhase: 'heats',
        currentHeatIndex: 0,
        judgeSelections: [],
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, []);

  const advanceToNextHeat = useCallback((competitionId: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      const nextHeatIndex = competition.currentHeatIndex + 1;

      // Mark current heat as completed
      const updatedHeats = [...competition.heats];
      if (updatedHeats[competition.currentHeatIndex]) {
        updatedHeats[competition.currentHeatIndex] = {
          ...updatedHeats[competition.currentHeatIndex],
          isCompleted: true,
        };
      }

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        heats: updatedHeats,
        currentHeatIndex: nextHeatIndex,
        currentPhase: nextHeatIndex >= competition.heats.length ? 'semifinal' : 'heats',
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, []);

  const startFinal = useCallback((competitionId: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      const finalists = calculateFinalists(competition);

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        finalists,
        currentPhase: 'final',
        finalRankings: [],
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, []);

  const completeCompetition = useCallback((competitionId: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      const results = calculateSkatingResults(competition.finalRankings, competition.finalists);

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        results,
        currentPhase: 'completed',
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, []);

  const addJudge = useCallback((name: string, code: string) => {
    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const newJudge: Judge = {
        id: generateId(),
        name,
        code,
        isActive: true,
      };

      return {
        ...prev,
        judges: [...prev.judges, newJudge],
      };
    });
  }, []);

  const setCurrentJudge = useCallback((judgeId: string | null) => {
    if (!judgeId) {
      setCurrentJudgeState(null);
      return;
    }
    const judge = currentEvent?.judges.find(j => j.id === judgeId) || null;
    setCurrentJudgeState(judge);
  }, [currentEvent]);

  const submitSelection = useCallback((competitionId: string, selectedParticipantIds: string[]) => {
    if (!currentJudge) return;

    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      
      // Remove previous selection from same judge for same heat
      const filteredSelections = competition.judgeSelections.filter(
        s => s.judgeId !== currentJudge.id
      );

      const newSelection: JudgeSelection = {
        judgeId: currentJudge.id,
        judgeName: currentJudge.name,
        selectedParticipants: selectedParticipantIds,
        timestamp: new Date(),
      };

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        judgeSelections: [...filteredSelections, newSelection],
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, [currentJudge]);

  const submitFinalRanking = useCallback((competitionId: string, rankings: Record<string, number>) => {
    if (!currentJudge) return;

    setCurrentEvent(prev => {
      if (!prev) return prev;
      
      const competitionIndex = prev.competitions.findIndex(c => c.id === competitionId);
      if (competitionIndex === -1) return prev;

      const competition = prev.competitions[competitionIndex];
      
      // Remove previous ranking from same judge
      const filteredRankings = competition.finalRankings.filter(
        r => r.judgeId !== currentJudge.id
      );

      const newRanking: FinalRanking = {
        judgeId: currentJudge.id,
        judgeName: currentJudge.name,
        rankings,
      };

      const updatedCompetitions = [...prev.competitions];
      updatedCompetitions[competitionIndex] = {
        ...competition,
        finalRankings: [...filteredRankings, newRanking],
      };

      return { ...prev, competitions: updatedCompetitions };
    });
  }, [currentJudge]);

  const getCompetitionById = useCallback((id: string) => {
    return currentEvent?.competitions.find(c => c.id === id);
  }, [currentEvent]);

  const getParticipantsByIds = useCallback((competition: Competition, ids: string[]) => {
    return competition.participants.filter(p => ids.includes(p.id));
  }, []);

  const value: CompetitionContextType = {
    currentEvent,
    activeCompetition,
    currentJudge,
    createEvent,
    createCompetition,
    setActiveCompetition,
    addParticipant,
    removeParticipant,
    startHeats,
    advanceToNextHeat,
    startFinal,
    completeCompetition,
    addJudge,
    setCurrentJudge,
    submitSelection,
    submitFinalRanking,
    getCompetitionById,
    getParticipantsByIds,
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
};
