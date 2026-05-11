<?php
/**
 * Studio Pro CRM — JSON Response Helpers
 */

/**
 * Send a JSON success response
 */
function jsonResponse(mixed $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send a JSON error response
 */
function jsonError(string $message, int $statusCode = 400, ?array $details = null): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    $response = ['error' => $message];
    if ($details !== null && APP_DEBUG) {
        $response['details'] = $details;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send a success message
 */
function jsonSuccess(string $message = 'Success', mixed $data = null): void {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response);
}

/**
 * Get JSON body from request
 */
function getJsonBody(): mixed {
    $rawBody = file_get_contents('php://input');
    
    if (empty($rawBody)) {
        return null;
    }
    
    $data = json_decode($rawBody, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Try to handle raw values (the frontend sometimes sends bare strings/arrays)
        // The current server.ts accepts `strict: false` on JSON parsing
        return $rawBody;
    }
    
    return $data;
}
