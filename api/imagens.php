<?php
// Fotos reais da NASA Image and Video Library (sem chave): ?q=jupiter&n=8
require __DIR__ . '/../config.php';
$q = mb_substr(trim($_GET['q'] ?? ''), 0, 80);
$n = max(1, min(12, (int)($_GET['n'] ?? 8)));
if ($q === '') json_out(['error' => 'Falta a pesquisa'], 400);
$key = 'img_' . md5("$q|$n");
if ($c = cache_get($key, 86400 * 3)) { header('Content-Type: application/json; charset=utf-8'); echo $c; exit; }
$raw = http_get('https://images-api.nasa.gov/search?media_type=image&q=' . urlencode($q), 15);
$d = $raw ? json_decode($raw, true) : null;
if (!$d) json_out(['error' => 'Biblioteca de imagens da NASA indisponível.'], 502);
$items = [];
foreach ($d['collection']['items'] ?? [] as $it) {
    $href = $it['links'][0]['href'] ?? null; $m = $it['data'][0] ?? [];
    if (!$href || empty($m['title'])) continue;
    $items[] = ['title' => $m['title'], 'desc' => mb_substr(strip_tags($m['description'] ?? ''), 0, 220),
                'thumb' => $href, 'large' => preg_replace('/~(thumb|small|medium)\./', '~large.', $href),
                'date' => substr($m['date_created'] ?? '', 0, 4)];
    if (count($items) >= $n) break;
}
$j = json_encode($items, JSON_UNESCAPED_UNICODE);
if ($items) cache_put($key, $j);
header('Content-Type: application/json; charset=utf-8'); echo $j;
