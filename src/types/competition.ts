// Types for Dance Competition Management System

export type AgeCategory = 'under_8' | 'under_10' | 'under_12' | 'under_14' | 'under_16' | 'under_18' | 'adulti';

export type CompetitionClass = 'C' | 'B' | 'A' | 'AS' | 'M';

export type DanceStyle = 'latin' | 'standard' | 'caraibico' | 'liscio';

export type Dance = 
  | 'cha_cha' 
  | 'samba' 
  | 'rumba' 
  | 'paso_doble' 
  | 'jive'
  | 'waltz' 
  | 'tango' 
  | 'viennese_waltz' 
  | 'slow_foxtrot' 
  | 'quickstep';

export interface Participant {
  id: string;
  competitionNumber: number;
  name: string;
  surname: string;
  club?: string;
}

export interface Heat {
  id: string;
  heatNumber: number;
  participants: string[]; // participant IDs
  isCompleted: boolean;
  selectedParticipants: string[]; // IDs selected by judges
}

export interface JudgeSelection {
  judgeId: string;
  judgeName: string;
  selectedParticipants: string[]; // participant IDs
  timestamp: Date;
}

export interface FinalRanking {
  judgeId: string;
  judgeName: string;
  rankings: Record<string, number>; // participantId -> position (1-6)
}

export interface Competition {
  id: string;
  name: string;
  ageCategory: AgeCategory;
  competitionClass: CompetitionClass;
  style: DanceStyle;
  dances: Dance[];
  participants: Participant[];
  heats: Heat[];
  currentPhase: 'registration' | 'heats' | 'semifinal' | 'final' | 'completed';
  currentHeatIndex: number;
  judgeSelections: JudgeSelection[];
  finalRankings: FinalRanking[];
  finalists: string[]; // participant IDs in final
  results: CompetitionResult[];
  createdAt: Date;
}

export interface CompetitionResult {
  participantId: string;
  position: number;
  totalScore: number;
  individualScores: number[];
}

export interface Judge {
  id: string;
  name: string;
  code: string; // for login
  isActive: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  competitions: Competition[];
  judges: Judge[];
}
