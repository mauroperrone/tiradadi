# Tiradadi

Dice roller per D&D 5e, installabile come app (PWA) e utilizzabile offline.

- Pool di dadi d4–d100, modificatore, notazione tipo `2d6+3`, `4d6kh3`, `4d6dl1`, `d%`
- Vantaggio / svantaggio sui d20, danni critici, statistiche 4d6 ×6
- Tiri rapidi salvati e storico (salvati nel browser del dispositivo)

## Installazione
Apri la pagina GitHub Pages del repo, poi:
- **iPhone**: Safari → Condividi → Aggiungi alla schermata Home
- **Android**: Chrome → menu ⋮ → Installa app

Aprila una volta online finché in alto compare "pronto offline".

## Aggiornare
- `index.html` si aggiorna da solo: l'app scarica la nuova versione in background e la mostra dall'apertura successiva.
- Se cambi icone, manifest o `sw.js`, alza `VERSION` in `sw.js`.
