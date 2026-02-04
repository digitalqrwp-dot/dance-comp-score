// Utility functions for competition management

import { PARTICIPANTS_PER_HEAT, FINALISTS_COUNT } from '@/constants/competition';
import type { Competition, Heat, Participant, FinalRanking, CompetitionResult } from '@/types/competition';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Split participants into heats of 6
 */
export const generateHeats = (participants: Participant[]): Heat[] => {
  const heats: Heat[] = [];
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length; i += PARTICIPANTS_PER_HEAT) {
    const heatParticipants = shuffled.slice(i, i + PARTICIPANTS_PER_HEAT);
    heats.push({
      id: generateId(),
      heatNumber: Math.floor(i / PARTICIPANTS_PER_HEAT) + 1,
      participants: heatParticipants.map(p => p.id),
      isCompleted: false,
      selectedParticipants: [],
    });
  }
  
  return heats;
};

/**
 * Calculate finalists based on judge selections using majority rule
 */
export const calculateFinalists = (
  competition: Competition,
  selectionsPerJudge: number = FINALISTS_COUNT
): string[] => {
  const selectionCounts: Record<string, number> = {};
  
  // Count how many times each participant was selected
  competition.judgeSelections.forEach(selection => {
    selection.selectedParticipants.forEach(participantId => {
      selectionCounts[participantId] = (selectionCounts[participantId] || 0) + 1;
    });
  });
  
  // Sort by selection count and take top finalists
  const sorted = Object.entries(selectionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, FINALISTS_COUNT)
    .map(([id]) => id);
  
  return sorted;
};

/**
 * Calculate final results using Skating system
 * Winner = lowest total score (most 1st places)
 */
export const calculateSkatingResults = (
  finalRankings: FinalRanking[],
  finalistIds: string[]
): CompetitionResult[] => {
  const results: CompetitionResult[] = [];
  
  finalistIds.forEach(participantId => {
    const individualScores: number[] = [];
    
    finalRankings.forEach(ranking => {
      const position = ranking.rankings[participantId];
      if (position) {
        individualScores.push(position);
      }
    });
    
    const totalScore = individualScores.reduce((sum, score) => sum + score, 0);
    
    results.push({
      participantId,
      position: 0, // Will be calculated after sorting
      totalScore,
      individualScores,
    });
  });
  
  // Sort by total score (ascending - lower is better)
  results.sort((a, b) => {
    if (a.totalScore !== b.totalScore) {
      return a.totalScore - b.totalScore;
    }
    // Tie-breaker: count of first places
    const aFirsts = a.individualScores.filter(s => s === 1).length;
    const bFirsts = b.individualScores.filter(s => s === 1).length;
    return bFirsts - aFirsts;
  });
  
  // Assign positions
  results.forEach((result, index) => {
    result.position = index + 1;
  });
  
  return results;
};

/**
 * Get participant by ID from competition
 */
export const getParticipantById = (
  competition: Competition,
  participantId: string
): Participant | undefined => {
  return competition.participants.find(p => p.id === participantId);
};

/**
 * Format participant display name
 */
export const formatParticipantName = (participant: Participant): string => {
  return `${participant.name} ${participant.surname}`;
};

/**
 * Get competition display name
 */
export const getCompetitionDisplayName = (competition: Competition): string => {
  const ageLabels: Record<string, string> = {
    under_8: 'Under 8',
    under_10: 'Under 10',
    under_12: 'Under 12',
    under_14: 'Under 14',
    under_16: 'Under 16',
    under_18: 'Under 18',
    adulti: 'Adulti',
  };
  
  return `${competition.name} - ${ageLabels[competition.ageCategory]} Classe ${competition.competitionClass}`;
};
