/**
 * Exit-Readiness-Check · Speicherung in Google Sheets (Ersatz/Ergänzung zu Close).
 * Einrichtung: Google Sheet anlegen → Erweiterungen → Apps Script → diesen Code einfügen →
 * Bereitstellen → Web-App (Ausführen als: ich, Zugriff: jeder) → URL in config.js bei `endpoint` eintragen.
 *
 * Sonderfälle:
 *  - Doppelte Einträge: gleiche E-Mail = bestehende Zeile wird aktualisiert, Spalte „Versuche“ +1, kein zweiter Lead.
 *  - Fehlende Felder: ohne E-Mail oder Telefon wird nichts gespeichert, Fehler landet im Blatt „Fehler“.
 *  - Benachrichtigung: Typ A (oder Score ≥ 70) → E-Mail an den Vertrieb.
 *  - Absturz/Timeout: jeder Fehler wird mit Zeitstempel und Rohdaten im Blatt „Fehler“ protokolliert.
 */
const SALES_EMAIL = 'sasa-aleksic@hotmail.com'; // Testadresse anpassen
// Nur nötig, wenn das Skript über script.google.com (nicht über die Tabelle) angelegt wurde:
// ID aus der Tabellen-URL zwischen /d/ und /edit einfügen.
const SHEET_ID = '1qC7qn4LjbRSQIKY2ksScr-jZQw3wKuPsNdvN6eHr5Uw';
const HEADERS = ['Zeitpunkt', 'Erstkontakt', 'Versuche', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Website',
  'Umsatz', 'Rolle', 'Zeithorizont', 'Ohne Inhaber', 'Größter Kunde', 'Zahlen', 'Dokumentation',
  'Typ', 'Score', 'Qualifikation', 'Handlungsbedarf', 'Schwachstellen', 'Quelle', 'Kampagne', 'Status'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // verhindert doppelte Zeilen bei gleichzeitigen Anfragen
    const d = JSON.parse(e.postData.contents);
    if (!d.email || !d.telefon) throw new Error('Pflichtfeld fehlt (E-Mail oder Telefon)');
    const sh = sheet_('Leads', HEADERS);
    const email = String(d.email).trim().toLowerCase();
    const a = {}; (d.antworten || []).forEach(x => a[x.frage] = x.antwort);
    const row = [d.zeitpunkt || new Date().toISOString(), '', 1, d.vorname, d.nachname, email, "'" + d.telefon, d.website || '',
      a.umsatz, a.rolle, a.zeithorizont, a.ohne_inhaber, a.kunde, a.zahlen, a.doku,
      d.typ, d.score, d.quali, d.bedarf, (d.schwachstellen || []).join(' | '),
      d.quelle || 'direkt', (d.utm && d.utm.utm_campaign) || '', d.typ === 'C' ? 'Nurture' : 'Neu – qualifiziert'];

    const emails = sh.getRange(2, 6, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => String(r[0]).toLowerCase());
    const idx = emails.indexOf(email);
    if (idx > -1) {
      const r = idx + 2;
      const old = sh.getRange(r, 1, 1, HEADERS.length).getValues()[0];
      row[1] = old[1] || old[0];          // Erstkontakt bleibt
      row[2] = Number(old[2] || 1) + 1;   // Versuche +1
      sh.getRange(r, 1, 1, HEADERS.length).setValues([row]);
    } else {
      row[1] = row[0];
      sh.appendRow(row);
    }
    if (d.typ === 'A' || Number(d.score) >= 70) notify_(d, idx > -1);
    return json_({ ok: true, duplicate: idx > -1 });
  } catch (err) {
    sheet_('Fehler', ['Zeitpunkt', 'Fehler', 'Rohdaten']).appendRow([new Date(), String(err), e && e.postData ? e.postData.contents : '']);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function notify_(d, dup) {
  const subject = `${dup ? '[erneut] ' : ''}Typ ${d.typ} · Score ${d.score} · ${d.vorname} ${d.nachname}`;
  const body = [
    `Neuer qualifizierter Lead aus dem Exit-Readiness-Check${dup ? ' (hat den Check erneut gemacht)' : ''}.`, '',
    `Name: ${d.vorname} ${d.nachname}`, `E-Mail: ${d.email}`, `Telefon: ${d.telefon}`, `Website: ${d.website || '–'}`, '',
    'Antworten:', ...(d.antworten || []).map(x => `• ${x.frage}: ${x.antwort}`), '',
    `Schwachstellen: ${(d.schwachstellen || []).join(', ') || '–'}`, `Quelle: ${d.quelle || 'direkt'}`, '',
    'Nächster Schritt: innerhalb von 24 h anrufen, falls kein Termin gebucht wurde.'].join('\n');
  MailApp.sendEmail(SALES_EMAIL, subject, body);
}

function sheet_(name, headers) {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
