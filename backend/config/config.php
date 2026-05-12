<?php
/**
 * Studio Pro CRM — Application Configuration
 * Loads .env and defines global constants
 */

// Load .env file
function loadEnv(string $path): void {
    if (!file_exists($path)) return;
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (str_starts_with($line, '#') || empty($line)) continue;
        
        [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        
        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

// Load .env from backend root
loadEnv(__DIR__ . '/../.env');

// Helper to get env value with default
function env(string $key, mixed $default = null): mixed {
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

// ── Application Constants ──
define('APP_URL', env('APP_URL', 'http://localhost'));
define('APP_DEBUG', filter_var(env('APP_DEBUG', false), FILTER_VALIDATE_BOOLEAN));
define('APP_SECRET', env('APP_SECRET', 'default_secret_change_me'));

// ── Database Constants ──
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', 'studio_pro_crm'));
define('DB_USER', env('DB_USER', 'root'));
define('DB_PASS', env('DB_PASS', ''));
define('DB_PORT', (int)env('DB_PORT', 3306));
define('DB_CHARSET', env('DB_CHARSET', 'utf8mb4'));

// ── CORS ──
define('CORS_ALLOWED_ORIGINS', array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*'))));

// ── Upload ──
define('MAX_UPLOAD_SIZE', (int)env('MAX_UPLOAD_SIZE', 10485760)); // 10MB
define('UPLOAD_DIR', __DIR__ . '/../' . env('UPLOAD_DIR', 'uploads/'));

// ── Session ──
define('SESSION_LIFETIME', (int)env('SESSION_LIFETIME', 86400)); // 24 hours

// ── Error Reporting ──
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', '0'); // Never display errors on screen for JSON APIs
    ini_set('log_errors', '1');
    ini_set('error_log', __DIR__ . '/../error.log');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// ── Timezone ──
date_default_timezone_set('Asia/Dhaka');

// ── Ensure upload directory exists ──
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
