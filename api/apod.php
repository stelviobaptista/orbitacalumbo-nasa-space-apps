<?php
// ?back=N  -> foto de N dias atrás (0 = hoje, hora de Nova Iorque) traduzida para PT
// ?range=N -> lista das últimas N fotos (sem tradução)
require __DIR__ . '/../config.php';
$today = nasa_today();
$base = 'https://api.nasa.gov/planetary/apod?thumbs=true&api_key=' . NASA_API_KEY;

if (isset($_GET['range'])) {
    $n = max(2, min(20, (int)$_GET['range']));
    $start = (clone $today)->modify('-' . ($n - 1) . ' days')->format('Y-m-d');
    $key = "apodrange_{$start}_$n";
    if ($c = cache_get($key, 3600)) { header('Content-Type: application/json; charset=utf-8'); echo $c; exit; }
    $raw = http_get("$base&start_date=$start&end_date=" . $today->format('Y-m-d'), 20);
    $arr = $raw ? json_decode($raw, true) : null;
    if (!is_array($arr) || isset($arr['error']) || isset($arr['msg'])) json_out(['error' => 'Galeria indisponível (limite da NASA ou sem ligação).'], 502);
    $items = [];
    foreach (array_reverse($arr) as $a) {
        $img = $a['media_type'] === 'video' ? ($a['thumbnail_url'] ?? '') : ($a['url'] ?? '');
        if (!$img) continue;
        $items[] = ['title' => $a['title'], 'date' => $a['date'], 'img' => $img,
                    'back' => (int)$today->diff(new DateTime($a['date'], new DateTimeZone('America/New_York')))->days];
    }
    $j = json_encode($items, JSON_UNESCAPED_UNICODE); cache_put($key, $j);
    header('Content-Type: application/json; charset=utf-8'); echo $j; exit;
}

$back = max(0, min(365, (int)($_GET['back'] ?? 0)));
$d = null;
for ($try = $back; $try <= $back + 1 && !$d; $try++) { // se "hoje" ainda não existe na NASA, usa ontem
    $date = (clone $today)->modify("-$try days")->format('Y-m-d');
    $key = "apod_{$date}_pt";
    if ($c = cache_get($key, 86400)) { header('Content-Type: application/json; charset=utf-8'); echo $c; exit; }
    $raw = http_get("$base&date=$date");
    $x = $raw ? json_decode($raw, true) : null;
    if (is_array($x) && isset($x['title'])) $d = $x;
}
if (!$d) json_out(['error' => 'A NASA não respondeu (pode ser o limite da DEMO_KEY). Define NASA_API_KEY em config.local.php.'], 502);

$d['translated'] = false;
$out = claude_call('Traduz para português claro e correcto. Responde só com JSON válido {"title":"...","explanation":"..."}, sem texto extra.',
    json_encode(['title' => $d['title'], 'explanation' => $d['explanation']], JSON_UNESCAPED_UNICODE), 1500);
$t = $out ? json_decode(trim(preg_replace('/^```(?:json)?|```$/m', '', $out)), true) : null;
if (is_array($t) && !empty($t['title']) && !empty($t['explanation'])) {
    $d['title'] = $t['title']; $d['explanation'] = $t['explanation']; $d['translated'] = true;
}
$j = json_encode($d, JSON_UNESCAPED_UNICODE);
cache_put("apod_{$d['date']}_pt", $j);
header('Content-Type: application/json; charset=utf-8'); echo $j;
