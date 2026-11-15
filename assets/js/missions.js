'use strict';
/* ===== Missões: problema, investigação, experiência, desafio e avaliação ===== */
const STEPS = ['Problema', 'Investigar', 'Experimentar', 'Desafio', 'Avaliação'];
const RANKS = [[0, 'Cadete espacial'], [3, 'Piloto de missão'], [6, 'Comandante'], [10, 'Lenda da NASA']];
let MLIST = [], MS = store.get('missions', {}), cur = null;
const mst = id => MS[id] ||= { step: 1, stars: 0, done: false };
const save = () => store.set('missions', MS);
const totalStars = () => Object.values(MS).reduce((s, m) => s + (m.stars || 0), 0);
const WATER = {
  terra: 'Média de 15 °C: a água existe nos três estados e há oceanos. É o único mundo onde se conhece vida.',
  marte: 'Média de -65 °C: a água está sobretudo em gelo, nos pólos e no subsolo. Há sinais de rios e lagos de há milhares de milhões de anos.',
  lua: 'Média de -20 °C, mas muito variável. Há gelo de água em crateras dos pólos que ficam sempre na sombra.',
  venus: '464 °C: quente demais para água líquida à superfície. Qualquer água evaporaria.',
  mercurio: 'Média de 167 °C, com extremos enormes. Há gelo em crateras polares que nunca recebem luz do Sol.',
  jupiter: '-110 °C nas nuvens e sem superfície sólida. A água, quando existe, está misturada na atmosfera profunda.',
  neptuno: '-200 °C: a água só pode existir como gelo, nas profundezas.',
  plutao: '-230 °C: a crosta é de gelo de água, duro como rocha.'
};

