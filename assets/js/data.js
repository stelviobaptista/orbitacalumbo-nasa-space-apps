'use strict';
/* ============ INÍCIO ============ */
onEnter.inicio = once(async () => {
  api('api/apod.php?back=0').then(d => { $('#liveApod').textContent = d.title; }).catch(() => { $('#liveApod').textContent = 'Indisponível agora'; });
  api('api/asteroides.php?date=' + isoDay(0)).then(d => {
    $('#liveNeo').textContent = d.total + ' asteroides';
    $('#liveNear').textContent = d.items[0] ? `${nf.format(d.items[0].miss_moon)}× a distância à Lua` : '—';
  }).catch(() => { $('#liveNeo').textContent = $('#liveNear').textContent = 'Indisponível agora'; });
  const qs = ['Hubble nebula', 'James Webb deep field', 'Mars Perseverance rover', 'Saturn Cassini', 'Earth from space station', 'Apollo moon surface'];
  const res = await Promise.all(qs.map(q => api('api/imagens.php?n=2&q=' + encodeURIComponent(q)).catch(() => [])));
  const items = res.flatMap(r => r.slice(0, 2));
  $('#homeTrack').innerHTML = items.length ? items.map(slide).join('') : '<p class="lead">As imagens da NASA não carregaram. Verifica a ligação à internet do servidor.</p>';
  carousel($('#homeCar'), 4500);
});
function isoDay(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return d.toLocaleDateString('sv-SE'); }

/* ============ FOTO DO DIA ============ */
let apodBack = 0, apodCtx = '';
async function loadApod(back) {
  apodBack = Math.max(0, back); $('#apodLoad').hidden = false; $('#apodImg').hidden = true; $('#apodDate').textContent = 'A carregar…';
  try {
    const d = await api('api/apod.php?back=' + apodBack);
    const img = d.media_type === 'video' ? d.thumbnail_url : (d.hdurl || d.url);
    const el = $('#apodImg'); el.src = img; el.dataset.full = img; el.alt = d.title; el.hidden = false;
    el.onerror = () => { if (d.url && el.src !== d.url) el.src = d.url; };
    $('#apodDate').textContent = d.date + (d.copyright ? ' · © ' + d.copyright.trim().replace(/\n/g, ' ') : '');
    $('#apodTitle').textContent = d.title; $('#apodText').textContent = d.explanation;
    const b = $('#apodBadge'); b.hidden = false;
    b.textContent = d.translated ? 'Texto traduzido para português por IA' : 'Texto original em inglês (a tradução precisa de uma chave de IA)';
    const hd = $('#apodHD'); hd.hidden = false; hd.href = d.media_type === 'video' ? d.url : (d.hdurl || d.url); hd.textContent = d.media_type === 'video' ? 'Ver vídeo' : 'Abrir em alta resolução';
    apodCtx = d.title + '. ' + d.explanation;
  } catch (e) { $('#apodDate').textContent = e.message; $('#apodTitle').textContent = ''; $('#apodText').textContent = ''; }
  $('#apodLoad').hidden = true; $('#apodNext').disabled = apodBack === 0;
}
$('#apodPrev').onclick = () => loadApod(apodBack + 1);
$('#apodNext').onclick = () => loadApod(apodBack - 1);
$('#apodExplain').onclick = () => { $('#useCtx').checked = true; location.hash = '#/astronomo'; setTimeout(() => ask('Explica-me a foto do dia de forma simples.'), 300); };
const initFoto = once(async () => {
  loadApod(0);
  try {
    const items = await api('api/apod.php?range=10');
    $('#galTrack').innerHTML = items.map(it => `<button class="slide" data-back="${it.back}"><img loading="lazy" src="${esc(it.img)}" alt="${esc(it.title)}" onerror="imgFail(this)"><span class="cap"><small>${esc(it.date)}</small>${esc(it.title)}</span></button>`).join('');
    $$('#galTrack .slide').forEach(b => b.onclick = () => { loadApod(+b.dataset.back); selectTab($('#fotoTabs'), 'hoje'); scrollTo({ top: 0, behavior: 'smooth' }); });
  } catch (e) { $('#galTrack').innerHTML = `<p class="lead">${esc(e.message)}</p>`; }
  carousel($('#galCar'));
});

