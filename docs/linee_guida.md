# Analisi Funzionale: Sistema Gestionale Gare di Danza

## 1. NATURA DEL PROGETTO

**DanceScore** è un'applicazione gestionale per la gestione completa di eventi competitivi di danza sportiva. Il sistema supporta l'intero ciclo di vita di una gara, dalla configurazione iniziale alla generazione della documentazione finale, con archiviazione permanente dei risultati per conformità normativa.

---

## 2. RUOLI E PERMESSI

Il sistema riconosce tre livelli di accesso con permessi distinti:

### 2.1 Amministratore
**Proprietario dell'applicazione** con accesso illimitato al sistema.

**Responsabilità:**
- Gestione utenti Direttori
- Configurazione globale del sistema (discipline, parametri di valutazione, tipologie competizione)
- Accesso multi-evento (può vedere e gestire tutte le gare)
- Gestione backup e conformità legale

### 2.2 Direttore di Gara
**Organizzatore dell'evento specifico**.

**Accesso:** Permanente, non cambia tra eventi diversi.

**Responsabilità:**
- Creazione e configurazione eventi
- Registrazione e gestione atleti
- Registrazione e gestione giudici
- Configurazione competizioni
- Gestione codici di accesso giudici
- Decisioni operative durante la gara (es: numero di finalisti)
- Visualizzazione risultati
- Generazione e archiviazione documentazione
- Terminazione evento ed eliminazione codici temporanei

### 2.3 Giudici
**Valutatori delle performance durante le competizioni**.

**Accesso:** Temporaneo, generato specificamente per ogni evento e poi eliminato.

**Ciclo codice:**
1. Generazione all'inizio evento
2. Comunicazione al giudice
3. Utilizzo durante la gara
4. Eliminazione manuale da parte del Direttore a fine evento
5. Backup permanente per compliance

**Permessi:** ESCLUSIVAMENTE accesso alla schermata di valutazione. Nessuna altra funzionalità è accessibile.

---

## 3. GESTIONE ANAGRAFICA

### 3.1 Atleti
Gli atleti sono archiviati permanentemente nel sistema per riutilizzo futuro.

**Dati anagrafici:**
- Nome e cognome
- **Codice fiscale** (obbligatorio)
- Club di appartenenza
- Storico partecipazioni

**Gestione documentale:**
Il sistema deve permettere l'archiviazione di **documenti scannerizzati** per ogni atleta (es: documenti identità, certificati medici, liberatorie).
- I documenti sono collegati all'anagrafica atleta
- Archiviazione permanente con percorsi univoci
- Possibilità di visualizzazione e download

**Numero di gara:** Assegnato dinamicamente per ogni competizione specifica.

### 3.2 Giudici
I giudici sono archiviati permanentemente per riutilizzo futuro.

**Dati anagrafici:**
- Nome e cognome

**Codice:** Temporaneo e specifico per ogni evento (vedi sezione 2.3).

### 3.3 Benefici Archiviazione Permanente
- Evita reinserimento manuale a ogni gara
- Mantiene storico completo di partecipazioni e risultati
- Garantisce conformità normativa (conservazione pluriennale)

---

## 4. MODALITÀ DI COMPETIZIONE

Il sistema supporta competizioni con formati diversi, ciascuno con il proprio sistema di valutazione.

### 4.1 Categorie di Partecipazione
- **Assolo**: singolo atleta
- **Duo**: coppia di atleti
- **Coppia**: coppia di ballo
- **Gruppo**: team di atleti (3+ membri)

### 4.2 Discipline
Il sistema permette la definizione di **discipline illimitate e configurabili**. Esempi attuali (non esaustivi):
- Latin Style Show (Solo, Duo, Gruppo)
- Latin Stelle Tecnica Sincro
- Hip Hop
- Danza Aerea
- Coppie Standard/Latin
- Altre (configurabili)

---

## 5. SISTEMI DI VALUTAZIONE

Esistono DUE sistemi di valutazione completamente distinti, applicati a categorie diverse:

### 5.1 Sistema A: Eliminatorie + Ranking Finale (Skating System)

**Applicato a:**
- Coppie
- Assolo (ECCETTO Latin Style Show Solo)
- Duo (ECCETTO Latin Style Show Duo)

#### Fase Eliminatoria
**Meccanica:**
- Il giudice visualizza tutti i partecipanti in gara
- Ogni giudice può dare una "X" (crocetta) ai partecipanti che ritiene debbano passare al turno successivo
- Non c'è limite al numero di X che un giudice può dare

**Flessibilità:**
- Possono esserci eliminatorie multiple (es: da 20 a 12, poi da 12 a 8, poi da 8 a 6)
- Il Direttore decide durante la gara quante eliminatorie fare e quanti partecipanti passano

#### Fase Finale
**Numero di finalisti:** Scalabile, **da un minimo di 6 a un massimo configurabile**. Il Direttore decide durante la gara (es: finale a 6, a 7, a 8, etc.). Il sistema deve supportare qualsiasi numero ≥ 6.

**Meccanica:**
- Ogni giudice assegna un ranking (1°, 2°, 3°, ... N°) a tutti i finalisti
- Ogni finalista riceve esattamente un posto da ogni giudice

**Calcolo classifica (Skating System):**
- Il vincitore è chi ha il **punteggio minore** (somma dei posti ricevuti)
- Esempio: chi riceve 1+1+1+2+1 (totale = 6) batte chi riceve 2+2+2+1+2 (totale = 9)
- In caso di parità, si applicano le regole di tie-break del Skating System

