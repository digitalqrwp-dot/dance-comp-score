# Architettura Database DanceScore (V002)

Questo documento descrive la struttura, la logica e i principi ingegneristici del database DanceScore, implementato su piattaforma **Supabase (PostgreSQL)**. L'obiettivo primario è fornire un sistema "Planet-Scale" flessibile, sicuro e conforme alle normative legali.

## 1. Principi e Assiomi (AX)

L'architettura segue rigorosamente i seguenti principi:
- **Data-Driven (Zero Hard-Coding)**: Ogni regola di business (tipo di voto, parametri, categorie) è definita dai dati e non dal codice. Questo permette al sistema di adattarsi a nuove regole semplicemente tramite configurazione.
- **Granularità dei Dati (AX02)**: Utilizziamo FK specifiche e frammentazione massima per permettere analisi storiche e calcoli complessi in tempo reale.
- **Registro delle Modifiche (AX08)**: Ogni evoluzione dello schema è tracciata e riproducibile.

---

## 2. Modello Operativo "Masterpiece"

La struttura è gerarchica e progettata per la scalabilità:

### A. Anagrafiche Permanenti
- **Atleti (`athletes`)**: Registro con Codice Fiscale (tax_id) unico e gestione documenti scannerizzati via Bucket S3.
- **Giudici (`judges_registry`)**: Registro dei nomi reali per la conformità legale dei verbali.
- **Discipline (`disciplines`)**: Il "cervello" del sistema. Definisce il nome della danza e il tipo di giudizio (Skating o Parametri).

### B. Il Layer delle Esibizioni (`performances`)
Scolliamo il voto dal singolo atleta. La `performance` è l'entità che scende in pista:
- Può contenere **1 atleta** (Solo), **2 atleti** (Duo/Coppia) o **N atleti** (Gruppo).
- Il voto viene assegnato alla Performance, garantendo uniformità di giudizio indipendentemente dalla categoria.

### C. Gerarchia Evento
`Event` -> `Competition` -> `Round` -> `Performance`
Il sistema a **Round** (Turni) permette di gestire batterie eliminatorie e finali da 6 a N partecipanti con flessibilità totale.

---

## 3. Sistemi di Judgement (A & B)

Il database implementa due "binari" di distribuzione delle regole:

### Sistema A: Skating System (Tecnica Solo)
- **Eliminatorie**: Raccolta delle "X" (`is_cross`) per il passaggio del turno.
- **Finali**: Assegnazione dei posti (1° - N°) con vincolo di unicità per giudice (`rank_position`).
- **Vista**: `vw_skating_final_results` calcola la somma dei posti in tempo reale.

### Sistema B: Parameters (Sincro, Gruppi, Show)
- **Parametri Custom**: Ogni disciplina può avere N parametri (es. Tecnica, Immagine, Coreografia).
- **Voto 1-10**: Validato tramite check constraint SQL.
- **Distribuzione**: Il sistema legge la tabella `discipline_parameters` e mostra sul tablet solo i tasti necessari.

---

## 4. Sicurezza ed Integrità (RLS)

Abbiamo implementato 3 livelli di autorizzazione tramite **Row Level Security (RLS)**:

1.  **Amministratore**: Accesso totale e gestione cataloghi (Discipline, Parametri).
2.  **Direttore di Gara**: Isolamento totale. Ogni Direttore può vedere e gestire solo i propri Eventi e i risultati delle proprie gare.
3.  **Giudice (Temporary Access)**: I giudici accedono tramite codici temporanei (`judge_event_access`). Non hanno account permanenti ma possono scrivere voti "timbisati" validati dal sistema.

### Il "Timbro" del Giudice
Ogni voto non è solo un numero, ma contiene un **Audit Stamp**:
- Nome/Cognome reale del giudice.
- Codice di accesso utilizzato.
- Timestamp preciso.

---

## 5. Chiusura e Cristallizzazione

Per soddisfare i requisiti di compliance pluriennale, abbiamo implementato la **RPC `close_competition_and_crystallize`**:
- Al termine della gara, il sistema "scatta una foto" definitiva.
- Tutti i dati (nomi atleti, nomi parametri, voti, rankings) vengono salvati in un archivio JSON statico (`crystallized_competition_results`).
- Questo garantisce che i report PDF siano rigenerabili identici anche se le anagrafiche base dovessero essere modificate o rimosse anni dopo.

---

## 6. Stack Tecnologico
- **Environment**: Supabase / PostgreSQL 17.
- **Extensions**: `pgcrypto` (Sicurezza), `uuid-ossp` (Identità).
- **Business Logic**: Trigger per backup codici, Viste di aggregazione, Stored Procedures (RPC).
- **Storage**: Buckets `athlete-docs` e `competition-reports` con policy di accesso granulari.
