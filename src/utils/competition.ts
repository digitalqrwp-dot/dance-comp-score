// Utility functions for competition management

import { PARTICIPANTS_PER_HEAT, FINALISTS_COUNT } from '@/constants/competition';
import type { Competition, Heat, Participant, FinalRanking, CompetitionResult } from '@/types/competition';

/**
 * Genera un ID unico basato su timestamp e stringa casuale.
 * Utilizzato per entità create localmente prima della persistenza su DB.
 * 
 * @returns {string} ID univoco alfanumerico.
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Distribuisce i partecipanti in batterie (heats).
 * Rispetta la costante PARTICIPANTS_PER_HEAT (default: 6).
 * Rimescola i partecipanti per garantire equità.
 * 
 * @param {Participant[]} participants - Lista dei partecipanti da distribuire.
 * @returns {Heat[]} Array di batterie configurate.
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
 * Calcola la lista dei finalisti basandosi sulle preferenze dei giudici.
 * Utilizza la regola della maggioranza semplice sulle selezioni effettuate nelle batterie.
 * 
 * @param {Competition} competition - L'oggetto competizione contenente le selezioni dei giudici.
 * @param {number} selectionsPerJudge - Numero di preferenze richieste per ogni giudice (default: FINALISTS_COUNT).
 * @returns {string[]} IDs dei partecipanti che accedono alla finale.
 * 
 * @axiom AX05 - Mathematical Truth: Il calcolo deve essere deterministico e basato puramente sui voti ricevuti.
 */
export const calculateFinalists = (
  competition: Competition,
  selectionsPerJudge: number = FINALISTS_COUNT
): string[] => {
  const selectionCounts: Record<string, number> = {};

  // Conta quante volte ogni partecipante è stato selezionato dai giudici
  competition.judgeSelections.forEach(selection => {
    selection.selectedParticipants.forEach(participantId => {
      selectionCounts[participantId] = (selectionCounts[participantId] || 0) + 1;
    });
  });

  // Ordina per numero di selezioni decrescente e prende i primi N finalisti
  const sorted = Object.entries(selectionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, FINALISTS_COUNT)
    .map(([id]) => id);

  return sorted;
};

/**
 * Calcola i risultati finali utilizzando lo Skating System ufficiale (Regole 9, 10, 11).
 * 
 * Processo:
 * 1. Regola 9: Vince chi ha la somma dei piazzamenti più bassa.
 * 2. Regola 10: In caso di parità, vince chi ottiene la maggioranza dei piazzamenti 
 *    migliori procedendo per livelli (1°, poi 1°+2°, poi 1°+2°+3°, ecc.).
 * 3. Regola 11: Se persiste parità, si guarda la somma dei valori dei piazzamenti 
 *    che formano la maggioranza.
 * 
 * @param {FinalRanking[]} finalRankings - Classifiche individuali fornite da ogni giudice.
 * @param {string[]} finalistIds - IDs dei partecipanti finalisti.
 * @returns {CompetitionResult[]} Elenco dei risultati con posizione finale calcolata.
 */
export const calculateSkatingResults = (
  finalRankings: FinalRanking[],
  finalistIds: string[]
): CompetitionResult[] => {
  const numJudges = finalRankings.length;
  const majority = Math.floor(numJudges / 2) + 1;

  const results: CompetitionResult[] = finalistIds.map(participantId => {
    const individualScores: number[] = [];
    finalRankings.forEach(ranking => {
      const position = ranking.rankings[participantId];
      if (position) individualScores.push(position);
    });

    const totalScore = individualScores.reduce((sum, score) => sum + score, 0);

    return {
      participantId,
      position: 0,
      totalScore,
      individualScores: [...individualScores].sort((a, b) => a - b), // Sort scores for easier analysis
    };
  });

  // Funzione di comparazione avanzata basata sullo Skating System
  const compareParticipants = (a: CompetitionResult, b: CompetitionResult): number => {
    // 1. Regola 9: Somma totale dei piazzamenti
    if (a.totalScore !== b.totalScore) {
      return a.totalScore - b.totalScore;
    }

    // 2. Regola 10: Maggioranza progressiva
    // Controlliamo ogni livello di piazzamento da 1 a N_finalisti
    const maxRank = finalistIds.length;
    for (let rank = 1; rank <= maxRank; rank++) {
      const countA = a.individualScores.filter(s => s <= rank).length;
      const countB = b.individualScores.filter(s => s <= rank).length;

      const hasMajorityA = countA >= majority;
      const hasMajorityB = countB >= majority;

      if (hasMajorityA && !hasMajorityB) return -1;
      if (!hasMajorityA && hasMajorityB) return 1;

      if (hasMajorityA && hasMajorityB) {
        // Entrambi hanno la maggioranza a questo livello
        if (countA !== countB) {
          return countB - countA; // Più piazzamenti in maggioranza è meglio
        }

        // 3. Regola 11: Somma dei piazzamenti nella maggioranza
        const sumA = a.individualScores.filter(s => s <= rank).reduce((s, v) => s + v, 0);
        const sumB = b.individualScores.filter(s => s <= rank).reduce((s, v) => s + v, 0);
        if (sumA !== sumB) {
          return sumA - sumB; // Somma più bassa è meglio
        }
        // Se continua il pareggio a questo livello, procediamo al prossimo rank
      }
    }

    return 0; // Pareggio assoluto (raro, richiede split o dance-off)
  };

  results.sort(compareParticipants);

  // Assegna le posizioni finali
  results.forEach((result, index) => {
    result.position = index + 1;
  });

  return results;
};

/**
 * Recupera un partecipante dall'elenco degli iscritti tramite ID.
 * 
 * @param {Competition} competition - L'oggetto competizione.
 * @param {string} participantId - ID univoco del partecipante.
 * @returns {Participant | undefined} L'oggetto partecipante o undefined se non trovato.
 */
export const getParticipantById = (
  competition: Competition,
  participantId: string
): Participant | undefined => {
  return competition.participants.find(p => p.id === participantId);
};

/**
 * Formatta il nome completo del partecipante (Nome + Cognome).
 * 
 * @param {Participant} participant - L'oggetto partecipante.
 * @returns {string} Stringa formattata "Nome Cognome".
 */
export const formatParticipantName = (participant: Participant): string => {
  return `${participant.name} ${participant.surname}`;
};

/**
 * Genera una stringa descrittiva per la competizione includendo etichette di categoria e classe.
 * 
 * @param {Competition} competition - L'oggetto competizione.
 * @returns {string} Stringa descrittiva "Nome - Categoria Classe X".
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
