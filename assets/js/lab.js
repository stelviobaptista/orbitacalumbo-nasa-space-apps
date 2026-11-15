'use strict';
/* ===== Laboratório: massa e peso; gravidade em movimento ===== */
const PRESETS = [['Eu (60 kg)', 60], ['Mochila (8 kg)', 8], ['Bola de futebol (0,43 kg)', .43], ['Bicicleta (15 kg)', 15], ['Carro (1 200 kg)', 1200]];
function createWeight(root, mass = 60, onUse) {
  root.innerHTML = `<div class="glass pad"><p class="body">A <strong>massa</strong> é a quantidade de matéria de um objecto e não muda. O <strong>peso</strong> é a força da gravidade sobre essa massa: P = m × g. Muda a massa e vê o peso em cada mundo.</p>
  <div class="chips w-pre">${PRESETS.map(([l, m]) => `<button data-m="${m}">${l}</button>`).join('')}</div>
  <div class="row"><label class="inl">Massa (kg)<input class="w-n" type="number" min="0.1" max="5000" step="any" value="${mass}"></label><input class="w-r" type="range" min="1" max="200" value="${Math.min(200, mass)}" aria-label="Massa em kg"></div>
  <p class="w-msg lead"></p></div><div class="w-rows"></div>`;
  const n = $('.w-n', root), r = $('.w-r', root), rows = $('.w-rows', root);
  const draw = () => {
    const m = Math.max(.1, +n.value || 1), ws = BODIES.map(b => m * b.g), mx = Math.max(...ws.filter((_, i) => BODIES[i].id !== 'sol'));
    $('.w-msg', root).innerHTML = `A massa é <strong>${fx(m, 2)} kg</strong> em qualquer lugar. O que muda é o peso.`;
    rows.innerHTML = BODIES.map((b, i) => {
      const w = ws[i], felt = m * b.g / 9.81;
      return `<div class="w-row glass ${b.id === 'terra' ? 'earth' : ''}"><i class="dot big" style="background:${b.color}"></i><b>${esc(b.name)}</b><div class="bar2"><i style="width:${b.id === 'sol' ? 100 : Math.max(2, w / mx * 100)}%;background:${b.id === 'terra' ? 'var(--cyan)' : 'var(--violet)'}"></i></div><span class="wv">${fx(w, 1)} N</span><span class="wk">sentes ${fx(felt, 1)} kg</span></div>`;
    }).join('');
    onUse?.();
  };
  n.oninput = () => { r.value = Math.min(200, +n.value || 1); draw(); };
  r.oninput = () => { n.value = r.value; draw(); };
  $$('.w-pre button', root).forEach(b => b.onclick = () => { n.value = b.dataset.m; r.value = Math.min(200, +b.dataset.m); draw(); });
  draw();
}

