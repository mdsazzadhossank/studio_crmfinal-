<?php
/**
 * Studio Pro CRM — API Router (Single Entry Point)
 * 
 * All requests are routed here via .htaccess
 * This file matches the exact URL patterns expected by the React frontend
 */

// ── Bootstrap ──
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/upload.php';

// Apply CORS
applyCors();

// Content type
header('Content-Type: application/json; charset=utf-8');

// Session
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']) || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// ── Parse Request ──
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string for matching
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path prefix if behind a subdirectory (e.g., /backend/api/...)
// Detect if we're in a subdirectory
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptDir !== '/' && $scriptDir !== '\\') {
    // Remove the parent directory path (e.g., /backend)
    $parentDir = dirname($scriptDir);
    if ($parentDir !== '/' && $parentDir !== '\\' && str_starts_with($path, $parentDir)) {
        $path = substr($path, strlen($parentDir));
    }
}

// Normalize: ensure path starts with /api/
if (!str_starts_with($path, '/api/')) {
    // Try without /api prefix (for when running from backend root directly)
    $path = '/api/' . ltrim($path, '/');
}

// Clean path
$path = '/' . trim($path, '/');

// Strip .php extension from path (routes work with or without .php)
$path = preg_replace('/\.php$/', '', $path);

// ── Load Controllers ──
require_once __DIR__ . '/../controllers/StoreController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ClientController.php';
require_once __DIR__ . '/../controllers/ProjectController.php';
require_once __DIR__ . '/../controllers/ModelController.php';
require_once __DIR__ . '/../controllers/InvoiceController.php';
require_once __DIR__ . '/../controllers/EmployeeController.php';
require_once __DIR__ . '/../controllers/LeadController.php';
require_once __DIR__ . '/../controllers/ScheduleController.php';
require_once __DIR__ . '/../controllers/UserController.php';

// ============================================================
// ROUTE DEFINITIONS
// ============================================================

