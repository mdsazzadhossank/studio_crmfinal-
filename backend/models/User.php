<?php
/**
 * Studio Pro CRM — User Model
 * Authentication and user management
 */

require_once __DIR__ . '/../config/database.php';

class User {

    /**
     * Find user by email/username
     */
    public static function findByEmail(string $email): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    /**
     * Find user by ID
     */
    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    /**
     * Get all users
     */
    public static function getAll(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT id, name, email, role, is_super_admin, permissions, project_permissions, created_at FROM users ORDER BY created_at ASC");
        $users = $stmt->fetchAll();
        
        return array_map(function($user) {
            $user['permissions'] = json_decode($user['permissions'] ?? '[]', true) ?: [];
            $user['project_permissions'] = json_decode($user['project_permissions'] ?? '[]', true) ?: [];
            $user['isSuperAdmin'] = (bool)$user['is_super_admin'];
            unset($user['is_super_admin']);
            return $user;
        }, $users);
    }

    /**
     * Verify password (supports both bcrypt and plain text for backward compatibility)
     */
    public static function verifyPassword(string $password, string $hash): bool {
        // First try bcrypt verification
        if (password_verify($password, $hash)) {
            return true;
        }
        // Fallback: plain text comparison (for migrating from old system)
        if ($password === $hash) {
            return true;
        }
        return false;
    }

    /**
     * Create a new user
     */
    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'u' . round(microtime(true) * 1000);
        
        $stmt = $db->prepare(
            "INSERT INTO users (id, name, email, password, role, is_super_admin, permissions, project_permissions) 
             VALUES (:id, :name, :email, :password, :role, :is_super_admin, :permissions, :project_permissions)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password' => password_hash($data['password'] ?? 'pass', PASSWORD_DEFAULT),
            ':role' => $data['role'] ?? 'user',
            ':is_super_admin' => !empty($data['isSuperAdmin']) ? 1 : 0,
            ':permissions' => json_encode($data['permissions'] ?? []),
            ':project_permissions' => json_encode($data['projectPermissions'] ?? []),
        ]);
        
        return self::findById($id);
    }

    /**
     * Update a user
     */
    public static function update(string $id, array $data): ?array {
        $db = Database::getConnection();
        
        $fields = [];
        $params = [':id' => $id];
        
        if (isset($data['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = $data['name'];
        }
        if (isset($data['email'])) {
            $fields[] = "email = :email";
            $params[':email'] = $data['email'];
        }
        if (!empty($data['password'])) {
            $fields[] = "password = :password";
            $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        if (isset($data['role'])) {
            $fields[] = "role = :role";
            $params[':role'] = $data['role'];
        }
        if (isset($data['isSuperAdmin'])) {
            $fields[] = "is_super_admin = :is_super_admin";
            $params[':is_super_admin'] = $data['isSuperAdmin'] ? 1 : 0;
        }
        if (isset($data['permissions'])) {
            $fields[] = "permissions = :permissions";
            $params[':permissions'] = json_encode($data['permissions']);
        }
        if (isset($data['projectPermissions'])) {
            $fields[] = "project_permissions = :project_permissions";
            $params[':project_permissions'] = json_encode($data['projectPermissions']);
        }
        
        if (empty($fields)) return self::findById($id);
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        return self::findById($id);
    }

    /**
     * Delete a user
     */
    public static function delete(string $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Format user for frontend (matching the React User interface)
     */
    public static function formatForFrontend(array $user): array {
        return [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'isSuperAdmin' => (bool)($user['is_super_admin'] ?? $user['isSuperAdmin'] ?? false),
            'permissions' => is_string($user['permissions'] ?? '') 
                ? (json_decode($user['permissions'], true) ?: []) 
                : ($user['permissions'] ?? []),
            'projectPermissions' => is_string($user['project_permissions'] ?? $user['projectPermissions'] ?? '') 
                ? (json_decode($user['project_permissions'] ?? $user['projectPermissions'] ?? '[]', true) ?: []) 
                : ($user['project_permissions'] ?? $user['projectPermissions'] ?? []),
        ];
    }

    /**
     * Upgrade plain text password to bcrypt on login
     */
    public static function upgradePassword(string $userId, string $plainPassword): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE users SET password = :password WHERE id = :id");
        $stmt->execute([
            ':password' => password_hash($plainPassword, PASSWORD_DEFAULT),
            ':id' => $userId,
        ]);
    }
}
