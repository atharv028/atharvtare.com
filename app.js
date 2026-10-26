/* Two live pieces: a trace of the visitor's own page load (Navigation Timing),
   and a downloadable contact card. Everything else is static HTML. */

const $ = (s) => document.querySelector(s);
const ms = (n) => (n < 1 ? '<1 ms' : `${Math.round(n)} ms`);

// Force a layout first so the bars animate from zero. requestAnimationFrame
// would be simpler, but it never fires in a tab that isn't painting.
function draw(list) {
  void list.offsetWidth;
  list.classList.add('is-drawn');
}

function traceVisit() {
  if (!$('#visitSpans')) return;
  const nav = performance.getEntriesByType('navigation')[0];
  if (!nav) { $('#traceTotal').textContent = 'not supported in this browser'; return; }
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
  const end = Math.max(nav.loadEventEnd, fcp || 0);

  const spans = [
    ['Look up the address', nav.domainLookupStart, nav.domainLookupEnd],
    ['Open a connection', nav.connectStart, nav.connectEnd],
    ['Wait for the server', nav.requestStart, nav.responseStart],
    ['Download the page', nav.responseStart, nav.responseEnd],
    ['Build the page', nav.responseEnd, nav.domContentLoadedEventEnd],
    ['First paint on your screen', 0, fcp ?? nav.domInteractive],
  ];

  $('#visitSpans').innerHTML = spans.map(([name, a, b], i) => {
    const x = (a / end) * 100;
    const w = Math.max(((b - a) / end) * 100, 0.4);
    return `<li class="span" style="--x:${x.toFixed(2)};--w:${w.toFixed(2)};--i:${i}">
      <div><span class="span__name">${name}</span><span class="span__track"><i></i></span><span class="span__meta">${ms(b - a)}</span></div></li>`;
  }).join('');
  $('#visitSpans').classList.add('spans--visit');
  $('#traceTotal').textContent = `${ms(end)} in total`;

  // transferSize is 0 for cached files, so fall back to the file's own size.
  const size = (e) => e.transferSize || e.encodedBodySize || 0;
  const bytes = performance.getEntriesByType('resource').reduce((n, r) => n + size(r), size(nav));
  const kb = Math.max(1, Math.round(bytes / 1024));
  // Cached repeat visits can report almost nothing; only quote a weight that's believable.
  $('#pageStats').textContent = bytes > 8 * 1024
    ?`For you it weighed ${kb} KB and painted in ${ms(fcp ?? nav.domInteractive)}.`
    : `For you it painted in ${ms(fcp ?? nav.domInteractive)}.`;

  document.querySelectorAll('.spans').forEach(draw);
}

/* Work page: place each role on a month axis from data-start / data-end ("YYYY-MM" or "now"). */
function traceCareer() {
  const list = $('#career');
  if (!list) return;
  const month = (s) => {
    const d = s === 'now' ? new Date() : new Date(`${s}-01`);
    return d.getFullYear() * 12 + d.getMonth();
  };
  const from = month(list.dataset.from);
  const to = month('now') + 1;
  const span = to - from;

  list.querySelectorAll('.span').forEach((li, i) => {
    const a = month(li.dataset.start) - from;
    const b = month(li.dataset.end) - from + 1; // end month is inclusive
    li.style.setProperty('--x', ((a / span) * 100).toFixed(2));
    li.style.setProperty('--w', (((b - a) / span) * 100).toFixed(2));
    li.style.setProperty('--i', i);
    const dur = li.querySelector('[data-duration]');
    if (dur) {
      const m = b - a;
      const y = Math.floor(m / 12), r = m % 12;
      dur.textContent = [y && `${y} year${y > 1 ? 's' : ''}`, r && `${r} month${r > 1 ? 's' : ''}`].filter(Boolean).join(' ') + ', ongoing';
    }
  });

  const firstYear = Math.ceil(from / 12);
  $('#careerAxis').innerHTML = Array.from({ length: Math.floor((to - 1) / 12) - firstYear + 1 }, (_, k) => {
    const yr = firstYear + k;
    return `<span style="left:${(((yr * 12) - from) / span * 100).toFixed(2)}%">${yr}</span>`;
  }).join('');

  draw(list);
}

function saveContact() {
  const card = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Tare;Atharv;;;',
    'FN:Atharv Tare',
    'TITLE:Software engineer (frontend\\, backend\\, DevOps)',
    'EMAIL;TYPE=INTERNET:hire.atharv@gmail.com',
    'URL:https://linkedin.com/in/atharv-tare',
    'URL:https://github.com/atharv028',
    'ADR;TYPE=WORK:;;;Delhi;;;India',
    'NOTE:Builds interfaces\\, APIs and cloud infrastructure on AWS and GCP.',
    'END:VCARD',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([card], { type: 'text/vcard' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'Atharv-Tare.vcf' });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelectorAll('[data-vcard]').forEach((b) => b.addEventListener('click', saveContact));
$('#year').textContent = new Date().getFullYear();
traceCareer();

if (document.readyState === 'complete') setTimeout(traceVisit, 0);
else addEventListener('load', () => setTimeout(traceVisit, 0));

console.log('%cYou opened the console. I like you already. hire.atharv@gmail.com', 'font: 600 14px sans-serif');
