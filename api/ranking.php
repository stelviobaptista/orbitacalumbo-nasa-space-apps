<?php
require __DIR__ . '/../config.php';
$file = __DIR__ . '/../data/ranking.json';
$rank = is_file($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    $name = trim(strip_tags($in['name'] ?? '')); $pts = (int)($in['points'] ?? 0); $ok = (int)($in['correct'] ?? 0);
    if ($name === '' || mb_strlen($name) > 20 || $pts < 0 || $pts > 3500 || $ok < 0 || $ok > 15) json_out(['error' => 'Dados inválidos'], 400);
    $rank[] = ['name' => $name, 'points' => $pts, 'correct' => $ok, 'date' => date('Y-m-d')];
    usort($rank, fn($a, $b) => $b['points'] <=> $a['points']);
    file_put_contents($file, json_encode(array_slice($rank, 0, 20), JSON_UNESCAPED_UNICODE), LOCK_EX);
    $rank = array_slice($rank, 0, 20);
}
json_out(array_slice($rank, 0, 10));
