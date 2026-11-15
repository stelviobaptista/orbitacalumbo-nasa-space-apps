<?php
// GET ?n=10&cat=all|sistema|exploracao|universo&level=0..3 -> perguntas (sem respostas)
// POST {action:'check'|'fifty', id, option} -> validação no servidor
require __DIR__ . '/../config.php';
$all = json_decode(file_get_contents(__DIR__ . '/../data/questions.json'), true);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    foreach ($all as $q) if ($q['id'] === (int)($in['id'] ?? 0)) {
        if (($in['action'] ?? '') === 'fifty') {
            $wrong = array_values(array_diff(array_keys($q['options']), [$q['answer']])); shuffle($wrong);
            json_out(['remove' => array_slice($wrong, 0, 2)]);
        }
        $opt = (int)($in['option'] ?? -1);
        json_out(['ok' => $opt === $q['answer'], 'correct' => $q['answer'], 'why' => $q['why']]);
    }
    json_out(['error' => 'Pergunta inexistente'], 404);
}
$cat = $_GET['cat'] ?? 'all'; $lvl = (int)($_GET['level'] ?? 0); $n = max(3, min(15, (int)($_GET['n'] ?? 10)));
$pool = array_values(array_filter($all, fn($q) => ($cat === 'all' || $q['cat'] === $cat) && ($lvl === 0 || $q['level'] === $lvl)));
if (count($pool) < 3) $pool = $all;
shuffle($pool);
json_out(array_map(fn($q) => ['id' => $q['id'], 'q' => $q['q'], 'cat' => $q['cat'], 'level' => $q['level'],
    'options' => array_map(fn($t, $i) => ['i' => $i, 't' => $t], $q['options'], array_keys($q['options']))], array_slice($pool, 0, $n)));
