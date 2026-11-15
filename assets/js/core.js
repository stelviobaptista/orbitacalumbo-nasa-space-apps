'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = new Intl.NumberFormat('pt-PT');
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const fx = (n, d = 2) => Number(n).toLocaleString('pt-PT', { maximumFractionDigits: d });
const store = { get(k, d) { try { const v = localStorage.getItem('oc:' + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('oc:' + k, JSON.stringify(v)); } catch { } } };
const isOn = id => $('#' + id)?.classList.contains('on');

async function api(url, opts) {
  let r, d;
  try { r = await fetch(url, opts); } catch { throw new Error('Sem ligação ao servidor. Abre o site por PHP (php -S localhost:8000), não como ficheiro.'); }
  try { d = await r.json(); } catch { throw new Error('O servidor não devolveu dados. O PHP está activo?'); }
  if (!r.ok || d.error) throw new Error(d.error || 'Erro');
  return d;
}
const post = (u, body) => api(u, { method: 'POST', body: JSON.stringify(body) });
const once = fn => { let d = false; return () => { if (!d) { d = true; fn(); } }; };

/* ---------- imagens com fallback ---------- */
window.imgFail = img => {
  if (img.dataset.alt && img.src !== img.dataset.alt) { img.src = img.dataset.alt; img.dataset.alt = ''; }
  else { img.remove(); }
};
const photo = (it, cls = '') => `<img class="${cls}" loading="lazy" src="${esc(it.large)}" data-alt="${esc(it.thumb)}" alt="${esc(it.title)}" onerror="imgFail(this)">`;
const slide = it => `<figure class="slide" style="margin:0"><img class="zoom" loading="lazy" src="${esc(it.large)}" data-alt="${esc(it.thumb)}" data-full="${esc(it.large)}" alt="${esc(it.title)}" onerror="imgFail(this)"><figcaption><small style="color:var(--cyan)">${esc(it.date || '')}</small>${esc(it.title)}</figcaption></figure>`;

/* ---------- lightbox ---------- */
document.addEventListener('click', e => {
  const im = e.target.closest('img.zoom'); if (!im) return;
  $('#lightbox img').src = im.dataset.full || im.src; $('#lightbox').hidden = false;
});
$('#lightbox').onclick = () => { $('#lightbox').hidden = true; };
addEventListener('keydown', e => { if (e.key === 'Escape') $('#lightbox').hidden = true; });

/* ---------- carrossel ---------- */
function carousel(el, auto = 0) {
  const tr = $('.car-track', el), step = () => tr.clientWidth * .8;
  $('.prev', el).onclick = () => tr.scrollBy({ left: -step(), behavior: 'smooth' });
  $('.next', el).onclick = () => tr.scrollBy({ left: step(), behavior: 'smooth' });
  if (auto && !reduced) {
    let hover = false; el.onmouseenter = () => hover = true; el.onmouseleave = () => hover = false;
    setInterval(() => {
      if (hover || document.hidden || !el.offsetParent) return;
      const end = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 6;
      tr.scrollTo({ left: end ? 0 : tr.scrollLeft + step(), behavior: 'smooth' });
    }, auto);
  }
}

/* ---------- separadores ---------- */
function tabs(root) {
  const btns = $$(':scope > button', root); if (!btns.length) return;
  const scope = root.parentElement;
  btns.forEach(b => b.onclick = () => selectTab(root, b.dataset.tab));
}
function selectTab(root, name) {
  $$(':scope > button', root).forEach(x => x.classList.toggle('on', x.dataset.tab === name));
  $$(':scope > .tabpane', root.parentElement).forEach(p => p.classList.toggle('on', p.dataset.pane === name));
  root.dispatchEvent(new CustomEvent('tab', { detail: name }));
}
$$('[data-tabs]').forEach(tabs);

/* ---------- inclinação 3D dos cartões ---------- */
if (!reduced) document.addEventListener('mousemove', e => {
  const c = e.target.closest?.('.tilt'); if (!c) return;
  const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
});
document.addEventListener('mouseout', e => { const c = e.target.closest?.('.tilt'); if (c) c.style.transform = ''; });

/* ---------- campo de estrelas ---------- */
(function () {
  const c = $('#stars'), x = c.getContext('2d'); let w, h, L, mx = 0, my = 0, shoot = null;
  const init = () => {
    w = c.width = innerWidth; h = c.height = innerHeight;
    L = [0, 1, 2].map(i => Array.from({ length: Math.round(w * h / (7000 + i * 3000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * (i + 1) * .55 + .25, t: Math.random() * 6.28 })));
  };
  addEventListener('resize', init); init();
  addEventListener('mousemove', e => { mx = e.clientX / w - .5; my = e.clientY / h - .5; });
  const colors = ['#ffffff', '#bcd3ff', '#ffe3c2'];
  let t = 0;
  (function draw() {
    x.clearRect(0, 0, w, h); t += .02;
    L.forEach((layer, i) => layer.forEach(s => {
      const px = (s.x + mx * -14 * (i + 1) + w) % w, py = (s.y + my * -14 * (i + 1) + h) % h;
      x.globalAlpha = .45 + .55 * Math.abs(Math.sin(t * (.4 + i * .2) + s.t));
      x.fillStyle = colors[i]; x.beginPath(); x.arc(px, py, s.r, 0, 6.3); x.fill();
    }));
    if (!shoot && Math.random() < .004) shoot = { x: Math.random() * w, y: Math.random() * h * .5, l: 0 };
    if (shoot) {
      x.globalAlpha = 1 - shoot.l / 40; const g = x.createLinearGradient(shoot.x, shoot.y, shoot.x - 90, shoot.y - 40);
      g.addColorStop(0, '#fff'); g.addColorStop(1, 'transparent'); x.strokeStyle = g; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(shoot.x, shoot.y); x.lineTo(shoot.x - 90, shoot.y - 40); x.stroke();
      shoot.x += 14; shoot.y += 6; if (++shoot.l > 40) shoot = null;
    }
    if (!reduced) requestAnimationFrame(draw);
  })();
})();

/* ---------- confetti ---------- */
function confetti(px = innerWidth / 2, py = innerHeight / 3, n = 60) {
  if (reduced) return;
  const c = $('#fx'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cols = ['#8b6cff', '#29d3f5', '#ff9a3c', '#ff4f9a', '#3ddc97'];
  const ps = Array.from({ length: n }, () => ({ x: px, y: py, vx: (Math.random() - .5) * 12, vy: -Math.random() * 11 - 3, s: Math.random() * 6 + 3, c: cols[Math.random() * 5 | 0], r: Math.random() * 6 }));
  let f = 0;
  (function step() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += .2; x.fillStyle = p.c; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); x.restore(); });
    if (++f < 110) requestAnimationFrame(step); else x.clearRect(0, 0, c.width, c.height);
  })();
}