function hub() {
  const t = totalStars(), rank = [...RANKS].reverse().find(r => t >= r[0])[1];
  $('#mRank').textContent = rank; $('#mStars').textContent = t + ' / ' + MLIST.length * 3; $('#mBar').style.width = (t / (MLIST.length * 3) * 100) + '%';
  $('#mGrid').innerHTML = MLIST.map(m => {
    const s = mst(m.id), prog = s.done ? 5 : s.step - 1;
    return `<a class="mcard glass tilt" href="#/missoes/${m.id}" style="--c:${m.cor}"><i class="sph"></i><div><small>${s.done ? 'Concluída' : prog ? 'Em curso' : 'Nova'} · ${esc(m.duracao)}</small><b>${esc(m.titulo)}</b><span>${esc(m.subtitulo)}</span>
      <div class="pips">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= prog ? 'on' : ''}"></i>`).join('')}</div><div class="stars">${[1, 2, 3].map(i => `<s class="${i <= s.stars ? 'on' : ''}">★</s>`).join('')}</div></div></a>`;
  }).join('');
}

async function openMission(id) {
  $('#mHub').hidden = true; const v = $('#mView'); v.hidden = false; v.innerHTML = '<div class="loader static"></div>';
  try { cur = await api('api/missoes.php?id=' + id); } catch (e) { v.innerHTML = `<p class="lead">${esc(e.message)}</p><a class="btn" href="#/missoes">Voltar</a>`; return; }
  renderMission(mst(cur.id).step > 5 ? 5 : mst(cur.id).step);
}
function renderMission(step) {
  const s = mst(cur.id), v = $('#mView'), m = cur;
  v.innerHTML = `<a class="back" href="#/missoes">‹ Todas as missões</a><div class="mhead" style="--c:${m.cor}"><i class="sph"></i><div><p class="eyebrow">Missão</p><h2>${esc(m.titulo)}</h2><p class="lead">${esc(m.subtitulo)}</p></div></div>
  <ol class="stepper">${STEPS.map((n, i) => `<li><button class="${i + 1 === step ? 'cur' : ''} ${i + 1 < s.step || s.done ? 'done' : ''}" data-s="${i + 1}" ${i + 1 > s.step && !s.done ? 'disabled' : ''}><b>${i + 1}</b><span>${n}</span></button></li>`).join('')}</ol><div class="mbody glass" id="mBody"></div>`;
  $$('.stepper button', v).forEach(b => b.onclick = () => renderMission(+b.dataset.s));
  const body = $('#mBody'), advance = () => { if (s.step === step) { s.step = Math.min(6, step + 1); save(); } renderMission(Math.min(5, step + 1)); };
  const next = (label, enabled = true) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = label; b.disabled = !enabled; b.onclick = advance; const r = document.createElement('div'); r.className = 'row'; r.append(b); body.append(r); return b; };
  if (step === 1) {
    body.innerHTML = `<p class="eyebrow">1 · Problema científico</p><h3 class="big">${esc(m.problema)}</h3><p class="body">Nesta missão vais investigar, fazer uma experiência, resolver um desafio e responder a uma avaliação.</p>`; next('Começar a investigação');
  } else if (step === 2) {
    const read = new Set(); body.innerHTML = `<p class="eyebrow">2 · Conteúdo para investigação</p><p class="body">Abre todos os cartões para desbloquear a experiência. <strong class="rc">0 / ${m.cards.length}</strong></p><div class="cgrid">${m.cards.map((c, i) => `<button class="icard glass" data-i="${i}"><b>${esc(c.t)}</b><span>${esc(c.x)}</span></button>`).join('')}</div>`;
    const nb = next('Passar à experiência', s.done || s.step > 2);
    $$('.icard', body).forEach(c => c.onclick = () => { c.classList.add('open'); read.add(c.dataset.i); $('.rc', body).textContent = read.size + ' / ' + m.cards.length; if (read.size === m.cards.length) nb.disabled = false; });
  } else if (step === 3) {
    const e = m.experiencia; body.innerHTML = `<p class="eyebrow">3 · Experiência</p><h3 class="big">${esc(e.titulo)}</h3><p class="body">${esc(e.texto)}</p><div id="xp"></div>`;
    const nb = next('Passar ao desafio', s.done || s.step > 3), xp = $('#xp'); const mk = () => { let f = true; return () => { if (f) { f = false; return; } nb.disabled = false; }; }, unlockNow = () => { nb.disabled = false; };
    if (e.tipo === 'globo') {
      xp.innerHTML = '<div class="glass globe-box"><canvas width="520" height="520"></canvas><p class="small">Arrasta para rodar o planeta.</p></div><h4>Compara com a Terra</h4><div id="xc"></div><h4>O teu peso</h4><div id="xw"></div>';
      const g = new Globe($('canvas', xp), BY[e.corpo]); g.touched = unlockNow; createCompare($('#xc'), 'terra', e.corpo, mk()); createWeight($('#xw'), 50, mk());
    } else if (e.tipo === 'lancamento') createProjectile(xp, { a: e.a, b: e.b, v: e.v, ang: e.ang }, unlockNow);
    else if (e.tipo === 'termometro') thermo(xp, unlockNow);
    else if (e.tipo === 'construtor') builder(xp, e, mk());
  } else if (step === 4) {
    const d = m.desafio; body.innerHTML = `<p class="eyebrow">4 · Desafio</p><h3 class="big">${esc(d.texto)}</h3>` + (d.tipo === 'numero'
      ? `<div class="row"><input id="chv" type="number" step="any" placeholder="A tua resposta (${esc(d.unidade)})" aria-label="Resposta"><button class="btn" id="chb">Verificar</button></div>`
      : `<div class="answers">${d.opcoes.map((o, i) => `<label class="ans"><input type="radio" name="ch" value="${i}"><b>${'ABCD'[i]}</b><span>${esc(o)}</span></label>`).join('')}</div><div class="row"><button class="btn" id="chb">Verificar</button></div>`) + '<div id="chf"></div>';
    $('#chb').onclick = async () => {
      const val = d.tipo === 'numero' ? $('#chv').value : ($('input[name=ch]:checked')?.value ?? ''); if (val === '') return;
      try {
        const r = await post('api/missoes.php', { id: m.id, action: 'challenge', value: val }), f = $('#chf');
        if (r.ok) { f.innerHTML = `<div class="explain ok"><p><strong>Certo!</strong> ${esc(r.explicacao)}</p></div>`; confetti(innerWidth / 2, innerHeight / 3, 70); $('#chb').disabled = true; next('Passar à avaliação'); }
        else f.innerHTML = `<div class="explain bad"><p><strong>Ainda não.</strong> Pista: ${esc(r.dica)}</p></div>`;
      } catch (err) { $('#chf').textContent = err.message; }
    };
    if (s.done || s.step > 4) next('Passar à avaliação');
  } else {
    body.innerHTML = `<p class="eyebrow">5 · Avaliação</p><h3 class="big">Mostra o que aprendeste</h3><div id="ev">${m.avaliacao.map((q, k) => `<fieldset class="evq"><legend>${k + 1}. ${esc(q.q)}</legend><div class="answers">${shuffle(q.o).map(o => `<label class="ans"><input type="radio" name="q${k}" value="${o.i}"><span>${esc(o.t)}</span></label>`).join('')}</div></fieldset>`).join('')}</div><div class="row"><button class="btn" id="evb">Entregar avaliação</button></div><div id="evf"></div>`;
    $('#evb').onclick = async () => {
      const ans = m.avaliacao.map((_, k) => { const c = $(`input[name=q${k}]:checked`); return c ? +c.value : -1; });
      if (ans.includes(-1)) { $('#evf').innerHTML = '<p class="small">Responde às três perguntas.</p>'; return; }
      try {
        const r = await post('api/missoes.php', { id: m.id, action: 'eval', answers: ans });
        s.stars = Math.max(s.stars || 0, r.score); s.done = true; s.step = 6; save();
        $('#evf').innerHTML = `<div class="explain ${r.score >= 2 ? 'ok' : 'bad'}"><h3>${r.score} de ${r.total} certas · ${'★'.repeat(r.score)}${'☆'.repeat(r.total - r.score)}</h3>${r.review.map((x, k) => `<p>${k + 1}. ${x.ok ? 'Certo' : 'Errado'}. ${esc(x.porque)}</p>`).join('')}<div class="row"><a class="btn" href="#/missoes">Voltar às missões</a><button class="btn ghost" id="evr">Repetir avaliação</button></div></div>`;
        $('#evb').disabled = true; if (r.score >= 2) confetti(innerWidth / 2, innerHeight / 3, 140); $('#evr').onclick = () => renderMission(5);
      } catch (err) { $('#evf').textContent = err.message; }
    };
  }
}

function thermo(root, onUse) {
  const IDS = ['plutao', 'neptuno', 'jupiter', 'marte', 'lua', 'terra', 'mercurio', 'venus'], MIN = -250, MAX = 500, X = t => (t - MIN) / (MAX - MIN) * 100, seen = new Set();
  root.innerHTML = `<div class="thermo glass"><div class="zones"><i class="z1" style="left:0;width:${X(0)}%">Gelo</i><i class="z2" style="left:${X(0)}%;width:${X(100) - X(0)}%">Água líquida</i><i class="z3" style="left:${X(100)}%;width:${100 - X(100)}%">Vapor</i></div>
  ${IDS.map((id, k) => { const b = BY[id]; return `<button class="tm ${k % 2 ? 'low' : ''}" data-id="${id}" style="left:${X(b.temp)}%;--c:${b.color}"><i class="sph"></i><span>${esc(b.name)}<small>${fx(b.temp, 0)} °C</small></span></button>`; }).join('')}</div><p class="body tinfo">Toca num mundo para ver o que se sabe sobre a água lá.</p>`;
  $$('.tm', root).forEach(b => b.onclick = () => { $$('.tm', root).forEach(x => x.classList.toggle('on', x === b)); $('.tinfo', root).innerHTML = `<strong>${esc(BY[b.dataset.id].name)}.</strong> ${esc(WATER[b.dataset.id])}`; seen.add(b.dataset.id); if (seen.size >= 3) onUse(); });
}
function builder(root, e, onUse) {
  const KM = 778.3e6;
  root.innerHTML = `<div class="glass pad"><label class="f-l">Velocidade da nave: <b class="bv"></b><input class="bs" type="range" min="5" max="300" value="20"></label>
  <div class="stats"><div><dt>Distância (média)</dt><dd>778 milhões de km</dd></div><div><dt>Duração da viagem</dt><dd class="bd"></dd></div><div><dt>Atraso do rádio até à Terra</dt><dd>cerca de 43 min</dd></div></div>
  <p class="small">Simplificação: linha recta, sem ter em conta as órbitas. As sondas reais fazem trajectórias curvas e demoram mais.</p>
  <div class="row"><button class="btn" id="bgo">Abrir no simulador 3D</button></div></div>`;
  const s = $('.bs', root), upd = () => { const v = +s.value; $('.bv', root).textContent = v + ' km/s'; $('.bd', root).textContent = fmtTime(KM / v); };
  s.oninput = () => { upd(); onUse(); }; upd(); onUse();
  $('#bgo').onclick = () => { onOpenTrip = true; const v = +s.value; location.hash = '#/viagem'; setTimeout(() => { const i = SHIPS.findIndex(x => x[1] >= v); travelSet({ from: 'terra', to: e.destino, ship: i < 0 ? 3 : i }); }, 80); };
}
let onOpenTrip = false;

onEnter.missoes = async arg => {
  if (!MLIST.length) { try { MLIST = await api('api/missoes.php'); } catch (e) { $('#mGrid').innerHTML = `<p class="lead">${esc(e.message)}</p>`; return; } }
  if (arg) openMission(+arg); else { $('#mView').hidden = true; $('#mHub').hidden = false; hub(); }
};
