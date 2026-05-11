<?php
/**
 * Studio Pro CRM — CORS Middleware
 */

function applyCors(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    
    // Check if origin is allowed
    $allowed = CORS_ALLOWED_ORIGINS;
    if (in_array('*', $allowed) || in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: " . $allowed[0]);
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 3600");

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
