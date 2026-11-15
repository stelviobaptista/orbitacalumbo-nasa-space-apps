<?php $bodies = file_get_contents(__DIR__ . '/data/bodies.json'); ?>
<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Órbita Calumbo · Missões, planetas em 3D e viagens espaciais com dados da NASA</title>
<meta name="description" content="Plataforma educativa de astronomia: missões, planetas em 3D, laboratório de gravidade, simulador de viagem espacial e dados reais da NASA.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Unbounded:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<canvas id="stars" aria-hidden="true"></canvas>
<div class="nebula" aria-hidden="true"><i></i><i></i><i></i></div>
<canvas id="fx" aria-hidden="true"></canvas>

<!-- ECRÃ DE INÍCIO -->
<div id="splash">
  <button class="skip" id="skip">Saltar</button>
  <div class="s-title"><h1>Órbita Calumbo</h1><p>Missões, planetas em 3D e viagens espaciais com dados reais da NASA</p></div>
  <div class="s-count" id="count" aria-live="assertive"></div>
  <div class="smoke" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <svg class="rocket" viewBox="0 0 100 230" aria-hidden="true">
    <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c2"/><stop offset=".4" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ff4f9a" stop-opacity="0"/></linearGradient></defs>
    <g class="flame"><path d="M40 156 Q50 228 60 156Z" fill="url(#fl)"/></g>
    <path d="M32 112 L8 166 L32 154Z" fill="#ff4f9a"/><path d="M68 112 L92 166 L68 154Z" fill="#ff4f9a"/>
    <path d="M50 8 C72 40 74 92 69 156 H31 C26 92 28 40 50 8Z" fill="#eef1ff"/>
    <path d="M50 8 C58 20 63 30 65 40 H35 C37 30 42 20 50 8Z" fill="#ff9a3c"/>
    <circle cx="50" cy="74" r="12" fill="#29d3f5" stroke="#8b6cff" stroke-width="4"/>
    <rect x="37" y="156" width="26" height="9" rx="3" fill="#8b6cff"/>
  </svg>
  <button class="launch" id="launch"><span>Iniciar missão</span></button>
</div>

<header class="top">
  <a class="brand" href="#/inicio"><span class="logo"></span>Órbita Calumbo</a>
  <nav class="nav" aria-label="Páginas">
    <a href="#/inicio" data-p="inicio">Início</a>
    <a href="#/missoes" data-p="missoes">Missões</a>
    <a href="#/planetas" data-p="planetas">Planetas 3D</a>
    <a href="#/laboratorio" data-p="lab">Laboratório</a>
    <a href="#/viagem" data-p="viagem">Viagem 3D</a>
    <a href="#/foto" data-p="dados">Dados NASA</a>
    <a href="#/astronomo" data-p="astronomo">Astrónomo</a>
    <a href="#/quiz" data-p="quiz">Quiz</a>
  </nav>
</header>

<main>
<!-- ============ INÍCIO ============ -->
<section class="page" id="p-inicio">
  <div class="hero">
    <div class="hero-text">
      <p class="eyebrow rv">NASA Space Apps · Calumbo · Desafio 3</p>
      <h1 class="rv grad">Aprende astronomia em missões.</h1>
      <p class="lead rv">Explora planetas em 3D, faz experiências com a gravidade, viaja pelo Sistema Solar e usa dados reais da NASA. Tudo em português.</p>
      <div class="row rv"><a class="btn" href="#/missoes">Começar a Missão 01</a><a class="btn ghost" href="#/planetas">Explorar em 3D</a></div>
    </div>
    <div class="orbit rv" aria-hidden="true"><i class="sun"></i>
      <div class="ring r1"><b style="--c:#b1a8a0"></b></div><div class="ring r2"><b style="--c:#e6c38a"></b></div>
      <div class="ring r3"><b style="--c:#4f8fe8"></b></div><div class="ring r4"><b style="--c:#d4684a"></b></div>
      <div class="ring r5"><b style="--c:#d9a77a"></b></div>
    </div>
  </div>
  <div class="wrap">
    <p class="eyebrow rv">Como aprendes</p>
    <h2 class="rv">Cada missão tem cinco etapas</h2>
    <div class="steps5 rv">
      <div><b>1</b><span>Problema científico</span></div><div><b>2</b><span>Investigação</span></div><div><b>3</b><span>Experiência</span></div><div><b>4</b><span>Desafio</span></div><div><b>5</b><span>Avaliação</span></div>
    </div>
    <p class="eyebrow rv">Ferramentas</p>
    <h2 class="rv">Tudo o que precisas para explorar</h2>
    <div class="cards">
      <a class="glass tilt rv" href="#/missoes"><span class="ico">01</span><b>Missões</b><span>Quatro missões com problema, investigação, experiência, desafio e avaliação.</span></a>
      <a class="glass tilt rv" href="#/planetas"><span class="ico">3D</span><b>Planetas em 3D</b><span>Roda cada mundo, compara tamanhos, temperaturas, gravidade e dias.</span></a>
      <a class="glass tilt rv" href="#/laboratorio"><span class="ico">g</span><b>Laboratório</b><span>Muda a massa de um objecto e simula o efeito da gravidade no movimento.</span></a>
      <a class="glass tilt rv" href="#/viagem"><span class="ico">&#9992;</span><b>Viagem espacial 3D</b><span>Pilota uma nave pelo Sistema Solar e vê quanto tempo demoras.</span></a>
      <a class="glass tilt rv" href="#/foto"><span class="ico">NASA</span><b>Dados da NASA</b><span>Foto do dia e radar de asteroides, traduzidos para português.</span></a>
      <a class="glass tilt rv" href="#/astronomo"><span class="ico">IA</span><b>Astrónomo e quiz</b><span>Faz perguntas à IA e testa o que aprendeste.</span></a>
    </div>
    <p class="eyebrow rv">Hoje no espaço</p>
    <div class="live rv">
      <a class="glass tilt" href="#/foto"><small>Foto do dia</small><strong id="liveApod">A carregar…</strong></a>
      <a class="glass tilt" href="#/foto"><small>Asteroides a passar hoje</small><strong id="liveNeo">A carregar…</strong></a>
      <a class="glass tilt" href="#/foto"><small>O mais próximo</small><strong id="liveNear">A carregar…</strong></a>
    </div>
    <div class="car big rv" id="homeCar"><button class="car-btn prev" aria-label="Anterior">‹</button><div class="car-track" id="homeTrack"></div><button class="car-btn next" aria-label="Seguinte">›</button></div>
  </div>
