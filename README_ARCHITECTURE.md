# 🏗️ Architettura - Dance Competition Management System

⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE QUESTO DOCUMENTO PRIMA DI MODIFICARE ⚠️

## Paradigma Core
Il sistema è progettato per gestire competizioni di danza sportiva in tempo reale. La logica di calcolo dei risultati (Skating System) è disaccoppiata dalla view e risiede in `src/utils/competition.ts`.

## Flusso Dati (State Management)
L'intera applicazione ruota attorno al **`CompetitionContext`** (`src/contexts/CompetitionContext.tsx`). 

1. **Local state (attuale)**: Tutto lo stato della competizione vive in memoria nel provider.
2. **Persistence Layer (Supabase)**: L'integrazione Supabase (`src/lib/supabase.ts`) deve fungere da sorgente di verità. Le azioni del context (es. `submitScore`) devono evolvere in chiamate API asincrone.

## Pattern UX/UI (Axioms Compliance)
- **AX00C (Professionalism)**: Palette Navy/Gold, font Inter/Space Grotesk.
- **AX04 (Simultaneous States)**: Dashboard e pannelli devono mostrare lo stato attuale senza nasconderlo dietro filtri eccessivi.
- **AX08 (Change Registry)**: Tutte le modifiche strutturali sono tracciate in `docs/CHANGE_REGISTRY.md`.

## Componenti Chiave
- `DirectorDashboard`: Pannello di controllo per la gestione eventi e competizioni.
- `JudgePanel`: Interfaccia ottimizzata per il touch per l'inserimento voti dei giudici.
- `SkatingPanel`: Motore di visualizzazione del calcolo posizioni.

## Rischi Critici
- La perdita dello stato nel Context resetta l'intera competizione (risolto con Supabase).
- La complessità del calcolo dei risultati richiede test rigorosi in `src/utils/competition.ts`.
