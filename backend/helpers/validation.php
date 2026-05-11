<?php
/**
 * Studio Pro CRM — Input Validation & Sanitization
 */

/**
 * Sanitize a string input
 */
function sanitizeString(?string $input): string {
    if ($input === null) return '';
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Sanitize an email
 */
function sanitizeEmail(?string $email): string {
    if ($email === null) return '';
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

/**
 * Validate an email
 */
function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Sanitize an integer
 */
function sanitizeInt(mixed $input, int $default = 0): int {
    return filter_var($input, FILTER_VALIDATE_INT) !== false ? (int)$input : $default;
}

/**
 * Sanitize a float/number
 */
function sanitizeFloat(mixed $input, float $default = 0.0): float {
    return filter_var($input, FILTER_VALIDATE_FLOAT) !== false ? (float)$input : $default;
}

/**
 * Validate a date string (YYYY-MM-DD)
 */
function isValidDate(?string $date): bool {
    if (empty($date)) return false;
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

/**
 * Sanitize a phone number (keep digits, +, -, spaces)
 */
function sanitizePhone(?string $phone): string {
    if ($phone === null) return '';
    return preg_replace('/[^\d\+\-\s\(\)]/', '', trim($phone));
}

/**
 * Validate required fields from an associative array
 * Returns array of missing field names, empty if all present
 */
function validateRequired(array $data, array $requiredFields): array {
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Validate enum value
 */
function validateEnum(string $value, array $allowed, string $default = ''): string {
    return in_array($value, $allowed) ? $value : $default;
}

/**
 * Generate a unique ID (mimics the frontend's Date.now() pattern)
 */
function generateId(string $prefix = ''): string {
    return $prefix . round(microtime(true) * 1000) . '_' . bin2hex(random_bytes(4));
}

/**
 * Sanitize an entire array of data recursively
 */
function sanitizeArray(array $data): array {
    $sanitized = [];
    foreach ($data as $key => $value) {
        $key = sanitizeString($key);
        if (is_string($value)) {
            $sanitized[$key] = sanitizeString($value);
        } elseif (is_array($value)) {
            $sanitized[$key] = sanitizeArray($value);
        } else {
            $sanitized[$key] = $value;
        }
    }
    return $sanitized;
}
