<?php
// GET            -> lista de missões
// GET ?id=N      -> missão (sem respostas)
// POST {id, action:'challenge', value}  -> valida o desafio no servidor
// POST {id, action:'eval', answers:[...]} -> corrige a avaliação (índices originais das opções)
require __DIR__ . '/../config.php';
$all = json_decode(file_get_contents(__DIR__ . '/../data/missions.json'), true);
function find(array $all, int $id): ?array { foreach ($all as $m) if ($m['id'] === $id) return $m; return null; }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    $m = find($all, (int)($in['id'] ?? 0));
    if (!$m) json_out(['error' => 'Missão inexistente'], 404);
    if (($in['action'] ?? '') === 'challenge') {
        $d = $m['desafio']; $v = $in['value'] ?? null;
        $ok = $d['tipo'] === 'numero' ? (is_numeric($v) && abs((float)$v - $d['esperado']) <= $d['tolerancia']) : ((int)$v === $d['esperado']);
        json_out($ok ? ['ok' => true, 'explicacao' => $d['explicacao']] : ['ok' => false, 'dica' => $d['dica']]);
    }
    if (($in['action'] ?? '') === 'eval') {
        $ans = $in['answers'] ?? []; $score = 0; $rev = [];
        foreach ($m['avaliacao'] as $k => $q) {
            $ok = isset($ans[$k]) && (int)$ans[$k] === $q['r']; $score += $ok ? 1 : 0;
            $rev[] = ['ok' => $ok, 'correct' => $q['r'], 'porque' => $q['porque']];
        }
        json_out(['score' => $score, 'total' => count($m['avaliacao']), 'review' => $rev]);
    }
    json_out(['error' => 'Acção inválida'], 400);
}
if (!isset($_GET['id'])) json_out(array_map(fn($m) => ['id' => $m['id'], 'titulo' => $m['titulo'], 'subtitulo' => $m['subtitulo'], 'cor' => $m['cor'], 'duracao' => $m['duracao']], $all));
$m = find($all, (int)$_GET['id']);
if (!$m) json_out(['error' => 'Missão inexistente'], 404);
unset($m['desafio']['esperado'], $m['desafio']['tolerancia'], $m['desafio']['explicacao']);
$m['avaliacao'] = array_map(fn($q) => ['q' => $q['q'], 'o' => array_map(fn($t, $i) => ['i' => $i, 't' => $t], $q['o'], array_keys($q['o']))], $m['avaliacao']);
json_out($m);
