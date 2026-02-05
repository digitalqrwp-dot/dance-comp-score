# Paradigma Services: DanceScore (AX09)

## Architettura
I servizi sono l'unico punto di contatto con Supabase. Implementano il principio **Masterpiece** di granularità (AX02).

## Assiomi Applicati
- **AX02**: FK specifiche, nessuna logica polimorfica.
- **AX07**: Ogni entità operativa traccia stati, importi e date.
- **AX05**: Ogni funzione deve essere utile all'operatore, matematicamente coerente e logicamente integrata.

## Rischi
L'inserimento di dati "temporanei" (es. TEMP tax_id) è una violazione grave del paradigma di anagrafica permanente.