/* ============ ASTEROIDES ============ */
const neoCache = {};
function radar(items) {
  const R = ld => Math.min(190, 28 + 72 * Math.log10(1 + ld));
  let s = `<defs><radialGradient id="eg"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#2f6fde"/></radialGradient></defs>`;
  [1, 5, 20, 100].forEach(l => s += `<circle class="ring-l" r="${R(l)}"/><text x="${R(l) + 3}" y="-3">${l}×</text>`);
  s += '<g class="rot">';
  items.forEach((a, i) => {
    const ang = (i * 137.5) * Math.PI / 180, r = R(a.miss_moon), sz = Math.max(2.5, Math.min(9, Math.sqrt(a.diameter_m) / 3));
    s += `<circle class="rock ${a.hazard ? 'hz' : ''}" cx="${(Math.cos(ang) * r).toFixed(1)}" cy="${(Math.sin(ang) * r).toFixed(1)}" r="${sz.toFixed(1)}"><title>${esc(a.name)}: ${a.miss_moon}× a distância à Lua</title></circle>`;
  });
  $('#radar').innerHTML = s + '</g><circle class="earth" r="14"/><text x="0" y="28" text-anchor="middle">Terra</text>';
}
async function loadNeo(date) {
  $('#neoLead').textContent = 'A pesquisar no radar da NASA…'; $('#neoList').innerHTML = '';
  try {
    const d = neoCache[date] ??= await api('api/asteroides.php?date=' + date);
    $('#neoLead').textContent = `A NASA seguiu ${d.total} asteroides com aproximação neste dia. Mostramos os ${d.items.length} mais próximos.`;
    radar(d.items);
    $('#neoList').innerHTML = d.items.map(a => `<article class="${a.hazard ? 'hz' : ''}"><h4>${esc(a.name)}</h4><p><strong>${nf.format(a.miss_moon)}×</strong> a distância à Lua · ${nf.format(a.miss_km)} km</p><p>Até ${nf.format(a.diameter_m)} m · ${nf.format(a.speed_kmh)} km/h</p>${a.hazard ? '<p class="tag">Potencialmente perigoso (monitorizado pela NASA)</p>' : ''}</article>`).join('');
  } catch (e) { $('#neoLead').textContent = e.message; $('#radar').innerHTML = ''; }
}
const initNeo = once(() => {
  const t = $('#neoTabs'), names = ['Hoje', 'Amanhã'];
  t.innerHTML = [0, 1, 2, 3, 4].map(i => `<button data-tab="${isoDay(i)}" class="${i ? '' : 'on'}">${names[i] || new Date(isoDay(i) + 'T12:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}</button>`).join('');
  $$('button', t).forEach(b => b.onclick = () => { $$('button', t).forEach(x => x.classList.toggle('on', x === b)); loadNeo(b.dataset.tab); });
  loadNeo(isoDay(0));
});

