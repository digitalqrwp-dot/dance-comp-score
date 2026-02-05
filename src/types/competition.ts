import { Database } from './database';

export type UserRole = Database['public']['Enums']['user_role'];
export type CompetitionCategory = Database['public']['Enums']['competition_category'];
export type RoundType = Database['public']['Enums']['round_type'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Competition = Database['public']['Tables']['competitions']['Row'] & {
  disciplines?: { scoring_type: string } | null
};

export type Performance = Database['public']['Tables']['performances']['Row'];

export type Athlete = Database['public']['Tables']['athletes']['Row'];
export type PerformanceMember = Database['public']['Tables']['performance_members']['Row'];

export interface PerformanceWithMembers extends Performance {
  performance_members?: {
    athletes: Athlete | null
  }[] | null;
  members: Athlete[];
}

export interface SkatingResult {
  performance_id: string;
  bib_number: number;
  name: string;
  total_points: number;
  rank: number;
  details?: any;
}

export interface ParameterResult {
  performance_id: string;
  bib_number: number;
  name: string;
  parameter_scores: Record<string, number>;
  total_score: number;
  rank: number;
}

export interface JudgeEventAccessJoin {
  event_id: string;
  judge_id: string;
  events: { name: string } | null;
  judges_registry: { first_name: string; last_name: string } | null;
}

export interface RoundWithCompetitionJoin {
  id: string;
  round_type: Database['public']['Enums']['round_type'];
  competitions: {
    disciplines: {
      scoring_type: string;
    } | null;
  } | null;
}

export interface CompetitionWithPerformances extends Competition {
  performances: PerformanceWithMembers[];
}

export interface JudgeSelection {
  judge_id: string;
  judge_name: string;
  performance_id: string;
  selection_type: 'passage' | 'ranking';
  rank_position?: number;
  timestamp: string;
}

export interface CompetitionResult {
  performance_id: string;
  position: number;
  total_score: number;
  is_qualified: boolean;
}

// Age categories and classes (ui constants)
export type AgeCategory = 'under_8' | 'under_10' | 'under_12' | 'under_14' | 'under_16' | 'under_18' | 'adulti';
export type CompetitionClass = 'C' | 'B' | 'A' | 'AS' | 'M';

export interface PerformanceExtended extends Performance {
  participants_count: number;
  club_names?: string[];
}