</section>

<!-- ============ MISSÕES ============ -->
<section class="page" id="p-missoes"><div class="wrap">
  <div id="mHub">
    <p class="eyebrow rv">Aprendizagem por missões</p>
    <h2 class="rv">Escolhe a tua missão</h2>
    <p class="lead rv">Cada missão começa com um problema científico. Investiga, experimenta, resolve o desafio e faz a avaliação para ganhar estrelas.</p>
    <div class="rankbox glass rv"><div><small>A tua patente</small><strong id="mRank">Cadete</strong></div><div><small>Estrelas</small><strong id="mStars">0 / 12</strong></div><div class="bar wide"><i id="mBar"></i></div></div>
    <div class="mgrid" id="mGrid"></div>
  </div>
  <div id="mView" hidden></div>
</div></section>

<!-- ============ PLANETAS 3D ============ -->
<section class="page" id="p-planetas"><div class="wrap">
  <p class="eyebrow rv">Explorador 3D</p>
  <h2 class="rv">Planetas, luas e estrelas</h2>
  <div class="car rv" id="bodyCar"><button class="car-btn prev" aria-label="Anterior">‹</button><div class="car-track" id="bodyTrack"></div><button class="car-btn next" aria-label="Seguinte">›</button></div>
  <div class="tabs rv" data-tabs id="plTabs"><button class="on" data-tab="v3d">Explorar em 3D</button><button data-tab="comp">Comparar</button><button data-tab="terra">Terra vs todos</button></div>
  <div class="tabpane on" data-pane="v3d">
    <div class="globe-grid">
      <div class="glass globe-box"><canvas id="globe" width="520" height="520" aria-label="Planeta em 3D. Arrasta para rodar."></canvas><div class="row center"><button class="btn ghost" id="gAuto">Pausar rotação</button><span class="small">Arrasta para rodar</span></div></div>
      <div class="glass pinfo"><p class="tag" id="bKind"></p><h3 id="bName"></h3><p class="body" id="bFact"></p><dl class="stats" id="bStats"></dl></div>
    </div>
  </div>
  <div class="tabpane" data-pane="comp"><div id="compBox"></div></div>
  <div class="tabpane" data-pane="terra"><div id="terraBox"></div></div>
</div></section>

<!-- ============ LABORATÓRIO ============ -->
<section class="page" id="p-lab"><div class="wrap">
  <p class="eyebrow rv">Laboratório de gravidade</p>
  <h2 class="rv">Experimenta a física do espaço</h2>
  <div class="tabs rv" data-tabs><button class="on" data-tab="peso">Massa e peso</button><button data-tab="mov">Gravidade em movimento</button></div>
  <div class="tabpane on" data-pane="peso"><div id="labPeso"></div></div>
  <div class="tabpane" data-pane="mov"><div id="labMov"></div></div>
</div></section>