/* ============ ASTRÓNOMO ============ */
function say(text, me) { const m = document.createElement('div'); m.className = 'msg ' + (me ? 'me' : 'bot'); m.textContent = text; $('#chat').appendChild(m); $('#chat').scrollTop = 1e6; return m; }
function typewrite(el, text) {
  if (reduced) { el.textContent = text; return Promise.resolve(); }
  el.textContent = ''; el.classList.add('typing'); let i = 0;
  return new Promise(res => { const t = setInterval(() => { el.textContent = text.slice(0, i += 3); $('#chat').scrollTop = 1e6; if (i >= text.length) { clearInterval(t); el.classList.remove('typing'); res(); } }, 16); });
}
let asking = false;
async function ask(q) {
  if (asking || !q) return; asking = true; $('#askBtn').disabled = true;
  say(q, true); const m = say('A pensar…'); m.classList.add('typing');
  try {
    const r = await post('api/astronomo.php', { question: q, context: $('#useCtx').checked ? apodCtx : '' });
    await typewrite(m, r.answer);
    setStatus(r.mode, r.note);
  } catch (e) { m.classList.remove('typing'); m.textContent = e.message; }
  asking = false; $('#askBtn').disabled = false;
}
function setStatus(mode, note) {
  const s = $('#aiStatus'); s.className = 'status ' + mode;
  s.textContent = mode === 'ia' ? 'IA ligada' : 'Modo básico (sem IA): respostas de uma base local.' + (note ? ' Motivo: ' + note : '');
}
onEnter.astronomo = once(async () => {
  $('#askBtn').onclick = () => { const q = $('#askInput').value.trim(); $('#askInput').value = ''; ask(q); };
  $('#askInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('#askBtn').click(); });
  $$('#chips button').forEach(b => b.onclick = () => ask(b.textContent));
  try {
    const s = await api('api/status.php');
    setStatus(s.claude_key ? 'ia' : 'local', s.claude_key ? '' : 'falta a chave de IA em config.local.php');
    if (s.claude_key) $('#aiStatus').textContent = 'Chave de IA encontrada (' + s.provider + '). A primeira resposta confirma a ligação.';
  } catch (e) { $('#aiStatus').textContent = e.message; }
});

/* ============ QUIZ ============ */
const Q = { cat: 'all', level: 0, sound: false, list: [], i: 0, lives: 3, pts: 0, streak: 0, best: 0, right: 0, fifty: 1, skip: 1, t: 0, max: 15, timer: null, locked: false };
const TITLES = [[0, 'Cadete espacial'], [500, 'Piloto de missão'], [1000, 'Comandante'], [1500, 'Lenda da NASA']];
let actx;
function beep(f, d = .12, type = 'sine') {
  if (!Q.sound) return;
  try { actx ??= new AudioContext(); const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f; g.gain.value = .06; o.connect(g); g.connect(actx.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + d); o.stop(actx.currentTime + d); } catch { }
}
const view = v => { $('#qSetup').hidden = v !== 'setup'; $('#qPlay').hidden = v !== 'play'; $('#qEnd').hidden = v !== 'end'; };
$$('.opts').forEach(g => $$('.chip', g).forEach(b => b.onclick = () => { $$('.chip', g).forEach(x => x.classList.toggle('on', x === b)); Q[g.dataset.group] = g.dataset.group === 'level' ? +b.dataset.v : b.dataset.v; }));
$('#qSound').onclick = () => { Q.sound = !Q.sound; $('#qSound').textContent = 'Som: ' + (Q.sound ? 'ligado' : 'desligado'); beep(660); };
$('#qStart').onclick = async () => {
  $('#qStart').disabled = true;
  try {
    const list = await api(`api/quiz.php?n=10&cat=${Q.cat}&level=${Q.level}`);
    Object.assign(Q, { list, i: 0, lives: 3, pts: 0, streak: 0, best: 0, right: 0, fifty: 1, skip: 1 });
    view('play'); renderQ();
  } catch (e) { alert(e.message); }
  $('#qStart').disabled = false;
};
function hud() {
  $('#qHearts').innerHTML = [0, 1, 2].map(i => `<span class="${i < Q.lives ? '' : 'lost'}">❤</span>`).join('');
  $('#qPts').textContent = nf.format(Q.pts);
  $('#qStreak').textContent = Q.streak >= 2 ? `Sequência ×${Q.streak}` : '';
  $('#qBar').style.width = (Q.i / Q.list.length * 100) + '%';
  $('#qFifty').disabled = !Q.fifty || Q.locked; $('#qSkip').disabled = !Q.skip || Q.locked;
}
function renderQ() {
  const q = Q.list[Q.i]; Q.locked = false; Q.max = [0, 20, 15, 12][q.level]; Q.t = Q.max;
  $('#qExplain').hidden = true; hud();
  $('#qMeta').textContent = `Pergunta ${Q.i + 1} de ${Q.list.length} · ${['', 'Cadete', 'Piloto', 'Comandante'][q.level]}`;
  $('#qText').textContent = q.q;
  $('#qAns').innerHTML = shuffle(q.options).map((o, k) => `<button class="ans" data-i="${o.i}" style="--d:${k}"><b>${'ABCD'[k]}</b><span>${esc(o.t)}</span></button>`).join('');
  $$('#qAns .ans').forEach(b => b.onclick = () => answer(+b.dataset.i));
  clearInterval(Q.timer); tick();
  Q.timer = setInterval(() => { Q.t -= .1; tick(); if (Q.t <= 0) answer(-1); }, 100);
}
function tick() {
  const f = Math.max(0, Q.t / Q.max); $('#qRing').style.strokeDashoffset = 106.8 * (1 - f);
  $('#qRing').classList.toggle('low', Q.t < 5); $('#qTime').textContent = Math.ceil(Math.max(0, Q.t));
}
async function answer(opt) {
  if (Q.locked) return; Q.locked = true; clearInterval(Q.timer);
  $$('#qAns .ans').forEach(b => b.disabled = true);
  const q = Q.list[Q.i];
  try {
    const r = await post('api/quiz.php', { action: 'check', id: q.id, option: opt });
    $$('#qAns .ans').forEach(b => { if (+b.dataset.i === r.correct) b.classList.add('ok'); else if (+b.dataset.i === opt) b.classList.add('no'); });
    if (r.ok) {
      Q.streak++; Q.best = Math.max(Q.best, Q.streak); Q.right++;
      const gain = 100 + Math.round(Q.t / Q.max * 50) + 10 * Math.min(Q.streak - 1, 5); Q.pts += gain;
      beep(740); setTimeout(() => beep(990), 110);
      if (Q.streak >= 3) confetti(innerWidth / 2, innerHeight / 2, 40 + Q.streak * 8);
      $('#qWhy').textContent = `Certo! +${gain} pontos. ${r.why}`;
    } else {
      Q.lives--; Q.streak = 0; beep(180, .3, 'sawtooth');
      $('#qWhy').textContent = (opt < 0 ? 'Acabou o tempo. ' : 'Quase. ') + r.why;
    }
    hud();
    const last = Q.i + 1 >= Q.list.length || Q.lives <= 0;
    $('#qNext').textContent = last ? 'Ver resultado' : 'Seguinte'; $('#qNext').onclick = () => last ? finish() : (Q.i++, renderQ());
    $('#qExplain').hidden = false; $('#qFifty').disabled = $('#qSkip').disabled = true;
  } catch (e) { $('#qWhy').textContent = e.message; $('#qExplain').hidden = false; $('#qNext').textContent = 'Tentar de novo'; $('#qNext').onclick = () => { Q.locked = false; renderQ(); }; }
}
$('#qFifty').onclick = async () => {
  if (!Q.fifty || Q.locked) return; Q.fifty = 0; hud();
  try { const r = await post('api/quiz.php', { action: 'fifty', id: Q.list[Q.i].id }); r.remove.forEach(i => $(`#qAns .ans[data-i="${i}"]`)?.classList.add('gone')); beep(520); } catch { }
};
$('#qSkip').onclick = () => { if (!Q.skip || Q.locked) return; Q.skip = 0; clearInterval(Q.timer); if (Q.i + 1 >= Q.list.length) return finish(); Q.i++; renderQ(); };
function finish() {
  clearInterval(Q.timer); view('end');
  const title = [...TITLES].reverse().find(t => Q.pts >= t[0])[1];
  $('#qRank').textContent = title; $('#eP').textContent = nf.format(Q.pts); $('#eC').textContent = `${Q.right}/${Q.list.length}`; $('#eS').textContent = Q.best;
  $('#qSave').disabled = false; $('#qSave').textContent = 'Guardar no ranking';
  if (Q.right >= 6) confetti(innerWidth / 2, innerHeight / 3, 140);
}
$('#qSave').onclick = async () => {
  const name = $('#qName').value.trim(); if (!name) return $('#qName').focus();
  try { await post('api/ranking.php', { name, points: Q.pts, correct: Q.right }); $('#qSave').disabled = true; $('#qSave').textContent = 'Guardado'; selectTab($('#quizTabs'), 'ranking'); } catch (e) { alert(e.message); }
};
$('#qAgain').onclick = () => view('setup');
async function loadRank() {
  try {
    const r = await api('api/ranking.php');
    $('#rankList').innerHTML = r.length ? r.map((x, i) => `<li><span>${i + 1}. ${esc(x.name)}</span><span>${nf.format(x.points)} pts · ${x.correct} certas</span></li>`).join('') : '<li>Ainda ninguém jogou. Sê o primeiro.</li>';
  } catch (e) { $('#rankList').innerHTML = `<li>${esc(e.message)}</li>`; }
}
$('#quizTabs').addEventListener('tab', e => { if (e.detail === 'ranking') loadRank(); });
onEnter.quiz = once(() => { view('setup'); });

onEnter.dados = () => { initFoto(); };
$('#dadosTabs').addEventListener('tab', e => { if (e.detail === 'asteroides') initNeo(); });
