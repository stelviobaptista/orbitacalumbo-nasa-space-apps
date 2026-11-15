'use strict';
/* ===== Motor 3D dos planetas (Canvas 2D, sem bibliotecas externas) ===== */
const BODIES = window.BODIES, BY = Object.fromEntries(BODIES.map(b => [b.id, b]));
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const TW = 512, TH = 256, SC = TW / 256;
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function fbm(seed, cx, cy, oct) {
  const rnd = mulberry(seed), out = new Float32Array(TW * TH); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) {
    const gx = cx << o, gy = (cy << o) + 1, g = new Float32Array(gx * gy); for (let i = 0; i < g.length; i++) g[i] = rnd();
    for (let y = 0; y < TH; y++) {
      const fy = y / TH * (gy - 1), y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), y1 = Math.min(y0 + 1, gy - 1);
      for (let x = 0; x < TW; x++) {
        const fxx = x / TW * gx, xi = Math.floor(fxx), x0 = xi % gx, tx = fxx - xi, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % gx;
        const a = g[y0 * gx + x0], b = g[y0 * gx + x1], c = g[y1 * gx + x0], d = g[y1 * gx + x1];
        out[y * TW + x] += amp * ((a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy);
      }
    }
    tot += amp; amp *= .5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= tot; return out;
}
const mixc = (a, b, t) => { t = clamp(t, 0, 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
function craters(shade, seed, n, rmin, rmax, dark) {
  const rnd = mulberry(seed);
  for (let k = 0; k < n; k++) {
    const cx = rnd() * TW, cy = 16 + rnd() * (TH - 32), r = rmin + Math.pow(rnd(), 2.2) * (rmax - rmin);
    for (let dy = -Math.ceil(r) - 2; dy <= Math.ceil(r) + 2; dy++) for (let dx = -Math.ceil(r) - 2; dx <= Math.ceil(r) + 2; dx++) {
      const yy = Math.floor(cy) + dy; if (yy < 0 || yy >= TH) continue;
      const xx = ((Math.floor(cx) + dx) % TW + TW) % TW, d = Math.hypot(dx, dy);
      if (d < r) shade[yy * TW + xx] *= 1 - dark * (1 - Math.pow(d / r, 2)) * .9; else if (d < r + 1.4) shade[yy * TW + xx] *= 1.22;
    }
  }
}
const TEX = {};
function getTexture(b) {
  if (TEX[b.id]) return TEX[b.id];
  const seed = b.id.length * 131 + b.tex.length * 17 + 7, tex = new Uint8ClampedArray(TW * TH * 3), shade = new Float32Array(TW * TH).fill(1);
  const n1 = fbm(seed, 4, 2, 5), n2 = fbm(seed + 9, 3, 2, 4);
  let pal = null;
  const T = b.tex;
  if (T === 'rock' || T === 'moon' || T === 'pluto') craters(shade, seed + 3, T === 'pluto' ? 25 : 150, 2 * SC, 13 * SC, T === 'moon' ? .5 : .6);
  const cl = T === 'earth' ? fbm(seed + 31, 5, 3, 4) : null;
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    const i = y * TW + x, v = y / TH, lat = Math.abs(v - .5) * 2, a = n1[i], c2 = n2[i]; let c;
    switch (T) {
      case 'rock': c = mixc([150, 138, 126], [88, 82, 78], a); break;
      case 'moon': c = mixc([176, 176, 182], [140, 140, 148], a); if (a > .56) c = mixc(c, [96, 96, 108], (a - .56) * 5); break;
      case 'pluto': { c = mixc([176, 140, 112], [128, 96, 80], a); const dx = (x / TW - .42) * 256, dy = (y / TH - .5) * 128; const h = 1 - (dx * dx / 1500 + dy * dy / 520); if (h > 0) c = mixc(c, [240, 226, 208], Math.min(1, h * 1.6)); break; }
      case 'venus': { const t = .5 + .5 * Math.sin(v * 22 + a * 9); c = mixc([238, 208, 150], [190, 148, 88], a * .6 + t * .4); break; }
      case 'earth': {
        const h = a * .7 + c2 * .3;
        if (h < .52) c = mixc([8, 36, 102], [32, 104, 180], h / .52);
        else { c = mixc([46, 124, 58], [128, 108, 72], (h - .52) / .28); if (lat < .5 && c2 > .56) c = mixc(c, [196, 170, 104], .75); }
        if (lat > .86 + .06 * c2) c = [240, 246, 252];
        const cc = clamp((cl[i] - .56) * 3, 0, .78); c = mixc(c, [255, 255, 255], cc); break;
      }
      case 'mars': { c = mixc([150, 70, 40], [216, 132, 82], a); if (c2 > .55) c = mixc(c, [74, 38, 28], (c2 - .55) * 4); if (lat > .93) c = mixc(c, [245, 245, 250], .9); break; }
      case 'jupiter': { const band = Math.sin((v + (a - .5) * .09) * Math.PI * 11); c = mixc([168, 104, 68], [236, 216, 182], (band + 1) / 2 * .85 + c2 * .15);
        const dx = (x / TW - .62) * 256 / 20, dy = (y / TH - .64) * 128 / 11, d = dx * dx + dy * dy; if (d < 1) c = mixc(c, [196, 74, 50], Math.sqrt(1 - d)); break; }
      case 'saturn': { const band = Math.sin((v + (a - .5) * .07) * Math.PI * 9); c = mixc([186, 156, 102], [238, 220, 172], (band + 1) / 2 * .8 + c2 * .2); break; }
      case 'uranus': c = mixc([128, 204, 214], [158, 226, 232], .5 + .5 * Math.sin(v * 12) * .5 + a * .2); break;
      case 'neptune': { c = mixc([32, 66, 196], [74, 122, 242], a); const band = Math.sin(v * 16 + a * 3); c = mixc(c, [20, 40, 140], Math.max(0, band) * .35); if (c2 > .72 && Math.abs(v - .4) < .12) c = mixc(c, [235, 245, 255], .45); break; }
      case 'sun': { c = mixc([236, 118, 20], [255, 226, 120], Math.pow(a, 1.6)); if (c2 > .66) c = mixc(c, [150, 50, 10], (c2 - .66) * 3); break; }
      default: c = [128, 128, 128];
    }
    const s = shade[i]; tex[i * 3] = c[0] * s; tex[i * 3 + 1] = c[1] * s; tex[i * 3 + 2] = c[2] * s;
  }
  return TEX[b.id] = tex;
}

const GLOBES = new Set();
class Globe {
  constructor(canvas, body) {
    this.cv = canvas; this.N = canvas.width; this.ctx = canvas.getContext('2d');
    this.off = document.createElement('canvas'); this.off.width = this.off.height = this.N; this.octx = this.off.getContext('2d');
    this.img = this.octx.createImageData(this.N, this.N);
    this.yaw = 0; this.pitch = .35; this.auto = true; this.drag = null; this.dirty = true;
    this.setBody(body); this.attach(); GLOBES.add(this);
  }
  setBody(b) {
    this.b = b; this.tex = getTexture(b); this.r = b.ring ? this.N * .23 : this.N * .385; this.dirty = true;
    this.speed = clamp(.5 * 24 / b.dayH, .06, .9) * (b.retro ? -1 : 1);
  }
  prep() {
    const N = this.N, r = this.r, c = N / 2, cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), sun = this.b.tex === 'sun';
    const pos = new Int32Array(N * N), lon = new Float32Array(N * N), row = new Uint8Array(N * N), lf = new Float32Array(N * N), al = new Uint8Array(N * N);
    const Lx = -.55, Ly = .45, Lz = .7, ln = Math.hypot(Lx, Ly, Lz); let n = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i - c + .5) / r, y = -(j - c + .5) / r, d2 = x * x + y * y; if (d2 > 1.03) continue;
      const z = d2 < 1 ? Math.sqrt(1 - d2) : 0, yp = y * cp + z * sp, zp = -y * sp + z * cp;
      const lo = Math.atan2(x, zp), la = Math.asin(clamp(yp, -1, 1));
      pos[n] = j * N + i; lon[n] = (lo / (2 * Math.PI) + .5) * TW; row[n] = clamp(Math.floor((.5 - la / Math.PI) * TH), 0, TH - 1);
      const dot = (x * Lx + y * Ly + z * Lz) / ln;
      lf[n] = sun ? .72 + .28 * z : .06 + .94 * Math.pow(Math.max(0, dot), .85);
      al[n] = clamp(((1 - Math.sqrt(d2)) * r + .5), 0, 1) * 255; n++;
    }
    this.P = { n, pos, lon, row, lf, al }; this.img.data.fill(0); this.dirty = false;
  }
  ring(front) {
    const b = this.b; if (!b.ring) return;
    const ctx = this.ctx, c = this.N / 2, r = this.r, ry = Math.max(.07, Math.abs(Math.sin(this.pitch)));
    ctx.save(); ctx.beginPath(); front ? ctx.rect(0, c, this.N, c) : ctx.rect(0, 0, this.N, c); ctx.clip();
    for (const [a, z, col] of [[1.25, 1.55, 'rgba(160,140,100,.55)'], [1.6, 1.95, 'rgba(226,204,150,.85)'], [2.02, 2.12, 'rgba(210,190,140,.55)'], [2.15, 2.3, 'rgba(190,170,125,.7)']]) {
      ctx.beginPath(); ctx.ellipse(c, c, r * z, r * z * ry, 0, 0, 6.2832); ctx.ellipse(c, c, r * a, r * a * ry, 0, 0, 6.2832, true); ctx.fillStyle = col; ctx.fill('evenodd');
    }
    ctx.restore();
  }
  draw(dt) {
    if (this.auto && !this.drag) this.yaw += this.speed * dt;
    if (this.dirty) this.prep();
    const { n, pos, lon, row, lf, al } = this.P, d = this.img.data, tex = this.tex, off = this.yaw / (2 * Math.PI) * TW;
    for (let k = 0; k < n; k++) {
      const tx = ((lon[k] + off) | 0) & (TW - 1), ti = (row[k] * TW + tx) * 3, l = lf[k], p = pos[k] * 4;
      d[p] = tex[ti] * l; d[p + 1] = tex[ti + 1] * l; d[p + 2] = tex[ti + 2] * l; d[p + 3] = al[k];
    }
    this.octx.putImageData(this.img, 0, 0);
    const ctx = this.ctx, c = this.N / 2, r = this.r, col = hex(this.b.color); ctx.clearRect(0, 0, this.N, this.N);
    const g = ctx.createRadialGradient(c, c, r * .9, c, c, r * (this.b.tex === 'sun' ? 1.9 : 1.22));
    g.addColorStop(0, `rgba(${col},${this.b.tex === 'sun' ? .55 : .32})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, this.N, this.N);
    this.ring(false); ctx.drawImage(this.off, 0, 0); this.ring(true);
  }
  attach() {
    const cv = this.cv;
    cv.addEventListener('pointerdown', e => { this.drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.classList.add('grab'); this.touched?.(); });
    cv.addEventListener('pointermove', e => {
      if (!this.drag) return; const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y; this.drag = { x: e.clientX, y: e.clientY };
      this.yaw -= dx * .012; const p = clamp(this.pitch + dy * .006, -.9, 1.1); if (Math.abs(p - this.pitch) > .004) { this.pitch = p; this.dirty = true; }
    });
    const up = () => { this.drag = null; cv.classList.remove('grab'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
}
let lastT = 0;
function globeLoop(t) {
  const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
  GLOBES.forEach(g => { if (g.cv.offsetParent !== null) g.draw(dt); });
  requestAnimationFrame(globeLoop);
}
requestAnimationFrame(globeLoop);

/* ---------- estatísticas e comparação ---------- */
const kgTxt = m => m >= 1000 ? fx(m, 0) : m >= 10 ? fx(m, 1) : fx(m, m < .1 ? 4 : 3);
function statsHTML(b) {
  return [['Diâmetro', b.diam], ['Massa', kgTxt(b.mass) + '× a da Terra'], ['Gravidade', fx(b.g) + ' m/s² (' + fx(b.g / 9.81) + '×)'], ['Temperatura', fx(b.temp, 0) + ' °C'], ['Duração do dia', b.day], ['Duração do ano', b.year]]
    .map(([a, v]) => `<div><dt>${a}</dt><dd>${esc(v)}</dd></div>`).join('');
}
const sphereCSS = b => `style="--c:${b.color};--s:${clamp(30 + Math.log10(b.diamKm) * 11, 40, 100) | 0}px"`;
function sphereDot(ctx, cx, cy, r, col) {
  const g = ctx.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r), c = hex(col);
  g.addColorStop(0, `rgb(${Math.min(255, c[0] + 90)},${Math.min(255, c[1] + 90)},${Math.min(255, c[2] + 90)})`); g.addColorStop(.45, col); g.addColorStop(1, `rgb(${c[0] * .2 | 0},${c[1] * .2 | 0},${c[2] * .2 | 0})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
}
function ratioTxt(a, b, v) { const r = a[v] / b[v]; return r >= 1 ? `${fx(r, r < 10 ? 2 : 0)}× maior` : `${fx(1 / r, 1 / r < 10 ? 2 : 0)}× menor`; }
const optionsHTML = sel => BODIES.map(b => `<option value="${b.id}" ${b.id === sel ? 'selected' : ''}>${esc(b.name)}</option>`).join('');

/* componente: comparar dois corpos */
function createCompare(root, a = 'terra', b = 'marte', onUse) {
  root.innerHTML = `<div class="cmp-top glass"><label>Corpo A<select class="sa">${optionsHTML(a)}</select></label><span class="vs">vs</span><label>Corpo B<select class="sb">${optionsHTML(b)}</select></label></div>
  <div class="glass cmp-canvas"><canvas width="900" height="300"></canvas></div><div class="cmp-rows"></div><p class="cmp-sum body"></p>`;
  const sa = $('.sa', root), sb = $('.sb', root), cv = $('canvas', root), ctx = cv.getContext('2d'), rows = $('.cmp-rows', root);
  const draw = () => {
    const A = BY[sa.value], B = BY[sb.value]; ctx.clearRect(0, 0, 900, 300);
    const big = Math.max(A.diamKm, B.diamKm), R = 115;
    [[A, 240], [B, 660]].forEach(([o, x]) => {
      const r = Math.max(3, R * o.diamKm / big); sphereDot(ctx, x, 140, r, o.color);
      ctx.fillStyle = '#eef1ff'; ctx.font = '700 22px "Space Grotesk",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(o.name, x, 285);
      ctx.fillStyle = '#a3accf'; ctx.font = '16px "Space Grotesk",sans-serif'; ctx.fillText(o.diam, x, 264);
    });
    const defs = [['Diâmetro', 'diamKm', v => v, v => fx(v, 0) + ' km'], ['Massa (Terra = 1)', 'mass', v => v, v => kgTxt(v)], ['Gravidade', 'g', v => v, v => fx(v) + ' m/s²'],
      ['Temperatura média', 'temp', v => v + 273.15, v => fx(v, 0) + ' °C'], ['Duração do dia', 'dayH', v => v, v => v >= 48 ? fx(v / 24, 1) + ' dias' : fx(v, 1) + ' h']];
    rows.innerHTML = defs.map(([lb, k, f, fmt]) => {
      const va = f(A[k]), vb = f(B[k]), mx = Math.max(va, vb) || 1;
      return `<div class="cmp-row glass"><b>${lb}</b><div class="bars"><div class="bar2"><i style="width:${Math.max(2, va / mx * 100)}%;background:var(--cyan)"></i><span>${esc(A.name)}: ${fmt(A[k])}</span></div><div class="bar2"><i style="width:${Math.max(2, vb / mx * 100)}%;background:var(--sun)"></i><span>${esc(B.name)}: ${fmt(B[k])}</span></div></div></div>`;
    }).join('');
    const w = 60 * B.g / A.g;
    $('.cmp-sum', root).innerHTML = `Em <strong>${esc(B.name)}</strong> a gravidade é ${fx(B.g / A.g, 2)}× a de ${esc(A.name)}: uma pessoa que pesa 60 kg em ${esc(A.name)} sentiria cerca de <strong>${fx(w, 1)} kg</strong>. Temperatura média: ${fx(A.temp, 0)} °C contra ${fx(B.temp, 0)} °C.`;
    onUse?.();
  };
  sa.onchange = sb.onchange = draw; draw();
  return { set(x, y) { sa.value = x; sb.value = y; draw(); } };
}

/* ---------- página Planetas 3D ---------- */
let globe, gBody = 'terra', cmpApi, terraDone = false;
function selectBody(id) {
  gBody = id; const b = BY[id];
  $$('.bcard').forEach(x => x.classList.toggle('on', x.dataset.id === id));
  $('#bKind').textContent = { estrela: 'Estrela', planeta: 'Planeta', lua: 'Lua', 'anão': 'Planeta anão' }[b.kind]; $('#bName').textContent = b.name; $('#bFact').textContent = b.fact; $('#bStats').innerHTML = statsHTML(b);
  globe.setBody(b); cmpApi?.set('terra', id === 'terra' ? 'marte' : id);
}
function buildTerra() {
  const T = BY.terra, bar = (v, mx, c) => `<i style="width:${Math.max(2, v / mx * 100)}%;background:${c}"></i>`;
  const mxD = Math.max(...BODIES.filter(b => b.id !== 'sol').map(b => b.diamKm)), mxG = Math.max(...BODIES.filter(b => b.id !== 'sol').map(b => b.g));
  $('#terraBox').innerHTML = `<p class="lead">O Sol fica de fora das barras porque é gigantesco, mas as razões estão na tabela. Terra = 1.</p><div class="tbl-wrap glass"><table class="tbl"><thead><tr><th>Corpo</th><th>Tamanho</th><th>Gravidade</th><th>Temperatura</th><th>Dia</th></tr></thead><tbody>` +
    BODIES.map(b => `<tr><td><i class="dot" style="background:${b.color}"></i>${esc(b.name)}</td>
    <td>${fx(b.diamKm / T.diamKm, 2)}×<div class="mini">${b.id === 'sol' ? '' : bar(b.diamKm, mxD, 'var(--violet)')}</div></td>
    <td>${fx(b.g / T.g, 2)}×<div class="mini">${b.id === 'sol' ? '' : bar(b.g, mxG, 'var(--cyan)')}</div></td>
    <td>${fx(b.temp, 0)} °C<small> (${b.temp - T.temp >= 0 ? '+' : ''}${fx(b.temp - T.temp, 0)})</small></td><td>${fx(b.dayH / 24, 2)}×</td></tr>`).join('') + '</tbody></table></div>';
}
onEnter.planetas = once(() => {
  $('#bodyTrack').innerHTML = BODIES.map(b => `<button class="bcard glass" data-id="${b.id}" ${sphereCSS(b)}><i class="sph"></i><span>${esc(b.name)}</span></button>`).join('');
  carousel($('#bodyCar'));
  globe = new Globe($('#globe'), BY.terra);
  $$('.bcard').forEach(b => b.onclick = () => selectBody(b.dataset.id));
  $('#gAuto').onclick = () => { globe.auto = !globe.auto; $('#gAuto').textContent = globe.auto ? 'Pausar rotação' : 'Retomar rotação'; };
  cmpApi = createCompare($('#compBox'), 'terra', 'marte'); buildTerra(); selectBody('terra');
});