<!-- ============ VIAGEM 3D ============ -->
<section class="page" id="p-viagem"><div class="wrap">
  <p class="eyebrow rv">Simulador de viagem espacial</p>
  <h2 class="rv">Pilota uma nave pelo Sistema Solar</h2>
  <div class="trip-grid">
    <div class="glass trip-ctl">
      <label>Origem<select id="tFrom"></select></label>
      <label>Destino<select id="tTo"></select></label>
      <label>Nave<select id="tShip"></select></label>
      <div class="kv"><small>Distância</small><strong id="tDist">—</strong></div>
      <div class="kv"><small>Duração real da viagem</small><strong id="tEta">—</strong></div>
      <button class="btn" id="tGo">Iniciar viagem</button>
      <label class="check"><input type="checkbox" id="tFollow" checked> A câmara segue a nave</label>
      <p class="small">Arrasta para rodar a vista. Roda do rato ou os botões para fazer zoom. Toca num planeta para o escolher como destino.</p>
    </div>
    <div class="glass trip-view"><canvas id="trip"></canvas>
      <div class="hud" id="tHud" hidden><div><small>Velocidade</small><b id="hVel"></b></div><div><small>Tempo de viagem</small><b id="hTime"></b></div><div><small>Distância restante</small><b id="hLeft"></b></div><div><small>Sinal de rádio até à Terra</small><b id="hRadio"></b></div></div>
      <div class="zoom"><button id="tZin" aria-label="Aproximar">+</button><button id="tZout" aria-label="Afastar">−</button></div>
      <div class="arrive" id="tArrive" hidden></div>
    </div>
  </div>
</div></section>

<!-- ============ DADOS NASA ============ -->
<section class="page" id="p-dados"><div class="wrap">
  <p class="eyebrow rv">Dados reais da NASA</p>
  <h2 class="rv">Foto do dia e asteroides</h2>
  <div class="tabs rv" data-tabs id="dadosTabs"><button class="on" data-tab="foto">Foto do dia</button><button data-tab="asteroides">Radar de asteroides</button></div>
  <div class="tabpane on" data-pane="foto">
    <div class="tabs" data-tabs id="fotoTabs"><button class="on" data-tab="hoje">Imagem</button><button data-tab="galeria">Galeria dos últimos dias</button></div>
    <div class="tabpane on" data-pane="hoje">
      <article class="viewer glass">
        <div class="ph vimg"><img id="apodImg" class="zoom" alt="" hidden><div class="loader" id="apodLoad"></div></div>
        <div class="vinfo">
          <p class="kicker" id="apodDate">A carregar…</p><h3 id="apodTitle"></h3><p id="apodText" class="body"></p><p class="badge" id="apodBadge" hidden></p>
          <div class="row"><button class="btn ghost" id="apodPrev">‹ Dia anterior</button><button class="btn ghost" id="apodNext">Dia seguinte ›</button><button class="btn" id="apodExplain">Explica-me de forma simples</button><a class="btn ghost" id="apodHD" target="_blank" rel="noopener" hidden>Alta resolução</a></div>
        </div>
      </article>
    </div>
    <div class="tabpane" data-pane="galeria"><p class="lead">Escolhe uma imagem para a ver em grande.</p>
      <div class="car" id="galCar"><button class="car-btn prev" aria-label="Anterior">‹</button><div class="car-track" id="galTrack"></div><button class="car-btn next" aria-label="Seguinte">›</button></div></div>
  </div>
  <div class="tabpane" data-pane="asteroides">
    <p class="lead" id="neoLead">Escolhe um dia.</p>
    <div class="tabs" id="neoTabs"></div>
    <div class="neo-grid">
      <div class="glass radar-box"><svg id="radar" viewBox="-200 -200 400 400" role="img" aria-label="Radar dos asteroides"></svg><p class="small">Cada ponto é um asteroide. Os anéis marcam 1, 5, 20 e 100 vezes a distância Terra–Lua (escala logarítmica).</p></div>
      <div class="neo" id="neoList"></div>
    </div>
  </div>
</div></section>

<!-- ============ ASTRÓNOMO ============ -->
<section class="page" id="p-astronomo"><div class="wrap narrow">
  <p class="eyebrow rv">Inteligência artificial</p>
  <h2 class="rv">Pergunta ao astrónomo</h2>
  <p class="status" id="aiStatus">A verificar a IA…</p>
  <div class="chat glass" id="chat" aria-live="polite"><div class="msg bot">Olá! Sou o astrónomo da Órbita Calumbo. Pergunta-me o que quiseres sobre o espaço.</div></div>
  <div class="chips" id="chips"><button>Porque é que o céu é escuro à noite?</button><button>O que é um buraco negro?</button><button>Como se formam as auroras?</button><button>Há vida noutros planetas?</button><button>Porque é que Marte é vermelho?</button></div>
  <label class="check"><input type="checkbox" id="useCtx"> Usar a foto do dia como contexto</label>
  <div class="row ask"><input id="askInput" maxlength="400" placeholder="Escreve a tua pergunta…" aria-label="A tua pergunta"><button class="btn" id="askBtn">Perguntar</button></div>
