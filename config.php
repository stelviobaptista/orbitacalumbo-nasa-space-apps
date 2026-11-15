<?php
// Configuração local (chaves) em config.local.php — ver config.local.example.php
if (is_file(__DIR__ . '/config.local.php')) require __DIR__ . '/config.local.php';
defined('NASA_API_KEY')      || define('NASA_API_KEY', getenv('NASA_API_KEY') ?: 'DEMO_KEY');
defined('ANTHROPIC_API_KEY') || define('ANTHROPIC_API_KEY', getenv('ANTHROPIC_API_KEY') ?: '');
defined('GEMINI_API_KEY')    || define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');
defined('GEMINI_MODEL')      || define('GEMINI_MODEL', 'gemini-2.5-flash'); // confirma o nome em aistudio.google.com
defined('CLAUDE_MODEL')      || define('CLAUDE_MODEL', 'claude-sonnet-5-5');
defined('INSECURE_SSL')      || define('INSECURE_SSL', false); // true só em localhost/XAMPP se der erro de certificado SSL
$CLAUDE_ERR = '';

function cache_file(string $name): string {
    $d = __DIR__ . '/cache';
    if (!is_dir($d)) @mkdir($d, 0775, true);
    if (!is_writable($d)) $d = sys_get_temp_dir();
    return $d . '/' . preg_replace('/[^a-z0-9_.-]/i', '_', $name);
}
function cache_get(string $name, int $ttl): ?string {
    $f = cache_file($name);
    return (is_file($f) && time() - filemtime($f) < $ttl) ? file_get_contents($f) : null;
}
function cache_put(string $name, string $data): void { @file_put_contents(cache_file($name), $data); }

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Pedido HTTP que funciona com cURL ou, se não existir, com streams (precisa de allow_url_fopen e openssl).
// Devolve [código, corpo, erro].
function http_request(string $url, string $method = 'GET', array $headers = [], ?string $body = null, int $timeout = 15): array {
    $headers[] = 'User-Agent: OrbitaCalumbo/2.0';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout, CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => $headers] + (INSECURE_SSL ? [CURLOPT_SSL_VERIFYPEER => false, CURLOPT_SSL_VERIFYHOST => 0] : []));
        if ($method === 'POST') { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, $body); }
        $r = curl_exec($ch); $err = curl_error($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        return [$code, $r === false ? '' : $r, $r === false ? $err : ''];
    }
    if (!ini_get('allow_url_fopen')) return [0, '', 'O PHP não tem cURL nem allow_url_fopen activos (ver php.ini).'];
    if (!extension_loaded('openssl')) return [0, '', 'A extensão openssl do PHP não está activa (ver php.ini).'];
    $http = ['method' => $method, 'header' => implode("\r\n", $headers), 'timeout' => $timeout, 'ignore_errors' => true, 'follow_location' => 1];
    if ($body !== null) $http['content'] = $body;
    $ctx = stream_context_create(['http' => $http] + (INSECURE_SSL ? ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]] : []));
    $r = @file_get_contents($url, false, $ctx);
    $code = 0;
    foreach ($http_response_header ?? [] as $h) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) $code = (int)$m[1];
    return [$code, $r === false ? '' : $r, $r === false ? 'Falha de ligação (verifica a internet e o SSL).' : ''];
}

function http_get(string $url, int $timeout = 12): ?string {
    [$code, $body] = http_request($url, 'GET', [], null, $timeout);
    return ($code >= 200 && $code < 300) ? $body : null;
}

function claude_only(string $system, string $user, int $max = 600): ?string {
    global $CLAUDE_ERR;
    [$code, $res, $err] = http_request('https://api.anthropic.com/v1/messages', 'POST',
        ['content-type: application/json', 'x-api-key: ' . ANTHROPIC_API_KEY, 'anthropic-version: 2023-06-01'],
        json_encode(['model' => CLAUDE_MODEL, 'max_tokens' => $max, 'system' => $system,
            'messages' => [['role' => 'user', 'content' => $user]]], JSON_UNESCAPED_UNICODE), 40);
    if ($err !== '') { $CLAUDE_ERR = $err; return null; }
    $d = json_decode($res, true);
    if ($code !== 200) { $CLAUDE_ERR = 'API Claude (' . $code . '): ' . ($d['error']['message'] ?? 'erro'); return null; }
    return $d['content'][0]['text'] ?? null;
}

// IA grátis: Google Gemini (chave gratuita em aistudio.google.com)
function gemini_call(string $system, string $user, int $max = 600): ?string {
    global $CLAUDE_ERR;
    foreach (array_unique([GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-2.5-flash']) as $m) {
        [$code, $res, $err] = http_request("https://generativelanguage.googleapis.com/v1beta/models/$m:generateContent", 'POST',
            ['content-type: application/json', 'x-goog-api-key: ' . GEMINI_API_KEY],
            json_encode(['system_instruction' => ['parts' => [['text' => $system]]],
                'contents' => [['role' => 'user', 'parts' => [['text' => $user]]]],
                'generationConfig' => ['maxOutputTokens' => $max * 4]], JSON_UNESCAPED_UNICODE), 40);
        if ($err !== '') { $CLAUDE_ERR = $err; return null; }
        $d = json_decode($res, true);
        if ($code === 404) { $CLAUDE_ERR = "Modelo $m indisponível."; continue; }
        if ($code !== 200) { $CLAUDE_ERR = 'API Gemini (' . $code . '): ' . ($d['error']['message'] ?? 'erro'); return null; }
        $txt = '';
        foreach ($d['candidates'][0]['content']['parts'] ?? [] as $p) $txt .= $p['text'] ?? '';
        if (trim($txt) !== '') return trim($txt);
        $CLAUDE_ERR = 'A IA devolveu uma resposta vazia.'; return null;
    }
    return null;
}

// Escolhe o fornecedor: Claude se houver chave, senão Gemini (grátis).
function claude_call(string $system, string $user, int $max = 600): ?string {
    global $CLAUDE_ERR;
    if (ANTHROPIC_API_KEY !== '') return claude_only($system, $user, $max);
    if (GEMINI_API_KEY !== '') return gemini_call($system, $user, $max);
    $CLAUDE_ERR = 'Nenhuma chave de IA configurada (config.local.php).';
    return null;
}
function ai_provider(): string { return ANTHROPIC_API_KEY !== '' ? 'Claude' : (GEMINI_API_KEY !== '' ? 'Gemini' : ''); }

function rate_limit(string $bucket, int $max = 20): void {
    $f = cache_file('rl_' . md5($bucket . ($_SERVER['REMOTE_ADDR'] ?? '')));
    $d = is_file($f) ? json_decode(file_get_contents($f), true) : [];
    $d = array_values(array_filter($d ?: [], fn($t) => $t > time() - 3600));
    if (count($d) >= $max) json_out(['error' => 'Muitos pedidos. Tenta de novo daqui a pouco.'], 429);
    $d[] = time(); @file_put_contents($f, json_encode($d));
}

function nasa_today(): DateTime { return new DateTime('now', new DateTimeZone('America/New_York')); }