function createProjectile(root, o = {}, onRun) {
  const S = Object.assign({ a: 'terra', b: 'lua', v: 15, ang: 45, h: 0, mode: 'lancamento', hq: 20 }, o);
  root.innerHTML = `<div class="glass pad pj-ctl">
    <div class="tabs pj-mode"><button data-m="lancamento" class="${S.mode === 'lancamento' ? 'on' : ''}">Lançar um objecto</button><button data-m="queda" class="${S.mode === 'queda' ? 'on' : ''}">Largar de uma altura</button></div>
    <div class="pj-grid"><label>Mundo A<select class="pa">${optionsHTML(S.a)}</select></label><label>Mundo B<select class="pb">${optionsHTML(S.b)}</select></label>
    <label class="f-l">Velocidade: <b class="vv"></b><input class="pv" type="range" min="2" max="50" step="1" value="${S.v}"></label>
    <label class="f-l">Ângulo: <b class="av"></b><input class="pg" type="range" min="5" max="85" step="1" value="${S.ang}"></label>
    <label class="f-l">Altura inicial: <b class="hv"></b><input class="ph2" type="range" min="0" max="100" step="1" value="${S.mode === 'queda' ? S.hq : S.h}"></label>
    <label>Velocidade da simulação<select class="ps"><option value="1">Normal</option><option value="2" selected>Rápida (×2)</option><option value="4">Muito rápida (×4)</option></select></label></div>
    <div class="row"><button class="btn pgo">Lançar!</button><button class="btn ghost prs">Repor</button></div><p class="small">Sem resistência do ar, para comparar só o efeito da gravidade.</p></div>
  <div class="glass cmp-canvas"><canvas width="960" height="400"></canvas></div><div class="pj-res"></div>`;
  const q = s => $(s, root), cv = q('canvas'), ctx = cv.getContext('2d'); let anim = null, t0 = 0, played = false;
  const get = () => ({ A: BY[q('.pa').value], B: BY[q('.pb').value], v: +q('.pv').value, ang: +q('.pg').value * Math.PI / 180, h: +q('.ph2').value, mode: S.mode, sp: +q('.ps').value });
  const calc = (g, c) => {
    if (c.mode === 'queda') { const T = Math.sqrt(2 * c.h / g); return { T, range: 0, apex: c.h, vimp: g * T, pos: t => ({ x: 0, y: Math.max(0, c.h - .5 * g * Math.min(t, T) ** 2) }) }; }
    const vy = c.v * Math.sin(c.ang), vx = c.v * Math.cos(c.ang), T = (vy + Math.sqrt(vy * vy + 2 * g * c.h)) / g;
    return { T, range: vx * T, apex: c.h + vy * vy / (2 * g), vimp: Math.hypot(vx, vy - g * T), pos: t => { t = Math.min(t, T); return { x: vx * t, y: Math.max(0, c.h + vy * t - .5 * g * t * t) }; } };
  };
  const labels = () => { const c = get(); q('.vv').textContent = c.v + ' m/s'; q('.av').textContent = Math.round(c.ang * 180 / Math.PI) + '°'; q('.hv').textContent = c.h + ' m';
    q('.pv').closest('label').style.display = q('.pg').closest('label').style.display = c.mode === 'queda' ? 'none' : ''; };
  const frame = (t, live) => {
    const c = get(), ra = calc(c.A.g, c), rb = calc(c.B.g, c), W = 960, H = 400, mL = 60, mB = 40, mT = 20;
    const xmax = c.mode === 'queda' ? 1 : Math.max(ra.range, rb.range, 1) * 1.1, ymax = Math.max(ra.apex, rb.apex, 1) * 1.2;
    const X = x => c.mode === 'queda' ? 0 : mL + x / xmax * (W - mL - 30), Y = y => H - mB - y / ymax * (H - mB - mT);
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = 'rgba(8,11,36,.9)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(150,160,255,.13)'; ctx.fillStyle = '#a3accf'; ctx.font = '14px "Space Grotesk",sans-serif'; ctx.textAlign = 'right';
    const step = (() => { const raw = ymax / 5, p = Math.pow(10, Math.floor(Math.log10(raw))); return [1, 2, 5, 10].map(k => k * p).find(s => s >= raw); })();
    for (let y = 0; y <= ymax; y += step) { ctx.beginPath(); ctx.moveTo(mL, Y(y)); ctx.lineTo(W - 20, Y(y)); ctx.stroke(); ctx.fillText(fx(y, 0) + ' m', mL - 8, Y(y) + 4); }
    ctx.fillStyle = '#2a3274'; ctx.fillRect(mL, Y(0), W - mL - 20, 6);
    [[ra, c.A, '#29d3f5', 0], [rb, c.B, '#ff9a3c', 1]].forEach(([r, o, col, k]) => {
      const bx = c.mode === 'queda' ? (k ? 700 : 260) : 0;
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath();
      if (c.mode === 'queda') { ctx.moveTo(bx, Y(c.h)); ctx.lineTo(bx, Y(0)); } else for (let i = 0; i <= 80; i++) { const p = r.pos(r.T * i / 80); i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y)); }
      ctx.globalAlpha = .45; ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash([]);
      if (live) { const p = r.pos(t), px = c.mode === 'queda' ? bx : X(p.x); sphereDot(ctx, px, Y(p.y) - 9, 9, col); }
      ctx.fillStyle = col; ctx.font = '700 16px "Space Grotesk",sans-serif'; ctx.textAlign = c.mode === 'queda' ? 'center' : 'left'; ctx.fillText(`${o.name} · g = ${fx(o.g)} m/s²`, c.mode === 'queda' ? bx : mL + 10, c.mode === 'queda' ? 24 : 24 + k * 22);
    });
    if (live) { ctx.fillStyle = '#eef1ff'; ctx.textAlign = 'right'; ctx.font = '16px "Space Grotesk",sans-serif'; ctx.fillText(`Tempo: ${fx(t, 1)} s`, W - 24, 24); }
    return [ra, rb, c];
  };
  const results = () => {
    const [ra, rb, c] = frame(0, false), row = (lb, f) => `<tr><td>${lb}</td><td>${f(ra)}</td><td>${f(rb)}</td></tr>`;
    q('.pj-res').innerHTML = `<div class="tbl-wrap glass"><table class="tbl"><thead><tr><th></th><th>${esc(c.A.name)}</th><th>${esc(c.B.name)}</th></tr></thead><tbody>` +
      row('Tempo no ar', r => fx(r.T, 2) + ' s') + (c.mode === 'queda' ? '' : row('Alcance', r => fx(r.range, 1) + ' m') + row('Altura máxima', r => fx(r.apex, 1) + ' m')) + row('Velocidade ao chegar ao chão', r => fx(r.vimp, 1) + ' m/s') + '</tbody></table></div>' +
      `<p class="body cmp-sum">${c.mode === 'queda' ? `Largado da mesma altura, o objecto demora ${fx(rb.T / ra.T, 2)}× o tempo em ${esc(c.B.name)} comparado com ${esc(c.A.name)}.` : `Com a mesma velocidade e ângulo, o alcance em ${esc(c.B.name)} é ${fx(rb.range / ra.range, 2)}× o de ${esc(c.A.name)}.`}</p>`;
  };
  const stop = () => { cancelAnimationFrame(anim); anim = null; };
  const run = () => {
    stop(); const [ra, rb, c] = frame(0, false), Tm = Math.max(ra.T, rb.T); t0 = performance.now(); played = true;
    const tick = now => { const t = (now - t0) / 1000 * c.sp * (Tm > 12 ? Tm / 12 : 1); frame(Math.min(t, Tm), true); if (t < Tm + .4) anim = requestAnimationFrame(tick); else { anim = null; onRun?.(); } };
    anim = requestAnimationFrame(tick);
  };
  const refresh = () => { stop(); labels(); results(); };
  $$('select,input', root).forEach(e => e.addEventListener('input', refresh));
  $$('.pj-mode button', root).forEach(b => b.onclick = () => { S.mode = b.dataset.m; $$('.pj-mode button', root).forEach(x => x.classList.toggle('on', x === b)); q('.ph2').value = S.mode === 'queda' ? 20 : 0; refresh(); });
  q('.pgo').onclick = run; q('.prs').onclick = refresh; refresh();
  if (S.mode === 'queda') q('.ph2').value = S.hq, labels();
}

onEnter.lab = once(() => {
  createWeight($('#labPeso'), 60); createProjectile($('#labMov'), {});
});