</div></section>

<!-- ============ QUIZ ============ -->
<section class="page" id="p-quiz"><div class="wrap narrow">
  <p class="eyebrow rv">Testa o que sabes</p>
  <h2 class="rv">Quiz espacial</h2>
  <div class="tabs rv" data-tabs id="quizTabs"><button class="on" data-tab="jogar">Jogar</button><button data-tab="ranking">Ranking</button><button data-tab="regras">Como jogar</button></div>
  <div class="tabpane on" data-pane="jogar">
    <div id="qSetup" class="glass pad">
      <h3>Prepara a missão</h3><p class="small">Tema</p>
      <div class="opts" data-group="cat"><button class="chip on" data-v="all">Tudo</button><button class="chip" data-v="sistema">Sistema Solar</button><button class="chip" data-v="exploracao">Exploração</button><button class="chip" data-v="universo">Universo</button></div>
      <p class="small">Dificuldade</p>
      <div class="opts" data-group="level"><button class="chip on" data-v="0">Misto</button><button class="chip" data-v="1">Cadete</button><button class="chip" data-v="2">Piloto</button><button class="chip" data-v="3">Comandante</button></div>
      <button class="btn big-btn" id="qStart">Lançar quiz</button><button class="btn ghost" id="qSound">Som: desligado</button>
    </div>
    <div id="qPlay" class="glass pad" hidden>
      <div class="hud2"><div class="hearts" id="qHearts"></div><div class="hud-mid"><strong id="qPts">0</strong><small>pontos</small></div><div class="streak" id="qStreak"></div>
        <div class="timer"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" class="t-bg"/><circle cx="20" cy="20" r="17" class="t-fg" id="qRing"/></svg><b id="qTime"></b></div></div>
      <div class="bar"><i id="qBar"></i></div>
      <p class="kicker" id="qMeta"></p><h3 class="q-t" id="qText"></h3><div class="answers" id="qAns"></div>
      <div class="row"><button class="btn ghost" id="qFifty">50/50</button><button class="btn ghost" id="qSkip">Saltar</button></div>
      <div class="explain" id="qExplain" hidden><p id="qWhy"></p><button class="btn" id="qNext">Seguinte</button></div>
    </div>
    <div id="qEnd" class="glass pad" hidden>
      <p class="kicker">Missão concluída</p><h3 id="qRank"></h3>
      <div class="stats end-stats"><div><dt>Pontos</dt><dd id="eP"></dd></div><div><dt>Certas</dt><dd id="eC"></dd></div><div><dt>Melhor sequência</dt><dd id="eS"></dd></div></div>
      <div class="row"><input id="qName" maxlength="20" placeholder="O teu nome" aria-label="O teu nome"><button class="btn" id="qSave">Guardar no ranking</button></div>
      <div class="row"><button class="btn ghost" id="qAgain">Jogar de novo</button></div>
    </div>
  </div>
  <div class="tabpane" data-pane="ranking"><ol class="rank glass pad" id="rankList"><li>A carregar…</li></ol></div>
  <div class="tabpane" data-pane="regras"><div class="glass pad body"><p>10 perguntas, 3 vidas. Cada resposta certa dá 100 pontos mais um bónus pela rapidez.</p><p>Acertar em sequência aumenta o bónus. Errar ou ficar sem tempo custa uma vida.</p><p>Tens um 50/50 e um Saltar por jogo. Guarda a pontuação para entrares no ranking.</p></div></div>
</div></section>
</main>

<footer class="foot">
  <div class="foot-in">
    <div class="foot-brand"><span class="logo"></span><div><b>Órbita Calumbo</b><small>Astronomia para todos, com dados reais da NASA.</small></div></div>
    <nav class="foot-nav" aria-label="Rodapé"><a href="#/missoes">Missões</a><a href="#/planetas">Planetas 3D</a><a href="#/laboratorio">Laboratório</a><a href="#/viagem">Viagem 3D</a><a href="#/foto">Dados NASA</a><a href="#/quiz">Quiz</a></nav>
    <p class="made">Desenvolvido por <strong>Zenith Core</strong></p>
    <p class="credit">NASA Space Apps Challenge · Calumbo · Imagens e dados: NASA APOD, NeoWs e Image and Video Library.</p>
  </div>
</footer>

<div id="lightbox" hidden><img alt=""><button aria-label="Fechar">×</button></div>
<script>window.BODIES = <?= $bodies ?>;</script>
<script src="assets/js/core.js"></script>
<script src="assets/js/data.js"></script>
<script src="assets/js/planets.js"></script>
<script src="assets/js/lab.js"></script>
<script src="assets/js/travel.js"></script>
<script src="assets/js/missions.js"></script>
<script>go();</script>
</body>
</html>
