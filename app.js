(function () {
  const cfg = window.FUNNEL_CONFIG || {};
  const Q = window.QUIZ;

  // Scroll-Reveal
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Multiplikator-Rechner
  const fmt = (n) => n >= 1e6 ? (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio. €' : Math.round(n / 1000).toLocaleString('de-DE') + '.000 €';
  const range = document.getElementById('gewinn');
  const calc = () => {
    const g = +range.value;
    document.getElementById('gewinnOut').textContent = fmt(g);
    document.getElementById('low').textContent = fmt(g * 3);
    document.getElementById('high').textContent = fmt(g * 8);
    document.getElementById('diff').textContent = fmt(g * 5);
  };
  if (range) { range.addEventListener('input', calc); calc(); }

  // UTM / Quelle merken (erster Kontakt)
  const params = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid', 'gclid', 'li_fat_id'].forEach((k) => { if (params.get(k)) utm[k] = params.get(k); });
  try { if (Object.keys(utm).length && !sessionStorage.getItem('er_utm')) sessionStorage.setItem('er_utm', JSON.stringify(utm)); } catch (e) {}

  // Quiz
  const stage = document.getElementById('stage');
  const bar = document.getElementById('bar');
  const label = document.getElementById('stepLabel');
  const total = Q.questions.length;
  const answers = [];
  let step = 0;

  function setProgress() {
    bar.style.width = Math.round((step / (total + 1)) * 100) + '%';
    label.textContent = step < total ? `Frage ${step + 1} von ${total}` : 'Letzter Schritt';
  }

  function renderQuestion() {
    setProgress();
    const q = Q.questions[step];
    const sel = answers[step];
    stage.innerHTML = `
      <h3 class="q-title">${q.title}</h3>
      <div class="opts">${q.options.map((o, i) => `<button type="button" class="opt${sel === i ? ' sel' : ''}" data-i="${i}">${o.label}</button>`).join('')}</div>
      <div id="learnBox">${sel !== undefined ? learnHtml(q) : ''}</div>
      <div class="q-nav">
        ${step > 0 ? '<button type="button" class="back" id="back">Zurück</button>' : '<span></span>'}
        <button type="button" class="btn" id="next" ${sel === undefined ? 'disabled' : ''}>${step === total - 1 ? 'Zur Auswertung' : 'Weiter'}</button>
      </div>`;
    stage.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
      answers[step] = +b.dataset.i;
      stage.querySelectorAll('.opt').forEach((x) => x.classList.toggle('sel', x === b));
      document.getElementById('learnBox').innerHTML = learnHtml(q);
      document.getElementById('next').disabled = false;
    }));
    const back = document.getElementById('back');
    if (back) back.addEventListener('click', () => { step--; renderQuestion(); });
    document.getElementById('next').addEventListener('click', () => { step++; step < total ? renderQuestion() : renderContact(); });
  }

  const learnHtml = (q) => `<div class="learn"><b>Worauf ein Käufer schaut</b>${q.learn}</div>`;

  function renderContact() {
    setProgress();
    stage.innerHTML = `
      <h3 class="q-title">Wohin dürfen wir Ihre Auswertung senden?</h3>
      <form class="form" id="contactForm" novalidate>
        <div><label for="vorname">Vorname</label><input type="text" id="vorname" name="vorname" autocomplete="given-name" required></div>
        <div><label for="nachname">Nachname</label><input type="text" id="nachname" name="nachname" autocomplete="family-name" required></div>
        <div class="full"><label for="email">E-Mail</label><input type="email" id="email" name="email" autocomplete="email" required></div>
        <div class="full"><label for="telefon">Telefon <span style="font-weight:400">(nur für Rückfragen zu Ihrer Auswertung)</span></label><input type="tel" id="telefon" name="telefon" autocomplete="tel" required></div>
        <div class="full"><label for="website">Firmen-Website <span style="font-weight:400">(optional)</span></label><input type="url" id="website" name="website" placeholder="firma.de"></div>
        <input class="hp" type="text" name="fax" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="consent full"><input type="checkbox" id="consent" required> Ich bin einverstanden, dass Exit Ready meine Angaben zur Auswertung und Kontaktaufnahme verarbeitet. Vertraulich, keine Weitergabe.</label>
        <div class="err full" id="err"></div>
        <div class="full q-nav"><button type="button" class="back" id="back">Zurück</button><button class="btn" type="submit" id="send">Auswertung anzeigen</button></div>
      </form>`;
    document.getElementById('back').addEventListener('click', () => { step = total - 1; renderQuestion(); });
    document.getElementById('contactForm').addEventListener('submit', submit);
  }

  const TRASH = ['mailinator.com', 'wegwerfmail.de', 'trashmail.de', 'yopmail.com', '10minutemail.com', 'guerrillamail.com', 'tempmail.com'];

  async function submit(ev) {
    ev.preventDefault();
    const f = ev.target; const err = document.getElementById('err');
    const v = (n) => (f.elements[n].value || '').trim();
    if (f.elements.fax.value) return; // Honeypot: Bot
    const email = v('email').toLowerCase();
    const phone = v('telefon').replace(/[^\d+]/g, '');
    if (v('vorname').length < 2 || v('nachname').length < 2) return (err.textContent = 'Bitte geben Sie Vor- und Nachnamen ein.');
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return (err.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    if (TRASH.includes(email.split('@')[1])) return (err.textContent = 'Bitte nutzen Sie eine dauerhafte E-Mail-Adresse.');
    if (phone.replace('+', '').length < 7) return (err.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein.');
    if (!document.getElementById('consent').checked) return (err.textContent = 'Bitte bestätigen Sie die Einwilligung.');
    err.textContent = '';

    const res = Q.evaluate(answers);
    let storedUtm = {}; try { storedUtm = JSON.parse(sessionStorage.getItem('er_utm') || '{}'); } catch (e) {}
    const payload = {
      zeitpunkt: new Date().toISOString(),
      vorname: v('vorname'), nachname: v('nachname'), email, telefon: phone, website: v('website'),
      antworten: Q.questions.map((q, i) => ({ frage: q.id, antwort: q.options[answers[i]].label })),
      typ: res.typ, score: res.score, quali: res.quali, bedarf: res.bedarf,
      schwachstellen: res.weak.map((w) => w.title),
      quelle: storedUtm.utm_source || 'direkt', utm: storedUtm,
      seite: location.href,
    };
    const btn = document.getElementById('send'); btn.disabled = true; btn.textContent = 'Wird ausgewertet …';
    if (cfg.endpoint) {
      try {
        await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      } catch (e) {
        // Speichern fehlgeschlagen: Ergebnis trotzdem zeigen, Lead lokal puffern
        try { localStorage.setItem('er_pending_' + Date.now(), JSON.stringify(payload)); } catch (x) {}
      }
    }
    try { sessionStorage.setItem('er_result', JSON.stringify({ vorname: payload.vorname, ...res })); } catch (e) {}
    location.href = 'ergebnis.html';
  }

  if (stage) renderQuestion();
})();
