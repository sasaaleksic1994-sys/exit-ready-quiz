// Fragen, Lern-Sätze und Scoring des Exit-Readiness-Checks.
// Texte 1:1 aus Copywriting_Exit_Ready.docx. Scoring-Begründung: siehe Scoring-Logik.md.
window.QUIZ = {
  questions: [
    {
      id: 'umsatz', title: 'Wie hoch ist Ihr Jahresumsatz?',
      learn: 'Die Größe entscheidet, welche Käufer überhaupt an den Tisch kommen: vom Unternehmer bis zum Finanzinvestor. Jede Gruppe rechnet anders.',
      options: [
        { label: 'Unter 1 Mio. €', q: 0, gate: true },
        { label: '1 bis 2 Mio. €', q: 15 },
        { label: '2 bis 10 Mio. €', q: 25 },
        { label: '10 bis 50 Mio. €', q: 30 },
        { label: 'Über 50 Mio. €', q: 30 },
      ],
    },
    {
      id: 'rolle', title: 'Welche Rolle haben Sie?',
      learn: 'Wer die Mehrheit hält, bestimmt Zeitpunkt und Bedingungen selbst. Alle anderen brauchen die Zustimmung der Gesellschafter.',
      options: [
        { label: 'Alleininhaber', q: 20 },
        { label: 'Mehrheitsgesellschafter', q: 20 },
        { label: 'Minderheitsgesellschafter', q: 0, gate: true },
        { label: 'Geschäftsführer ohne Anteile', q: 0, gate: true },
      ],
    },
    {
      id: 'zeithorizont', title: 'Wann möchten Sie verkaufen oder die Option dazu haben?',
      learn: 'Viele Werthebel brauchen Vorlauf: mindestens ein Jahr, idealerweise zwei bis fünf. Wer erst im Verkauf beginnt, kann sie nicht mehr ziehen.',
      options: [
        { label: 'Es liegt bereits ein Angebot vor', q: 20, urgent: true },
        { label: 'In 12 Monaten', q: 20, urgent: true },
        { label: 'In 1 bis 3 Jahren', q: 15, urgent: true },
        { label: 'In 3 bis 7 Jahren', q: 10 },
        { label: 'Noch offen', q: 5 },
      ],
    },
    {
      id: 'ohne_inhaber', title: 'Würde Ihr Tagesgeschäft drei Monate ohne Sie laufen?',
      learn: 'Hängt der Betrieb an Ihnen, sieht der Käufer ein Risiko. Er antwortet darauf mit einem Abschlag oder damit, dass Sie noch Jahre bleiben müssen.',
      weak: 'Abhängigkeit von Ihnen als Inhaber',
      options: [
        { label: 'Ja, problemlos', r: 0 },
        { label: 'Mit Einschränkungen', r: 4 },
        { label: 'Eher nicht', r: 7 },
        { label: 'Nein', r: 8 },
      ],
    },
    {
      id: 'kunde', title: 'Wie viel Umsatz macht Ihr größter Kunde aus?',
      learn: 'Ein Käufer fragt sofort: Was passiert, wenn dieser Kunde wegbricht? Je größer der Anteil, desto tiefer rechnet er den Multiplikator.',
      weak: 'Klumpenrisiko beim größten Kunden',
      options: [
        { label: 'Unter 10 %', r: 0 },
        { label: '10 bis 20 %', r: 3 },
        { label: '20 bis 40 %', r: 6 },
        { label: 'Über 40 %', r: 8 },
      ],
    },
    {
      id: 'zahlen', title: 'Wie sind Ihre Zahlen aufbereitet?',
      learn: 'Der Käufer rechnet mit dem Gewinn, den er anerkennt. Inhabergehalt, Firmenwagen und Einmaleffekte sollten Sie bereinigen, bevor er sie findet.',
      weak: 'Nicht bereinigte Zahlen',
      options: [
        { label: 'Bereinigt, mit Planung für die nächsten Jahre', r: 0 },
        { label: 'Aktuelle Jahresabschlüsse, nicht bereinigt', r: 4 },
        { label: 'Teilweise veraltet', r: 6 },
        { label: 'Weiß ich nicht genau', r: 7 },
      ],
    },
    {
      id: 'doku', title: 'Sind Prozesse und Verträge dokumentiert?',
      learn: 'Was Sie nicht belegen können, kann ein Käufer nicht prüfen. Und was er nicht prüfen kann, zieht er vom Preis ab.',
      weak: 'Fehlende Dokumentation',
      options: [
        { label: 'Ja, vollständig', r: 0 },
        { label: 'Teilweise', r: 4 },
        { label: 'Vor allem in meinem Kopf', r: 7 },
      ],
    },
  ],

  // Typ A/B/C + Score (0–100) aus den Antworten (Index je Frage)
  evaluate(answers) {
    const qs = this.questions;
    let quali = 0, bedarf = 0, gate = false, urgent = false;
    const weak = [];
    qs.forEach((q, i) => {
      const o = q.options[answers[i]];
      if (!o) return;
      quali += o.q || 0;
      bedarf += o.r || 0;
      if (o.gate) gate = true;
      if (o.urgent) urgent = true;
      if (q.weak && (o.r || 0) >= 4) weak.push({ title: q.weak, text: q.learn, r: o.r });
    });
    weak.sort((a, b) => b.r - a.r);
    const typ = gate ? 'C' : urgent ? 'A' : 'B';
    // Qualifikation max. 70, Handlungsbedarf max. 30 (Summe der Readiness-Punkte, gedeckelt)
    const score = Math.min(70, quali) + Math.min(30, bedarf);
    return { typ, score, quali, bedarf, weak: weak.slice(0, 3) };
  },
};
