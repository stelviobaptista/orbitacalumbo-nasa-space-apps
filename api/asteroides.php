<?php
// ?date=YYYY-MM-DD -> asteroides que passam perto da Terra nesse dia (NASA NeoWs), os 8 mais próximos
require __DIR__ . '/../config.php';
$date = $_GET['date'] ?? date('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) json_out(['error' => 'Data inválida'], 400);
if ($c = cache_get("neo_$date", 3600 * 6)) { header('Content-Type: application/json; charset=utf-8'); echo $c; exit; }
$raw = http_get("https://api.nasa.gov/neo/rest/v1/feed?start_date=$date&end_date=$date&api_key=" . NASA_API_KEY, 15);
$d = $raw ? json_decode($raw, true) : null;
if (!$d || !isset($d['near_earth_objects'])) json_out(['error' => 'Asteroides indisponíveis (limite da NASA ou sem ligação).'], 502);
$rows = array_map(function ($o) {
    $c = $o['close_approach_data'][0] ?? [];
    return ['name' => trim($o['name'], '()'),
        'diameter_m' => round($o['estimated_diameter']['meters']['estimated_diameter_max'] ?? 0),
        'hazard' => (bool)($o['is_potentially_hazardous_asteroid'] ?? false),
        'speed_kmh' => round((float)($c['relative_velocity']['kilometers_per_hour'] ?? 0)),
        'miss_km' => round((float)($c['miss_distance']['kilometers'] ?? 0)),
        'miss_moon' => round((float)($c['miss_distance']['lunar'] ?? 0), 1)];
}, $d['near_earth_objects'][$date] ?? []);
usort($rows, fn($a, $b) => $a['miss_km'] <=> $b['miss_km']);
$j = json_encode(['date' => $date, 'total' => count($rows), 'items' => array_slice($rows, 0, 8)], JSON_UNESCAPED_UNICODE);
cache_put("neo_$date", $j);
header('Content-Type: application/json; charset=utf-8'); echo $j;
