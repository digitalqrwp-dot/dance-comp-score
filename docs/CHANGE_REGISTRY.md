# CHANGE_REGISTRY.md

Questo documento traccia tutte le modifiche strutturali al codice, database, configurazioni e dipendenze del progetto DanceScore.

---

### [V001] 2026-02-05 00:20 - Supabase Setup
- **Commit Hash**: [PENDING]
- **Stato Funzionale**: Integrazione base di Supabase. Configurazione client e analisi atomica del progetto.
- **Modifiche Strutturali**:
  - **Database**: Configurazione client Supabase.
  - **Documentazione**: README_ARCHITECTURE.md, REPORT_ANALISI.md.
- **Rollback**: `git checkout V001-setup`

---

### [V002] 2026-02-05 01:15 - Identity Phase (Fase 1)
- **Commit Hash**: [PENDING]
- **Stato Funzionale**: Autenticazione Direttore e Giudice completata. Login funzionante via Supabase/AccessCode.
- **Modifiche Strutturali**:
  - **Context**: `AuthContext` (Supabase Auth), `JudgeContext` (Secret Access Code logic).
  - **UI**: Role-based AppLayout, ProtectedRoute system.
- **Rollback**: `git checkout V002-identity`

---

### [V003] 2026-02-05 02:20 - Enterprise Audit & Types
- **Commit Hash**: [PENDING]
- **Stato Funzionale**: Sistema tipizzato al 100%. Generazione automatica tipi dal DB.
- **Modifiche Strutturali**:
  - **Tipi**: `src/types/database.ts` generato via MCP.
  - **Consolidamento**: `supabase.ts` centralizzato con tipi generici.
- **Rollback**: `git checkout V003-audit`

---

### [V004] 2026-02-05 02:45 - Performance Layer (Fase 2)
- **Commit Hash**: [ACTIVE]
- **Stato Funzionale**: Transizione dal modello Mock al modello SQL. Gestione Solo/Duo/Gruppi tramite tabella `performances`. Dashboard Direttore connessa al cloud.
- **Modifiche Strutturali**:
  - **Database**: Tabelle `performances`, `performance_members`, `judges_registry`. RLS attivata.
  - **Servizi**: `src/services/performanceService.ts` per CRUD cloud.
  - **Refactoring**: `EventContext` e `CompetitionContext` ora Supabase-native.
  - **UI Fix**: Aggiornato `CompetitionCard` per prevenire crash su campi mock mancanti.
- **Modifiche Ordinarie**:
  - Eliminazione riferimenti a `localStorage` per logica di business.
  - Aggiornamento `DirectorDashboard` con caricamento asincrono.
- **Complete Rollback**:
  1. `supabase migration rollback create_performance_layer`
  2. `git checkout V003-audit` (Ripristina context mock originali)
  3. `rm src/services/performanceService.ts`

---

---

### [V018] 2026-02-05 03:30 - Masterpiece Compliance & Deep Audit
- **Commit Hash**: [ACTIVE]
- **Stato Funzionale**: Sistema pienamente conforme ai criteri Masterpiece. Scoring dinamico (A/B), Tie-break Rule 10/11 server-side, Anagrafica blindata con CF reale, Dashboard monitoraggio LIVE (AX04).
- **Modifiche Strutturali**:
  - **Database**:
    - Nuove RPC: `calculate_skating_results`, `calculate_parameter_results`, `close_competition_and_crystallize`.
    - Tabelle aggiunte: `discipline_parameters`, `scoring_parameters`.
    - Estensione `competitions`: campi `actual_start_date`, `actual_end_date`, `operating_cost` (AX07).
  - **Servizi**:
    - `athleteService`: Validazione CF reale e check unicità.
    - `competitionService`: Integrazione RPC per calcolo e cristallizzazione.
  - **UI/UX**:
    - `DirectorDashboard`: Pannello Monitoraggio Live e controllo ciclo vita gara (AX01, AX04).
    - `JudgePanel`: Switch dinamico Skating/Parameters.
    - `AddPerformanceForm`: Mandatario inserimento CF reale.
    - `CompetitionCard`: Visualizzazione metadati operativi (AX07).
  - **Governance**: `MANDATORY_HEADER` e `README.md` architettonici (AX09).
- **Modifiche Ordinarie**:
  - Correzione lint in `JudgePanel` e `CompetitionContext`.
  - Aggiornamento `atomic_integration_checklist.md`.
- **Complete Rollback**:
  1. `DROP FUNCTION public.calculate_skating_results(uuid);`
  2. `DROP FUNCTION public.calculate_parameter_results(uuid);`
  3. `DROP FUNCTION public.close_competition_and_crystallize(uuid);`
  4. `ALTER TABLE public.competitions DROP COLUMN actual_start_date, DROP COLUMN actual_end_date, DROP COLUMN operating_cost;`
  5. `git checkout V004-performance`
