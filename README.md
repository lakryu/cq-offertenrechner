# Offertenrechner

Offerten-Rechner nach der Preisliste Dienstleistungen 2024. Reine statische Webseite (HTML/CSS/JS, ohne Build, ohne Abhängigkeiten) und läuft deshalb direkt auf **GitHub Pages**.

## Bedienung

1. Links ein Produkt wählen (oder suchen mit `/`).
2. Werte eingeben, der Preis wird sofort berechnet. Bei den Feldern stehen die Preisstufen
   (aktive Stufe hervorgehoben, ein Klick darauf übernimmt die Menge) und Zuschläge.
3. Mit **Enter** oder «Zur Offerte hinzufügen» übernehmen.
4. Rechts Rabatt und Lieferung erfassen, dann **Drucken / PDF**.

- Positionen lassen sich bearbeiten, duplizieren, verschieben und umbenennen (Titel anklicken).
- Die aktuelle Offerte bleibt im Browser erhalten, bis sie mit «Leeren» zurückgesetzt wird.
- Der Endbetrag wird auf 5 Rappen gerundet. Die enthaltene MwSt wird ausgewiesen.

## Preise anpassen

**Variante A, im Browser (ohne Programmierkenntnisse):**
Tab *Preise*, Werte ändern (gilt sofort im eigenen Browser), dann **preise.js herunterladen** und die Datei `preise.js` im GitHub-Repository ersetzen (auf GitHub: Datei öffnen, Stift-Symbol, oder «Add file → Upload files»). Danach gelten die Preise für alle.

**Variante B, direkt in `preise.js`:**
Alle Preise stehen in dieser einen Datei. Tabellen sind so aufgebaut:

```js
"zeilen": [
  [20,   1.20, 2.20],   // bis 20 Stück
  [50,   1.00, 2.00],   // bis 50 Stück
  [null, 0.35, 0.70]    // null = und mehr
]
```

Neue Artikel (z. B. unter «Material & Zubehör») einfach als weitere Zeile hinzufügen. Sie erscheinen automatisch im Rechner.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Seite |
| `style.css` | Gestaltung (inkl. Druck-Layout der Offerte) |
| `preise.js` | **Alle Preise**, Firmenangaben, MwSt-Satz, Rundung |
| `produkte.js` | Eingabefelder, Rechenregeln und Preis-Infos pro Produkt |
| `app.js` | Oberfläche, Offerte, Druck, Preis-Editor |

Ein neues Produkt mit eigener Logik wird in `produkte.js` als weiterer Eintrag ergänzt (Felder + `rechne`-Funktion).

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf GitHub erstellen (z. B. `offertenrechner`, auf Wunsch *Private*, Pages für private Repos braucht aber ein kostenpflichtiges Konto).
2. Den Inhalt dieses Ordners hochladen (oder per Git pushen):
   ```bash
   cd offertenrechner
   git init && git add . && git commit -m "Offertenrechner"
   git branch -M main
   git remote add origin https://github.com/BENUTZER/offertenrechner.git
   git push -u origin main
   ```
3. Im Repository: **Settings → Pages → Source: «Deploy from a branch» → Branch `main` / `(root)`** → Save.
4. Nach etwa einer Minute ist der Rechner unter `https://BENUTZER.github.io/offertenrechner/` erreichbar.

Hinweis: Eine öffentliche GitHub-Pages-Seite kann jeder mit dem Link aufrufen. Eingaben bleiben nur im jeweiligen Browser und werden nie an einen Server gesendet.

Lokal testen: `index.html` direkt im Browser öffnen funktioniert ebenfalls.

## Annahmen bei unklaren Stellen der Preisliste

- **S/W-Kopien:** Zwischen zwei Tabellenwerten wird linear interpoliert. Über 1000 Kopien: 94.40 + 8.00 pro weitere 100.
- **Gesamtpreis-Tabellen** (Visitenkarten, Broschüren, Falzen, Zusammentragen, Heften, Durchschreibesätze): Es gilt die nächsthöhere Auflage. Über dem Tabellenende wird hochgerechnet und ein Hinweis angezeigt.
- **Durchschreibesätze 501–999:** wörtlich nach Preisliste «Preis 1000 + 20 %».
- **Rillen maschinell:** pro angefangene 100 Stück.
- **Papier weiss «30 gm2 satiniert» (125 Bl.)** wurde als 300 g/m² interpretiert.
- **Grafikplot A3/A2:** Materialzuschlag mit der A2-Fläche gerechnet.
