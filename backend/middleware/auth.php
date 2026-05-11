<?php
/**
 * Studio Pro CRM — Auth Middleware
 * Validates session-based authentication
 */

function requireAuth(): array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please login.']);
        exit();
    }

    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? '',
        'role' => $_SESSION['user_role'] ?? 'user',
        'isSuperAdmin' => $_SESSION['is_super_admin'] ?? false,
        'permissions' => $_SESSION['user_permissions'] ?? [],
        'projectPermissions' => $_SESSION['project_permissions'] ?? [],
    ];
}

function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Admin role required.']);
        exit();
    }
    return $user;
}

function requireSuperAdmin(): array {
    $user = requireAuth();
    if (!$user['isSuperAdmin']) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Super Admin required.']);
        exit();
    }
    return $user;
}

/**
 * Optional auth — returns user data if logged in, null otherwise
 */
function optionalAuth(): ?array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? '',
        'role' => $_SESSION['user_role'] ?? 'user',
        'isSuperAdmin' => $_SESSION['is_super_admin'] ?? false,
        'permissions' => $_SESSION['user_permissions'] ?? [],
        'projectPermissions' => $_SESSION['project_permissions'] ?? [],
    ];
}
