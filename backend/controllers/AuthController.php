<?php
/**
 * Studio Pro CRM — Auth Controller
 * Handles login, logout, session check
 */

require_once __DIR__ . '/../models/User.php';

class AuthController {

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    public static function login(): void {
        $data = getJsonBody();
        
        if (!is_array($data) || empty($data['email'])) {
            jsonError('Email/username is required', 400);
        }
        
        $email = trim($data['email']);
        $password = $data['password'] ?? '';
        
        $user = User::findByEmail($email);
        
        if (!$user) {
            jsonError('Invalid email or password', 401);
        }
        
        // Verify password (supports bcrypt and plain text backward compat)
        if (!User::verifyPassword($password, $user['password'])) {
            jsonError('Invalid email or password', 401);
        }
        
        // If the password was plain text, upgrade it to bcrypt
        if (!password_get_info($user['password'])['algo']) {
            User::upgradePassword($user['id'], $password);
        }
        
        // Start session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['is_super_admin'] = (bool)$user['is_super_admin'];
        $_SESSION['user_permissions'] = json_decode($user['permissions'] ?? '[]', true) ?: [];
        $_SESSION['project_permissions'] = json_decode($user['project_permissions'] ?? '[]', true) ?: [];
        
        $formatted = User::formatForFrontend($user);
        jsonResponse($formatted);
    }

    /**
     * POST /api/auth/logout
     */
    public static function logout(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        jsonResponse(['success' => true, 'message' => 'Logged out successfully']);
    }

    /**
     * GET /api/auth/check
     */
    public static function check(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            jsonResponse(['authenticated' => false]);
        }
        
        $user = User::findById($_SESSION['user_id']);
        if (!$user) {
            session_destroy();
            jsonResponse(['authenticated' => false]);
        }
        
        jsonResponse([
            'authenticated' => true,
            'user' => User::formatForFrontend($user),
        ]);
    }
}