### 5.2 Sistema B: Punteggio su Parametri

**Applicato a:**
- Tutti i Gruppi
- **Latin Style Show Solo**
- **Latin Style Show Duo**

#### Meccanica
- NON ci sono eliminatorie
- Ogni giudice valuta ogni performance su **parametri specifici**
- Ogni parametro riceve un punteggio da **1 a 10** (range fisso, non configurabile)

#### Parametri di Valutazione
I parametri sono **configurabili per ogni disciplina**. Esempi:

**Latin Style Show:**
- Tecnica
- Immagine
- Coreografia
- Show

**Latin Stelle Tecnica Sincro / Hip Hop:**
- Tecnica
- Coreografia
- Immagine
- Sincronia

**Danza Aerea:**
- Immagine
- Parte a Terra
- Figurazioni
- Danza Aerea

#### Calcolo Classifica
- Per ogni esibizione: somma dei punteggi di tutti i parametri da tutti i giudici
- **Vince chi ha il punteggio MAGGIORE** (somma più alta)
- Esempio: Atleta con 10+10+10+10 = 40 batte atleta con 5+5+5+5 = 20

---

## 6. ARCHIVIAZIONE E DOCUMENTAZIONE

### 6.1 Obblighi Legali
Il sistema deve garantire l'archiviazione permanente (pluriennale) di:
- Risultati completi di ogni competizione
- Votazioni di ogni giudice
- Mapping numero gara - atleta
- Codici giudici utilizzati (storico)

### 6.2 Documentazione Post-Gara (PDF)

Ogni competizione conclude con la generazione automatica di documentazione che include:

**Tabella Giudici:**
- Codice utilizzato
- Nome e cognome
- Tutte le votazioni espresse (eliminatorie e/o finali)

**Tabella Atleti:**
- Numero di gara
- Nome e cognome
- Club

**Risultati:**
- Classifica finale
- Dettaglio votazioni per fase

**Scopo:** Permettere a atleti e organizzatori di consultare i risultati anche a distanza di tempo, con piena trasparenza sul processo di valutazione.

### 6.3 Gestione Documenti
Sistema di archiviazione organizzata con:
- Percorsi logici e gerarchici
- Possibilità di recupero facile
- Retention permanente
- Backup automatico

---

## 7. FLUSSI OPERATIVI

### 7.1 Preparazione Evento (Direttore)
1. Creazione evento (data, luogo, nome)
2. Configurazione competizioni:
   - Selezione disciplina
   - Selezione categoria (assolo/duo/coppia/gruppo)
   - Definizione sistema di valutazione applicabile
   - Configurazione parametri se Sistema B
3. Registrazione/selezione atleti (da anagrafica o nuovi)
4. Registrazione/selezione giudici (da anagrafica o nuovi)
5. Generazione codici di accesso per giudici
6. Comunicazione codici ai giudici (email, stampa, etc.)

### 7.2 Svolgimento Gara (Giudici + Direttore)

**Giudici:**
1. Accesso con codice temporaneo
2. Visualizzazione competizione assegnata
3. Valutazione secondo sistema:
   - Sistema A: dare X o assegnare ranking
   - Sistema B: assegnare punteggi 1-10 per ogni parametro

**Direttore:**
1. Monitoraggio avanzamento competizioni
2. Decisioni operative (es: numero finalisti, necessità eliminatorie aggiuntive)
3. Consultazione risultati in tempo reale

### 7.3 Conclusione Evento (Direttore + Sistema)
1. Calcolo automatico classifiche finali
2. Generazione PDF con risultati completi
3. Archiviazione documenti
4. Eliminazione manuale codici giudici temporanei (con backup)
5. Chiusura evento

---

## 8. PRINCIPI DI SCALABILITÀ

### 8.1 Configurabilità
- **Discipline:** illimitate, definibili dall'Amministratore
- **Parametri di valutazione:** illimitati, associabili liberamente a discipline
- **Tipologie competizione:** estendibili senza modificare logica core
- **Numero finalisti:** da 6 a N (configurabile per ogni competizione)

### 8.2 Archiviazione
- Struttura dati permite conservazione storico illimitato
- Sistema documentale scalabile per migliaia di atleti/eventi
- Archiviazione documenti gestita con percorsi univoci

---

## 9. DECISIONI APERTE

### 9.1 Generazione Codici Giudici
- **Modalità:** manuale, automatica, o ibrida?
- **Formato:** numerico, alfanumerico, lunghezza?
- **Timing:** alla creazione evento o su richiesta?

### 9.2 Generazione PDF
- **Tecnologia:** client-side o server-side?
- **Template:** design specifico da definire
- **Formato output:** solo PDF o anche altri formati?

### 9.3 Sistema di Notifiche
- Come comunicare codici ai giudici? (email, SMS, stampa?)
- Notifiche real-time durante la gara?

---

## 10. PROSSIMI PASSI

1. ✅ Analisi funzionale completa
2. ⏳ Design schema dati (entità, relazioni, vincoli)
3. ⏳ Definizione sistema di autorizzazione
4. ⏳ Progettazione interfacce utente per ogni ruolo
5. ⏳ Implementazione logica di calcolo Skating System
6. ⏳ Implementazione logica punteggio parametri
7. ⏳ Sistema generazione PDF
8. ⏳ Testing e validazione regole business
