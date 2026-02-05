# Paradigma Contexts: DanceScore (AX09)

## Architettura
I contesti in DanceScore seguono il principio **Data-Driven (AX00)**. Non devono contenere logica di business cablata, ma agire come distributori di stato derivato dal database.

## Assiomi Applicati
- **AX01**: Sincronizzazione innescata solo da azioni utente.
- **AX06**: Stato inizializzato dal contesto esistente (Context-First).
- **AX04**: Esposizione di dati "Layered" per visualizzazioni simultanee.

## Rischi
Modifiche senza consultazione del database schema possono rompere la coerenza Real-time e la compliance dei verbali.
