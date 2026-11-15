<?php
// Diagnóstico: /api/status.php  ou  /api/status.php?test=1 (testa a Claude)
require __DIR__ . '/../config.php';
$out = ['php' => PHP_VERSION, 'curl' => function_exists('curl_init'), 'openssl' => extension_loaded('openssl'), 'allow_url_fopen' => (bool)ini_get('allow_url_fopen'), 'claude_key' => ai_provider() !== '', 'provider' => ai_provider() ?: 'nenhum',
        'nasa_key' => NASA_API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (limite baixo)' : 'personalizada',
        'cache_gravavel' => is_writable(__DIR__ . '/../cache')];
if (isset($_GET['test'])) {
    $r = claude_call('Responde só com a palavra: ok', 'ping', 20);
    $out['claude_teste'] = $r ?? ('FALHOU: ' . $CLAUDE_ERR);
}
json_out($out);
