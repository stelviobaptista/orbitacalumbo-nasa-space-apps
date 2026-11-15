'use strict';
/* ===== Simulador de viagem espacial 3D (Canvas 2D, projecção em perspectiva) ===== */
const TP = BODIES.filter(b => b.au > 0 && b.id !== 'lua');
const SHIPS = [['Sonda Voyager (17 km/s)', 17], ['Nave rápida (50 km/s)', 50], ['Nave futurista (300 km/s)', 300], ['Quase à velocidade da luz (299 792 km/s)', 299792]];
const AU_KM = 149597870.7, C_KMS = 299792.458, VR = au => 40 * Math.pow(au, .55);
const VSIZE = { mercurio: 5, venus: 7.5, terra: 8, marte: 6.5, jupiter: 16, saturno: 13.5, urano: 10, neptuno: 10, plutao: 4.5 };
const A0 = { mercurio: .5, venus: 2.2, terra: 4.1, marte: 5.2, jupiter: .9, saturno: 3.3, urano: 5.6, neptuno: 1.8, plutao: 2.7 };
const fmtDist = km => km >= 1e6 ? fx(km / 1e6, 1) + ' milhões de km' : fx(km, 0) + ' km';
const fmtTime = s => s < 90 ? fx(s, 0) + ' s' : s < 5400 ? fx(s / 60, 0) + ' min' : s < 129600 ? fx(s / 3600, 1) + ' h' : s < 63072000 ? fx(s / 86400, 0) + ' dias' : fx(s / 31557600, 1) + ' anos';
const Trip = { yaw: .5, pitch: .55, D: 360, tg: [0, 0, 0], day: 0, fly: null, trail: [], W: 0, H: 0, from: 'terra', to: 'jupiter', ship: 1, drag: null, moved: 0, last: 0 };
const stars3 = Array.from({ length: 520 }, (_, i) => { const r = mulberry(i * 7 + 3), z = r() * 2 - 1, a = r() * 6.2832, s = Math.sqrt(1 - z * z); return [s * Math.cos(a), z, s * Math.sin(a), .3 + r() * .7]; });
const realPos = (id, day) => { const b = BY[id], a = A0[id] + 2 * Math.PI * day / b.yearD; return [b.au * Math.cos(a), 0, b.au * Math.sin(a)]; };
const visPos = (id, day) => { const b = BY[id], a = A0[id] + 2 * Math.PI * day / b.yearD, r = VR(b.au); return [r * Math.cos(a), 0, r * Math.sin(a)]; };
function proj(p) {
  const x = p[0] - Trip.tg[0], y = p[1] - Trip.tg[1], z = p[2] - Trip.tg[2], cy = Math.cos(Trip.yaw), sy = Math.sin(Trip.yaw), cp = Math.cos(Trip.pitch), sp = Math.sin(Trip.pitch);
  const x1 = cy * x - sy * z, z1 = sy * x + cy * z, y2 = cp * y - sp * z1, z2 = sp * y + cp * z1, zc = Trip.D + z2; if (zc < 8) return null;
  const s = Trip.H * 1.0 / zc; return [Trip.W / 2 + x1 * s, Trip.H / 2 - y2 * s, zc, s];
}
function tripInfo() {
  const a = realPos(Trip.from, Trip.day), b = realPos(Trip.to, Trip.day), km = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * AU_KM, v = SHIPS[Trip.ship][1];
  return { km, v, eta: km / v };
}
function shadedBall(ctx, x, y, r, col, sx, sy) {
  const c = hex(col), l = Math.hypot(sx - x, sy - y) || 1, dx = (sx - x) / l, dy = (sy - y) / l, g = ctx.createRadialGradient(x + dx * r * .45, y + dy * r * .45, r * .05, x, y, r * 1.05);
  g.addColorStop(0, `rgb(${Math.min(255, c[0] + 80)},${Math.min(255, c[1] + 80)},${Math.min(255, c[2] + 80)})`); g.addColorStop(.5, col); g.addColorStop(1, `rgb(${c[0] * .18 | 0},${c[1] * .18 | 0},${c[2] * .18 | 0})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
}
function tripFrame(now) {
  requestAnimationFrame(tripFrame);
  if (!isOn('p-viagem')) { Trip.last = now; return; }
  const cv = $('#trip'), ctx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), rect = cv.getBoundingClientRect();
  if (cv.width !== Math.round(rect.width * dpr) || cv.height !== Math.round(rect.height * dpr)) { cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr); }
  Trip.W = cv.width; Trip.H = cv.height; ctx.setTransform(1, 0, 0, 1, 0, 0);
  const dt = Math.min(.05, (now - Trip.last) / 1000); Trip.last = now; const W = Trip.W, H = Trip.H, u = H / 600;
  if (!Trip.fly && !reduced) Trip.day += dt * 12;
  // câmara
  let goal = [0, 0, 0], p = 0, pos = null;
  if (Trip.fly) {
    const f = Trip.fly; p = clamp((now - f.t0) / f.dur, 0, 1); pos = [lerp(f.p0[0], f.p1[0], p), lerp(f.p0[1], f.p1[1], p), lerp(f.p0[2], f.p1[2], p)];
    if ($('#tFollow').checked) goal = pos; else goal = Trip.tg;
    if (Trip.trail.length === 0 || Math.hypot(...pos.map((v, i) => v - Trip.trail[Trip.trail.length - 1][i])) > 2) Trip.trail.push(pos);
  }
  if (Trip.fly && $('#tFollow').checked) Trip.D = lerp(Trip.D, 150, .015);
  if (!Trip.drag || Trip.fly) Trip.tg = Trip.tg.map((v, i) => lerp(v, goal[i], Trip.fly ? .12 : .06));
  ctx.fillStyle = '#04061a'; ctx.fillRect(0, 0, W, H);
  // estrelas
  const cy = Math.cos(Trip.yaw), sy = Math.sin(Trip.yaw), cp = Math.cos(Trip.pitch), sp = Math.sin(Trip.pitch);
  for (const [x, y, z, b] of stars3) {
    const x1 = cy * x - sy * z, z1 = sy * x + cy * z, y2 = cp * y - sp * z1, z2 = sp * y + cp * z1; if (z2 < .15) continue;
    ctx.fillStyle = `rgba(230,236,255,${b * .85})`; const px = W / 2 + x1 / z2 * H * .9, py = H / 2 - y2 / z2 * H * .9; ctx.fillRect(px, py, b * 2 * u + .5, b * 2 * u + .5);
  }
  const sunP = proj([0, 0, 0]), items = [];
  // órbitas
  TP.forEach(b => {
    const r = VR(b.au), sel = b.id === Trip.from || b.id === Trip.to; ctx.beginPath(); let first = true;
    for (let i = 0; i <= 120; i++) { const a = i / 120 * 6.2832, q = proj([r * Math.cos(a), 0, r * Math.sin(a)]); if (!q) { first = true; continue; } first ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); first = false; }
    ctx.strokeStyle = sel ? (b.id === Trip.to ? 'rgba(255,154,60,.55)' : 'rgba(41,211,245,.55)') : 'rgba(120,140,255,.2)'; ctx.lineWidth = sel ? 1.6 * u : u; ctx.stroke();
  });
  // rota prevista
  if (!Trip.fly) {
    const a = proj(visPos(Trip.from, Trip.day)), b = proj(visPos(Trip.to, Trip.day));
    if (a && b) { ctx.setLineDash([8 * u, 8 * u]); ctx.strokeStyle = 'rgba(41,211,245,.6)'; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); }
  }
  if (sunP) items.push({ z: sunP[2], f: () => { const r = 15 * sunP[3], g = ctx.createRadialGradient(sunP[0], sunP[1], r * .6, sunP[0], sunP[1], r * 4); g.addColorStop(0, 'rgba(255,170,60,.55)'); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); shadedBall(ctx, sunP[0], sunP[1], Math.max(4, r), '#ffb347', sunP[0], sunP[1]); } });
  Trip.hit = [];
  TP.forEach(b => {
    const P = Trip.fly ? Trip.fly.planets[b.id] : visPos(b.id, Trip.day), q = proj(P); if (!q) return; const r = Math.max(2.6 * u, VSIZE[b.id] * q[3]);
    Trip.hit.push([b.id, q[0], q[1], Math.max(r, 16 * u)]);
    items.push({ z: q[2], f: () => {
      if (b.ring) { ctx.strokeStyle = 'rgba(226,204,150,.75)'; ctx.lineWidth = Math.max(1.5, r * .22); ctx.beginPath(); let first = true; for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.2832, w = proj([P[0] + Math.cos(a) * VSIZE[b.id] * 1.9, P[1], P[2] + Math.sin(a) * VSIZE[b.id] * 1.9]); if (w) { first ? ctx.moveTo(w[0], w[1]) : ctx.lineTo(w[0], w[1]); first = false; } } ctx.stroke(); }
      shadedBall(ctx, q[0], q[1], r, b.color, sunP ? sunP[0] : q[0], sunP ? sunP[1] : q[1]);
      const sel = b.id === Trip.to || b.id === Trip.from; if (sel) { ctx.strokeStyle = b.id === Trip.to ? '#ff9a3c' : '#29d3f5'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(q[0], q[1], r + 6 * u, 0, 6.2832); ctx.stroke(); }
      ctx.fillStyle = sel ? '#fff' : 'rgba(200,210,255,.8)'; ctx.font = `${sel ? 700 : 400} ${13 * u}px "Space Grotesk",sans-serif`; ctx.textAlign = 'center'; ctx.fillText(b.name, q[0], q[1] - r - 9 * u);
    } });
  });
  items.sort((a, b) => b.z - a.z).forEach(i => i.f());
  // nave
  if (Trip.fly) {
    const f = Trip.fly; ctx.strokeStyle = 'rgba(255,154,60,.7)'; ctx.lineWidth = 2 * u; ctx.beginPath(); let st = true;
    Trip.trail.forEach(t => { const q = proj(t); if (q) { st ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); st = false; } }); ctx.stroke();
    const q = proj(pos), q2 = proj([pos[0] + (f.p1[0] - f.p0[0]) * .02, pos[1], pos[2] + (f.p1[2] - f.p0[2]) * .02]);
    if (q && q2) {
      const ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]), s = 11 * u; ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 3); g.addColorStop(0, 'rgba(41,211,245,.5)'); g.addColorStop(1, 'rgba(41,211,245,0)'); ctx.fillStyle = g; ctx.fillRect(-s * 3, -s * 3, s * 6, s * 6);
      ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(-s * .9, 0); ctx.lineTo(-s * (1.8 + Math.random() * .8), -s * .3); ctx.lineTo(-s * (1.8 + Math.random() * .8), s * .3); ctx.fill();
      ctx.fillStyle = '#eef1ff'; ctx.beginPath(); ctx.moveTo(s * 1.3, 0); ctx.lineTo(-s * .9, -s * .65); ctx.lineTo(-s * .5, 0); ctx.lineTo(-s * .9, s * .65); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#29d3f5'; ctx.beginPath(); ctx.arc(s * .2, 0, s * .22, 0, 6.2832); ctx.fill(); ctx.restore();
    }
    // efeito de velocidade
    const k = clamp(Math.log10(f.v) / 5.5, 0, 1); if (k > .2 && !reduced) { ctx.strokeStyle = `rgba(200,220,255,${.15 + k * .35})`; ctx.lineWidth = u; for (let i = 0; i < 70; i++) { const r = mulberry(i + 1), a = r() * 6.2832, d0 = (.12 + r() * .35) * H, l = k * (.05 + r() * .22) * H * (.6 + .4 * Math.sin(now / 90 + i)); ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * d0, H / 2 + Math.sin(a) * d0); ctx.lineTo(W / 2 + Math.cos(a) * (d0 + l), H / 2 + Math.sin(a) * (d0 + l)); ctx.stroke(); } }
    // HUD
    const left = f.km * (1 - p), cur = [lerp(f.r0[0], f.r1[0], p), 0, lerp(f.r0[2], f.r1[2], p)], earth = f.earth, dE = Math.hypot(cur[0] - earth[0], cur[2] - earth[2]) * AU_KM;
    $('#hVel').textContent = fx(f.v, 0) + ' km/s'; $('#hTime').textContent = fmtTime(f.eta * p); $('#hLeft').textContent = fmtDist(left); $('#hRadio').textContent = fmtTime(dE / C_KMS);
    if (p >= 1) arrive();
  } else {
    const t = tripInfo(); $('#tDist').textContent = fmtDist(t.km); $('#tEta').textContent = fmtTime(t.eta);
  }
}
function arrive() {
  const f = Trip.fly, b = BY[Trip.to]; Trip.fly = null; Trip.from = Trip.to; Trip.to = Trip.from === 'terra' ? 'marte' : 'terra'; $('#tFrom').value = Trip.from; $('#tTo').value = Trip.to; Trip.D = 360; $('#tHud').hidden = true; $('#tGo').textContent = 'Iniciar viagem'; setTripCtl(false);
  const a = $('#tArrive'); a.hidden = false; a.innerHTML = `<h3>Chegaste a ${esc(b.name)}!</h3><p>Viagem real a ${fx(f.v, 0)} km/s: <strong>${fmtTime(f.eta)}</strong> para ${fmtDist(f.km)} em linha recta.</p><p class="small">${esc(b.fact)}</p><div class="row"><button class="btn" id="tSee">Ver ${esc(b.name)} em 3D</button><button class="btn ghost" id="tAgain">Nova viagem</button></div>`;
  $('#tAgain').onclick = () => { a.hidden = true; }; $('#tSee').onclick = () => { a.hidden = true; location.hash = '#/planetas'; setTimeout(() => selectBody(b.id), 50); };
  window.onTripArrive?.(b.id);
}
function setTripCtl(dis) { ['tFrom', 'tTo', 'tShip'].forEach(i => $('#' + i).disabled = dis); }
function startTrip() {
  if (Trip.fly) { Trip.fly = null; Trip.trail = []; $('#tHud').hidden = true; $('#tGo').textContent = 'Iniciar viagem'; setTripCtl(false); return; }
  if (Trip.from === Trip.to) { $('#tEta').textContent = 'Escolhe destinos diferentes'; return; }
  const info = tripInfo(), planets = {}; TP.forEach(b => planets[b.id] = visPos(b.id, Trip.day)); $('#tArrive').hidden = true; Trip.trail = [];
  Trip.fly = { t0: performance.now(), dur: 11000, p0: planets[Trip.from], p1: planets[Trip.to], r0: realPos(Trip.from, Trip.day), r1: realPos(Trip.to, Trip.day), earth: realPos('terra', Trip.day), planets, km: info.km, v: info.v, eta: info.eta };
  $('#tHud').hidden = false; $('#tGo').textContent = 'Cancelar viagem'; setTripCtl(true); window.onTripStart?.();
}
function travelSet(o = {}) { if (o.from) { Trip.from = o.from; $('#tFrom').value = o.from; } if (o.to) { Trip.to = o.to; $('#tTo').value = o.to; } if (o.ship != null) { Trip.ship = o.ship; $('#tShip').value = o.ship; } }
onEnter.viagem = once(() => {
  const opts = (sel) => TP.map(b => `<option value="${b.id}" ${b.id === sel ? 'selected' : ''}>${esc(b.name)}</option>`).join('');
  $('#tFrom').innerHTML = opts(Trip.from); $('#tTo').innerHTML = opts(Trip.to); $('#tShip').innerHTML = SHIPS.map((s, i) => `<option value="${i}" ${i === Trip.ship ? 'selected' : ''}>${s[0]}</option>`).join('');
  $('#tFrom').onchange = e => Trip.from = e.target.value; $('#tTo').onchange = e => Trip.to = e.target.value; $('#tShip').onchange = e => Trip.ship = +e.target.value; $('#tGo').onclick = startTrip;
  const cv = $('#trip');
  cv.addEventListener('pointerdown', e => { Trip.drag = { x: e.clientX, y: e.clientY }; Trip.moved = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!Trip.drag) return; const dx = e.clientX - Trip.drag.x, dy = e.clientY - Trip.drag.y; Trip.drag = { x: e.clientX, y: e.clientY }; Trip.moved += Math.abs(dx) + Math.abs(dy); Trip.yaw -= dx * .006; Trip.pitch = clamp(Trip.pitch + dy * .005, -1.4, 1.4); });
  cv.addEventListener('pointerup', e => {
    Trip.drag = null; if (Trip.moved < 5 && !Trip.fly) { const r = cv.getBoundingClientRect(), s = cv.width / r.width, x = (e.clientX - r.left) * s, y = (e.clientY - r.top) * s, h = (Trip.hit || []).find(([, hx, hy, hr]) => Math.hypot(x - hx, y - hy) < hr); if (h && h[0] !== Trip.from) { Trip.to = h[0]; $('#tTo').value = h[0]; } }
  });
  cv.addEventListener('wheel', e => { e.preventDefault(); Trip.D = clamp(Trip.D * Math.exp(e.deltaY * .001), 90, 1300); }, { passive: false });
  $('#tZin').onclick = () => Trip.D = clamp(Trip.D * .78, 90, 1300); $('#tZout').onclick = () => Trip.D = clamp(Trip.D * 1.28, 90, 1300);
  requestAnimationFrame(tripFrame);
});