try {
    // ── Auth Routes ──
    if ($path === '/api/auth/login' && $method === 'POST') {
        AuthController::login();
    }
    elseif ($path === '/api/auth/logout' && $method === 'POST') {
        AuthController::logout();
    }
    elseif ($path === '/api/auth/check' && $method === 'GET') {
        AuthController::check();
    }

    // ── Universal Sync (backward compatible with server.ts) ──
    elseif ($path === '/api/sync' && $method === 'GET') {
        StoreController::sync();
    }

    // ── Universal Store CRUD ──
    elseif (preg_match('#^/api/store/(.+)$#', $path, $matches)) {
        $key = urldecode($matches[1]);
        
        switch ($method) {
            case 'GET':
                StoreController::get($key);
                break;
            case 'POST':
                StoreController::set($key);
                break;
            case 'DELETE':
                StoreController::delete($key);
                break;
            default:
                jsonError('Method not allowed', 405);
        }
    }

    // ── Client Endpoints (matches api.ts) ──
    elseif ($path === '/api/get_clients' && $method === 'GET') {
        ClientController::getAll();
    }
    elseif ($path === '/api/add_client' && $method === 'POST') {
        ClientController::create();
    }
    elseif ($path === '/api/update_client' && $method === 'POST') {
        ClientController::update();
    }
    elseif ($path === '/api/delete_client' && $method === 'POST') {
        ClientController::delete();
    }

    // ── Project Endpoints ──
    elseif ($path === '/api/add_project' && $method === 'POST') {
        ProjectController::create();
    }
    elseif ($path === '/api/update_project' && $method === 'POST') {
        ProjectController::update();
    }
    elseif ($path === '/api/delete_project' && $method === 'POST') {
        ProjectController::delete();
    }

    // ── Model Endpoints ──
    elseif ($path === '/api/get_models' && $method === 'GET') {
        ModelController::getAll();
    }
    elseif ($path === '/api/add_model' && $method === 'POST') {
        ModelController::create();
    }

    // ── Invoice Endpoints ──
    elseif ($path === '/api/get_invoices' && $method === 'GET') {
        InvoiceController::getAll();
    }
    elseif ($path === '/api/add_invoice' && $method === 'POST') {
        InvoiceController::create();
    }
    elseif ($path === '/api/delete_invoice' && $method === 'POST') {
        InvoiceController::delete();
    }

    // ── Content Endpoints ──
    elseif ($path === '/api/get_content' && $method === 'GET') {
        $db = Database::getConnection();
        $content = $db->query("SELECT * FROM content ORDER BY created_at DESC")->fetchAll();
        foreach ($content as &$c) {
            $c['imageUrl'] = $c['image_url'];
            $c['projectId'] = $c['project_id'];
            unset($c['image_url'], $c['project_id']);
        }
        jsonResponse($content);
    }
    elseif ($path === '/api/add_content' && $method === 'POST') {
        $data = getJsonBody();
        $db = Database::getConnection();
        $id = 'ct' . round(microtime(true) * 1000);
        $stmt = $db->prepare("INSERT INTO content (id, title, category, image_url, project_id) VALUES (:id, :title, :category, :image_url, :project_id)");
        $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'] ?? '',
            ':category' => $data['category'] ?? '',
            ':image_url' => $data['imageUrl'] ?? '',
            ':project_id' => $data['projectId'] ?? '',
        ]);
        $result = $db->prepare("SELECT * FROM content WHERE id = :id")->execute([':id' => $id]);
        $created = $db->prepare("SELECT * FROM content WHERE id = :id");
        $created->execute([':id' => $id]);
        $item = $created->fetch();
        $item['imageUrl'] = $item['image_url'];
        $item['projectId'] = $item['project_id'];
        unset($item['image_url'], $item['project_id']);
        jsonResponse($item, 201);
    }

    // ── Schedule Endpoints ──
    elseif ($path === '/api/get_schedule' && $method === 'GET') {
        ScheduleController::getAll();
    }
    elseif ($path === '/api/add_schedule' && $method === 'POST') {
        ScheduleController::create();
    }

    // ── Categories Endpoints ──
    elseif ($path === '/api/get_categories' && $method === 'GET') {
        $db = Database::getConnection();
        $cats = $db->query("SELECT name FROM categories ORDER BY name ASC")->fetchAll(PDO::FETCH_COLUMN);
        jsonResponse($cats);
    }
    elseif ($path === '/api/add_category' && $method === 'POST') {
        $data = getJsonBody();
        if (is_array($data) && !empty($data['category'])) {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT IGNORE INTO categories (name) VALUES (:name)");
            $stmt->execute([':name' => $data['category']]);
        }
        jsonResponse(['success' => true]);
    }

    // ── Employee Endpoints ──
    elseif ($path === '/api/get_employees' && $method === 'GET') {
        EmployeeController::getAll();
    }
    elseif ($path === '/api/add_employee' && $method === 'POST') {
        EmployeeController::create();
    }
    elseif ($path === '/api/update_employee' && $method === 'POST') {
        EmployeeController::update();
    }
    elseif ($path === '/api/delete_employee' && $method === 'POST') {
        EmployeeController::delete();
    }

    // ── Lead Endpoints ──
    elseif ($path === '/api/get_leads' && $method === 'GET') {
        LeadController::getAll();
    }
    elseif ($path === '/api/add_lead' && $method === 'POST') {
        LeadController::create();
    }
    elseif ($path === '/api/delete_lead' && $method === 'POST') {
        LeadController::delete();
    }

    // ── User Management Endpoints ──
    elseif ($path === '/api/get_users' && $method === 'GET') {
        UserController::getAll();
    }
    elseif ($path === '/api/add_user' && $method === 'POST') {
        UserController::create();
    }
    elseif ($path === '/api/update_user' && $method === 'POST') {
        UserController::update();
    }
    elseif ($path === '/api/delete_user' && $method === 'POST') {
        UserController::delete();
    }

    // ── Daily Tasks ──
    elseif ($path === '/api/get_daily_tasks' && $method === 'GET') {
        $db = Database::getConnection();
        $tasks = $db->query("SELECT * FROM daily_tasks ORDER BY date_key DESC, step_id ASC")->fetchAll();
        jsonResponse($tasks);
    }
    elseif ($path === '/api/save_daily_task' && $method === 'POST') {
        $data = getJsonBody();
        if (is_array($data)) {
            $db = Database::getConnection();
            $id = 'dt_' . round(microtime(true) * 1000);
            $stmt = $db->prepare(
                "INSERT INTO daily_tasks (id, date_key, step_id, completed, notes, user_id) 
                 VALUES (:id, :date_key, :step_id, :completed, :notes, :user_id)
                 ON DUPLICATE KEY UPDATE completed = :completed2, notes = :notes2"
            );
            $stmt->execute([
                ':id' => $id,
                ':date_key' => $data['date_key'] ?? '',
                ':step_id' => $data['step_id'] ?? '',
                ':completed' => !empty($data['completed']) ? 1 : 0,
                ':notes' => $data['notes'] ?? '',
                ':user_id' => $_SESSION['user_id'] ?? '',
                ':completed2' => !empty($data['completed']) ? 1 : 0,
                ':notes2' => $data['notes'] ?? '',
            ]);
        }
        jsonResponse(['success' => true]);
    }

    // ── Task Manager CRUD (role-based) ──
    elseif ($path === '/api/get_tasks' && $method === 'GET') {
        $db = Database::getConnection();
        $role = $_GET['role'] ?? '';
        $userId = $_GET['user_id'] ?? '';
        $userName = $_GET['user_name'] ?? '';

        if ($role === 'admin' || $role === 'manager') {
            // Admin/Manager sees ALL tasks
            $tasks = $db->query("SELECT * FROM tasks ORDER BY created_at DESC")->fetchAll();
        } else {
            // Regular user sees only tasks assigned to them
            $stmt = $db->prepare(
                "SELECT * FROM tasks WHERE assigned_to = :uid OR assigned_to = :uname OR assigned_to = '' ORDER BY created_at DESC"
            );
            $stmt->execute([':uid' => $userId, ':uname' => $userName]);
            $tasks = $stmt->fetchAll();
        }

        // Format for frontend
        $formatted = array_map(function($t) {
            $data = json_decode($t['data'] ?? '{}', true) ?: [];
            return [
                'id' => $t['id'],
                'title' => $t['title'],
                'assignedTo' => $data['assignedTo'] ?? $t['assigned_to'] ?? '',
                'assignedToName' => $data['assignedToName'] ?? 'Unassigned',
                'dueDate' => $t['due_date'] ?? '',
                'status' => $t['status'] === 'Completed' ? 'Completed' : 'Pending',
                'createdAt' => $t['created_at'],
                'createdByRole' => $data['createdByRole'] ?? '',
                'createdByName' => $data['createdByName'] ?? '',
            ];
        }, $tasks);
        jsonResponse($formatted);
    }
    elseif ($path === '/api/add_task' && $method === 'POST') {
        $data = getJsonBody();
        if (!is_array($data) || empty($data['title'])) {
            jsonError('Task title is required', 400);
        }
        $db = Database::getConnection();
        $id = $data['id'] ?? 'task_' . round(microtime(true) * 1000);
        $stmt = $db->prepare(
            "INSERT INTO tasks (id, title, description, assigned_to, status, priority, due_date, data) 
             VALUES (:id, :title, :desc, :assigned_to, :status, :priority, :due_date, :data)"
        );
        $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':desc' => $data['description'] ?? '',
            ':assigned_to' => $data['assignedTo'] ?? '',
            ':status' => $data['status'] ?? 'Pending',
            ':priority' => $data['priority'] ?? 'normal',
            ':due_date' => $data['dueDate'] ?? null,
            ':data' => json_encode([
                'assignedTo' => $data['assignedTo'] ?? '',
                'assignedToName' => $data['assignedToName'] ?? 'Unassigned',
                'createdByRole' => $data['createdByRole'] ?? '',
                'createdByName' => $data['createdByName'] ?? '',
            ]),
        ]);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }
    elseif ($path === '/api/update_task' && $method === 'POST') {
        $data = getJsonBody();
        if (!is_array($data) || empty($data['id'])) {
            jsonError('Task ID is required', 400);
        }
        $db = Database::getConnection();
        $fields = [];
        $params = [':id' => $data['id']];
        if (isset($data['status'])) {
            $fields[] = "status = :status";
            $params[':status'] = $data['status'];
        }
        if (isset($data['title'])) {
            $fields[] = "title = :title";
            $params[':title'] = $data['title'];
        }
        if (!empty($fields)) {
            $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->prepare($sql)->execute($params);
        }
        jsonResponse(['success' => true]);
    }
    elseif ($path === '/api/delete_task' && $method === 'POST') {
        $data = getJsonBody();
        if (!is_array($data) || empty($data['id'])) {
            jsonError('Task ID is required', 400);
        }
        $db = Database::getConnection();
        $db->prepare("DELETE FROM tasks WHERE id = :id")->execute([':id' => $data['id']]);
        jsonResponse(['success' => true]);
    }

    // ── Top-Up Payment Proof Upload ──
    elseif ($path === '/api/upload_topup_proof' && $method === 'POST') {
        if (!isset($_FILES['proof'])) {
            jsonError('No proof image provided', 400);
        }
        
        $file = $_FILES['proof'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        // Validate
        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonError('Upload error: ' . $file['error'], 400);
        }
        if ($file['size'] > $maxSize) {
            jsonError('File too large. Maximum 5MB allowed.', 400);
        }
        
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, $allowedTypes)) {
            jsonError('Invalid file type. Only JPG, PNG, WEBP allowed.', 400);
        }
        
        // Generate path: uploads/topup-proofs/2026/05/proof_xxxxx.webp
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) $ext = 'jpg';
        $year = date('Y');
        $month = date('m');
        $filename = 'proof_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        
        $subDir = "topup-proofs/$year/$month/";
        $targetDir = UPLOAD_DIR . $subDir;
        
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        
        $targetPath = $targetDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $relativePath = 'uploads/' . $subDir . $filename;
            jsonResponse([
                'success' => true,
                'url' => $relativePath,
                'filename' => $filename
            ]);
        } else {
            jsonError('Failed to save uploaded file', 500);
        }
    }

    // ── File Upload ──
    elseif ($path === '/api/upload' && $method === 'POST') {
        if (isset($_FILES['file'])) {
            $result = handleFileUpload($_FILES['file'], 'uploads');
            if ($result) {
                jsonResponse(['success' => true, 'url' => $result]);
            } else {
                jsonError('File upload failed', 400);
            }
        } else {
            // Check for base64 upload
            $data = getJsonBody();
            if (is_array($data) && !empty($data['base64'])) {
                $result = handleBase64Upload($data['base64'], $data['subDir'] ?? 'images');
                if ($result) {
                    jsonResponse(['success' => true, 'url' => $result]);
                }
            }
            jsonError('No file provided', 400);
        }
    }

    // ── Database Migration (auto-create tables + seed admin) ──
    elseif ($path === '/api/migrate' && $method === 'GET') {
        try {
            $db = Database::getConnection();
            
            // Run schema.sql if it exists
            $schemaFile = __DIR__ . '/../database/schema.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                // Remove CREATE DATABASE and USE statements (PDO already connects to the right DB)
                $sql = preg_replace('/CREATE\s+DATABASE\s+.*?;/si', '', $sql);
                $sql = preg_replace('/USE\s+`?[^;]+`?\s*;/si', '', $sql);
                // Remove INSERT INTO users (we handle admin seeding separately with proper bcrypt)
                $sql = preg_replace('/INSERT\s+INTO\s+`?users`?\s+.*?;/si', '', $sql);
                $db->exec($sql);
            }
            
            // Check if admin password is correct (bcrypt hash), fix if needed
            $admin = $db->query("SELECT id, password FROM users WHERE email = 'admin' LIMIT 1")->fetch();
            if ($admin) {
                if (!password_verify('admin', $admin['password'])) {
                    // Fix the admin password with proper bcrypt hash
                    $hash = password_hash('admin', PASSWORD_DEFAULT);
                    $stmt = $db->prepare("UPDATE users SET password = :pass WHERE id = :id");
                    $stmt->execute([':pass' => $hash, ':id' => $admin['id']]);
                    jsonResponse(['success' => true, 'message' => 'Migration complete. Admin password fixed.']);
                } else {
                    jsonResponse(['success' => true, 'message' => 'Migration complete. Everything OK.']);
                }
            } else {
                // Seed default admin
                $adminId = 'u1';
                $hashedPassword = password_hash('admin', PASSWORD_DEFAULT);
                $permissions = json_encode(["dashboard","projects","clients","all-clients","website","automation","course","marketing","models","scheduling","lead","invoice","daily-tasks","terms","task-manager","portfolio","employees","website-info","users","messages"]);
                $projectPermissions = json_encode(["project-financials","project-scripts","project-content","project-links","project-dates","project-team"]);
                
                $stmt = $db->prepare(
                    "INSERT INTO users (id, name, email, password, role, is_super_admin, permissions, project_permissions) 
                     VALUES (:id, :name, :email, :pass, :role, :isa, :perms, :pperms)"
                );
                $stmt->execute([
                    ':id' => $adminId,
                    ':name' => 'Super Admin',
                    ':email' => 'admin',
                    ':pass' => $hashedPassword,
                    ':role' => 'admin',
                    ':isa' => 1,
                    ':perms' => $permissions,
                    ':pperms' => $projectPermissions,
                ]);
                
                jsonResponse(['success' => true, 'message' => 'Migration complete. Admin user created.']);
            }
        } catch (Exception $e) {
            jsonError('Migration failed: ' . $e->getMessage(), 500);
        }
    }

    // ── Health Check ──
    elseif ($path === '/api/health' && $method === 'GET') {
        try {
            Database::getConnection();
            jsonResponse([
                'status' => 'ok',
                'database' => 'connected',
                'timestamp' => date('c'),
                'php_version' => PHP_VERSION,
            ]);
        } catch (Exception $e) {
            jsonResponse([
                'status' => 'error',
                'database' => 'disconnected',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ── 404 Not Found ──
    else {
        jsonError("Endpoint not found: $method $path", 404);
    }

} catch (Exception $e) {
    $statusCode = 500;
    $message = 'Internal Server Error';
    
    if (APP_DEBUG) {
        $message = $e->getMessage();
    }
    
    jsonError($message, $statusCode, APP_DEBUG ? [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString(),
    ] : null);
}
