# Specifiche Tecniche DanceScore (Blueprint AI)

Questo documento funge da "Single Source of Truth" per l'intelligenza artificiale riguardo alle logiche di business e al flusso dati del progetto DanceScore.

## 1. Architettura dello Stato
- **Source of Truth**: `CompetitionContext` (attualmente in-memory, migrazione a Supabase prevista in V003).
- **Flusso**: 
  - La UI interattiva (es. `JudgePanel`) invoca azioni del Context.
  - Il Context invoca logiche di calcolo in `utils/competition.ts`.
  - Lo stato aggiornato viene riflesso globalmente ai componenti.

## 2. Entità e Relazioni
- **Evento**: Top-level container (ID, Nome, Data, Luogo).
- **Competizione**: Sottogruppo di un evento (es. "Samba Open"). Appartiene a una Categoria d'età e Classe.
- **Partecipante**: Iscritto a una competizione. Ha un `competitionNumber` univoco per categoria.
- **Batteria (Heat)**: Gruppo di max 6 partecipanti derivato dagli iscritti.
- **Giudice**: Utente autorizzato a votare selezioni (batterie) e piazzamenti (finali).

## 3. Invarianti di Business
- **PARTICIPANTS_PER_HEAT**: 6 (Costante in `constants/competition.ts`).
- **FINALISTS_COUNT**: 6 (Standard Skating System).
- **Majority Rule**: Un partecipante avanza alla finale se ha la maggioranza delle preferenze dei giudici (calcolo deterministico in `utils`).
- **Skating System**: Vincitore = minor somma dei piazzamenti (Entropia Minima).

## 4. Flusso Operativo (Stage Pipeline)
1. **Registration**: Iscrizione partecipanti e giudici.
2. **Heats**: Suddivisione automatica e votazione "Selezione" (passa/non passa).
3. **Semifinal (Opzionale)**: Ulteriore scrematura se N > 12.
4. **Final**: Votazione piazzamenti (1°, 2°, 3°...).
5. **Completed**: Calcolo risultati finali e generazione archivio.

## 5. Vincoli Tecnici per AI
- **Performance**: Evitare re-render massivi. Usare componenti atomici.
- **Centralizzazione**: MAI implementare calcoli matematici direttamente nei componenti. Usare sempre `utils/competition.ts`.
- **Nomenclatura**: Utilizzare esclusivamente la terminologia definita in `src/types/competition.ts`.
