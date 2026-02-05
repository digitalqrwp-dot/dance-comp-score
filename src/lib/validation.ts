/**
 * Utility per la validazione del Codice Fiscale Italiano
 * Supporta Omocodia e validazione formale
 */

export const validateItalianTaxId = (cf: string): boolean => {
    if (!cf || cf.length !== 16) return false;

    const cfUpper = cf.toUpperCase();

    // 1. Validazione Formale (Regex)
    // [A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]
    const cfRegex = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;
    if (!cfRegex.test(cfUpper)) return false;

    // 2. Calcolo Carattere di Controllo (Checksum)
    const setPari: Record<string, number> = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
        'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18,
        'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
    };

    const setDispari: Record<string, number> = {
        '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
        'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
        'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
        'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
    };

    const omocodiaSubs: Record<string, string> = {
        'L': '0', 'M': '1', 'N': '2', 'P': '3', 'Q': '4', 'R': '5', 'S': '6', 'T': '7', 'U': '8', 'V': '9'
    };

    let sum = 0;
    for (let i = 0; i < 15; i++) {
        let char = cfUpper[i];
        // Se è un carattere di omocodia, convertiamolo per il calcolo
        if (i === 6 || i === 7 || i === 9 || i === 10 || i === 12 || i === 13 || i === 14) {
            if (char >= 'L' && char <= 'V') char = omocodiaSubs[char];
        }

        if ((i + 1) % 2 === 0) {
            sum += setPari[char];
        } else {
            sum += setDispari[char];
        }
    }

    const checkChar = String.fromCharCode((sum % 26) + 65);
    return checkChar === cfUpper[15];
};
