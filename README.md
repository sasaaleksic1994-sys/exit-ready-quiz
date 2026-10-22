# Exit Ready · Exit-Readiness-Check (Testjob Funnelbau)

Landingpage mit Quiz (7 Fragen mit Lern-Satz, Kontakt am Ende) und Ergebnisseite mit drei Ergebnis-Typen. Statisches HTML/CSS/JS, keine Build-Schritte.

| Datei | Inhalt |
|---|---|
| `index.html` | Landingpage: Hero, Proof, Multiplikator-Rechner, Käuferpunkte, Quiz, Ablauf, Stimmen, FAQ, Schluss-CTA |
| `ergebnis.html` | Ergebnisseite Typ A / B / C mit den 2–3 größten Schwachstellen |
| `quiz-data.js` | Fragen, Lern-Sätze, Punkte und `evaluate()` (Typ + Score) |
| `app.js` | Quiz-Ablauf, Validierung, Honeypot, UTM, Versand an Apps Script |
| `config.js` | Endpoint (Apps Script), Kalender-, Report- und Videokurs-Link |
| `apps-script/Code.gs` | Speicherung im Google Sheet mit Duplikat-Schutz, Fehler-Log, Vertriebs-Mail |

**Lokal testen:** `python3 -m http.server` im Ordner, dann `http://localhost:8000`. Ergebnisseite direkt ansehen: `ergebnis.html?typ=A` (bzw. B, C).

**Speicherung aktivieren:** Apps Script als Web-App bereitstellen, URL in `config.js` → `endpoint`. Ohne Endpoint läuft die Seite im Demo-Modus (Ergebnis wird angezeigt, nichts gespeichert).

Scoring-Logik, Sonderfälle und Zap: `../Scoring_und_Automation.md` · Flowchart: `../Flowchart_Exit_Ready.png`

Testprojekt / Konzeptseite für einen Bewerbungs-Testjob, kein offizieller Auftritt von Exit Ready. Nur Testdaten verwenden.