/* ---------- router ---------- */
const ROUTES = { inicio: ['inicio'], missoes: ['missoes'], planetas: ['planetas'], laboratorio: ['lab'], viagem: ['viagem'], foto: ['dados', 'foto'], asteroides: ['dados', 'asteroides'], astronomo: ['astronomo'], quiz: ['quiz'] };
const onEnter = {}, onLeave = {}; let curPage = null;
function go() {
  const parts = location.hash.replace('#/', '').split('/'), key = ROUTES[parts[0]] ? parts[0] : 'inicio', [page, tab] = ROUTES[key];
  if (curPage && curPage !== page) onLeave[curPage]?.();
  $$('.page').forEach(p => p.classList.toggle('on', p.id === 'p-' + page));
  $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.p === page));
  $$('#p-' + page + ' .rv').forEach((e, i) => e.style.setProperty('--d', i));
  if (curPage !== page) scrollTo(0, 0);
  curPage = page;
  if (tab) selectTab($('#dadosTabs'), tab);
  onEnter[page]?.(parts[1], tab);
}
addEventListener('hashchange', go);

/* ---------- ecrã de início ---------- */
function endSplash() { const s = $('#splash'); if (!s) return; s.classList.add('done'); setTimeout(() => s.remove(), 900); }
$('#skip').onclick = endSplash;
$('#launch').onclick = () => {
  const s = $('#splash'), c = $('#count'); let n = 3; s.classList.add('go');
  const show = t => { c.textContent = t; c.classList.remove('tick'); void c.offsetWidth; c.classList.add('tick'); };
  show(n);
  const t = setInterval(() => {
    if (--n > 0) return show(n);
    clearInterval(t); show('Decolar!'); s.classList.add('lift'); setTimeout(endSplash, 1500);
  }, 750);
};
