# Test plan delle regole anti-slop

## Stato

Piano completato.

## Obiettivo

Verificare ogni regola in `rules/` con Vitest, usando fixture che devono produrre una segnalazione e fixture simili che non devono produrla.

## Approccio concordato

1. Un file di test per ogni modulo della directory `rules/`.
2. I casi saranno fixture versionate, con una fixture chiara per ogni scenario.
3. I test eseguiranno Oxlint tramite la CLI sulle fixture e leggeranno l'output JSON prodotto con `-f json`.

## Decisioni

### Decisione 1: esecuzione delle regole

I test useranno la CLI di Oxlint contro fixture versionate. In questo modo verificheranno il comportamento reale del plugin, inclusi parser e contesto della regola.

### Decisione 2: formato dell'output

I test useranno l'output JSON di Oxlint (`-f json`) per analizzare i risultati in modo strutturato.

### Decisione 3: isolamento della regola

Ogni esecuzione abiliterà solo la regola testata, usando una configurazione temporanea. I test non dipenderanno dalle segnalazioni prodotte dalle altre regole.

### Decisione 4: aspettativa per il caso non valido

Ogni caso non valido dovrà produrre esattamente una segnalazione con il valore completo atteso nel campo `code` della regola testata, per esempio `anti-slop(require-readable-spacing)`. Il test non vincolerà il messaggio o la posizione della segnalazione.

### Decisione 5: aspettativa per il caso valido

Ogni caso valido dovrà terminare con codice di uscita `0` e produrre un array di diagnostici vuoto.

### Decisione 6: posizione e naming dei test

Ogni test sarà accanto al modulo corrispondente in `rules/`, con il suffisso `.test.ts`. Per esempio: `rules/no-known-value-widening.test.ts`.

### Decisione 7: numero di casi per regola

Ogni file avrà almeno un caso non valido e un caso valido. Potrà includere casi aggiuntivi quando servono per coprire eccezioni o comportamenti importanti della regola.

### Decisione 8: build del plugin

Il comando di test eseguirà automaticamente `npm run build` prima di Vitest, così la CLI userà sempre un plugin compilato e aggiornato.

### Decisione 9: sorgenti dei casi

I casi di test saranno fixture versionate caricate direttamente dal filesystem. Ogni scenario avrà una fixture chiara e i test non genereranno file sorgente temporanei.

### Decisione 10: posizione delle fixture

Le fixture saranno in `tests/fixtures/<nome-regola>/<scenario>.ts`. I test resteranno accanto ai moduli corrispondenti in `rules/`. I test passeranno le fixture direttamente alla CLI.

### Decisione 11: identificazione della regola nell'output

I casi non validi verificheranno il valore completo di `diagnostics[0].code`, incluso il prefisso del plugin, invece di cercare un campo `ruleId` o solo il nome della regola.

### Decisione 12: parte dell'output verificata

I test analizzeranno solo `diagnostics`, verificando numero e `code`, oltre al codice di uscita del processo. Non verificheranno i metadati globali né useranno snapshot dell'intero JSON.

### Decisione 13: esclusione delle fixture

La directory `tests/fixtures/**` sarà esclusa da build, Biome e Oxlint. Le fixture saranno verificate solo dai test che le passano direttamente alla CLI di Oxlint.

### Decisione 14: configurazione temporanea

Ogni file di test creerà una configurazione Oxlint temporanea che abilita solo la regola in esame. La configurazione sarà riutilizzata per tutti gli scenari della suite e cancellata alla fine.

## Decisioni ancora da prendere

Nessuna.

