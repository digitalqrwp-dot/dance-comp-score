// Constants for Dance Competition Management

import type { AgeCategory, CompetitionClass, Dance, DanceStyle } from '@/types/competition';

export const AGE_CATEGORIES: Record<AgeCategory, string> = {
  under_8: 'Under 8',
  under_10: 'Under 10',
  under_12: 'Under 12',
  under_14: 'Under 14',
  under_16: 'Under 16',
  under_18: 'Under 18',
  adulti: 'Adulti',
};

export const COMPETITION_CLASSES: Record<CompetitionClass, string> = {
  C: 'Classe C',
  B: 'Classe B',
  A: 'Classe A',
  AS: 'Classe AS',
  M: 'Master',
};

export const DANCE_STYLES: Record<DanceStyle, string> = {
  latin: 'Latin',
  standard: 'Standard',
  caraibico: 'Caraibico',
  liscio: 'Liscio',
};

export const DANCES: Record<Dance, { name: string; style: DanceStyle }> = {
  cha_cha: { name: 'Cha Cha Cha', style: 'latin' },
  samba: { name: 'Samba', style: 'latin' },
  rumba: { name: 'Rumba', style: 'latin' },
  paso_doble: { name: 'Paso Doble', style: 'latin' },
  jive: { name: 'Jive', style: 'latin' },
  waltz: { name: 'Valzer Lento', style: 'standard' },
  tango: { name: 'Tango', style: 'standard' },
  viennese_waltz: { name: 'Valzer Viennese', style: 'standard' },
  slow_foxtrot: { name: 'Slow Foxtrot', style: 'standard' },
  quickstep: { name: 'Quickstep', style: 'standard' },
};

export const PARTICIPANTS_PER_HEAT = 6;
export const FINALISTS_COUNT = 6;
export const MAX_RANKING_POSITION = 6;

export const PHASE_LABELS = {
  registration: 'Registrazione',
  heats: 'Batterie',
  semifinal: 'Semifinale',
  final: 'Finale',
  completed: 'Completata',
};
