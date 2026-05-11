<?php
/**
 * Studio Pro CRM — Auto Setup / Installer
 * 
 * Run this file ONCE after uploading to your server:
 *   http://yourdomain.com/backend/setup.php
 * 
 * It will:
 * 1. Create the .env file from .env.example (if not exists)
 * 2. Create the MySQL database and all tables
 * 3. Create the default admin user
 * 4. Verify everything is working
 * 
 * DELETE THIS FILE AFTER SETUP!
 */

header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Studio Pro CRM Setup</title>';
echo '<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;background:#f8fafc;color:#1e293b}';
echo '.ok{color:#16a34a;font-weight:bold}.err{color:#dc2626;font-weight:bold}.warn{color:#d97706;font-weight:bold}';
echo 'h1{color:#4f46e5}pre{background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;font-size:14px}';
echo '.step{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}';
echo '.step h3{margin-top:0}button{background:#4f46e5;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:16px}';
echo 'button:hover{background:#4338ca}</style></head><body>';
echo '<h1>🚀 Studio Pro CRM — Auto Setup</h1>';

$errors = [];
$warnings = [];

// ── Step 1: Check PHP Version ──
echo '<div class="step"><h3>Step 1: PHP Environment Check</h3>';
$phpVersion = PHP_VERSION;
echo "<p>PHP Version: <strong>$phpVersion</strong> ";
if (version_compare($phpVersion, '8.0.0', '>=')) {
    echo '<span class="ok">✅ OK</span>';
} else {
    echo '<span class="err">❌ PHP 8.0+ required</span>';
    $errors[] = 'PHP version too old';
}
echo '</p>';

// Check extensions
$requiredExt = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($requiredExt as $ext) {
    $loaded = extension_loaded($ext);
    echo "<p>Extension <strong>$ext</strong>: " . ($loaded ? '<span class="ok">✅ Loaded</span>' : '<span class="err">❌ Missing</span>') . '</p>';
    if (!$loaded) $errors[] = "Missing extension: $ext";
}
echo '</div>';

// ── Step 2: Create .env ──
echo '<div class="step"><h3>Step 2: Environment Configuration</h3>';
$envPath = __DIR__ . '/.env';
$envExamplePath = __DIR__ . '/.env.example';

if (file_exists($envPath)) {
    echo '<p><span class="ok">✅</span> .env file already exists</p>';
} elseif (file_exists($envExamplePath)) {
    if (copy($envExamplePath, $envPath)) {
        echo '<p><span class="ok">✅</span> .env file created from .env.example</p>';
        echo '<p class="warn">⚠️ Please edit <strong>.env</strong> with your database credentials before proceeding!</p>';
    } else {
        echo '<p><span class="err">❌</span> Could not create .env file. Please copy .env.example to .env manually.</p>';
        $errors[] = 'Cannot create .env';
    }
} else {
    echo '<p><span class="err">❌</span> .env.example not found</p>';
    $errors[] = '.env.example missing';
}
echo '</div>';

// ── Step 3: Database Setup ──
echo '<div class="step"><h3>Step 3: Database Setup</h3>';

// Load config
require_once __DIR__ . '/config/config.php';

try {
    // First connect without database name to create it
    $dsn = sprintf('mysql:host=%s;port=%d;charset=%s', DB_HOST, DB_PORT, DB_CHARSET);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo '<p><span class="ok">✅</span> MySQL connection successful</p>';
    
    // Create database
    $dbName = DB_NAME;
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p><span class=\"ok\">✅</span> Database <strong>$dbName</strong> created/verified</p>";
    
    // Connect to database
    $pdo->exec("USE `$dbName`");
    
    // Execute schema.sql
    $schemaPath = __DIR__ . '/database/schema.sql';
    if (file_exists($schemaPath)) {
        $schema = file_get_contents($schemaPath);
        
        // Split by semicolons and execute each statement
        $statements = array_filter(array_map('trim', explode(';', $schema)));
        $tableCount = 0;
        
        foreach ($statements as $stmt) {
            if (empty($stmt) || stripos($stmt, 'CREATE DATABASE') !== false || stripos($stmt, 'USE ') !== false) {
                continue;
            }
            try {
                $pdo->exec($stmt);
                if (stripos($stmt, 'CREATE TABLE') !== false) {
                    $tableCount++;
                }
            } catch (PDOException $e) {
                // Skip duplicate entries and other non-critical errors
                if ($e->getCode() != '42S01' && strpos($e->getMessage(), 'Duplicate') === false) {
                    $warnings[] = 'SQL Warning: ' . $e->getMessage();
                }
            }
        }
        
        echo "<p><span class=\"ok\">✅</span> Schema executed — $tableCount tables processed</p>";
    } else {
        echo '<p><span class="err">❌</span> schema.sql not found</p>';
        $errors[] = 'schema.sql missing';
    }
    
    // Verify tables
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo '<p>Tables found: <strong>' . count($tables) . '</strong> — ' . implode(', ', $tables) . '</p>';
    
    // Check admin user exists
    $adminCheck = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = 'admin'");
    $adminCheck->execute();
    $adminExists = $adminCheck->fetchColumn();
    
    if ($adminExists) {
        echo '<p><span class="ok">✅</span> Default admin user exists</p>';
        
        // Update admin password to proper bcrypt hash
        $properHash = password_hash('admin', PASSWORD_DEFAULT);
        $updateAdmin = $pdo->prepare("UPDATE users SET password = :pass WHERE email = 'admin' AND password LIKE '\$2y\$%' = 0");
        $updateAdmin->execute([':pass' => $properHash]);
        echo '<p><span class="ok">✅</span> Admin password hash verified/updated</p>';
    } else {
        // Create admin
        $hash = password_hash('admin', PASSWORD_DEFAULT);
        $pdo->prepare(
            "INSERT INTO users (id, name, email, password, role, is_super_admin, permissions, project_permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )->execute([
            'u1', 'Super Admin', 'admin', $hash, 'admin', 1,
            '["dashboard","projects","clients","all-clients","website","automation","course","marketing","models","scheduling","lead","invoice","daily-tasks","terms","task-manager","portfolio","employees","website-info","users","messages"]',
            '["project-financials","project-scripts","project-content","project-links","project-dates","project-team"]'
        ]);
        echo '<p><span class="ok">✅</span> Default admin user created (email: admin, password: admin)</p>';
    }
    
} catch (PDOException $e) {
    echo '<p><span class="err">❌</span> Database error: ' . htmlspecialchars($e->getMessage()) . '</p>';
    $errors[] = 'Database setup failed: ' . $e->getMessage();
}
echo '</div>';

// ── Step 4: Directory Permissions ──
echo '<div class="step"><h3>Step 4: Directory Permissions</h3>';
$uploadDir = __DIR__ . '/uploads';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
echo '<p>Uploads directory: ' . (is_writable($uploadDir) ? '<span class="ok">✅ Writable</span>' : '<span class="err">❌ Not writable</span>') . '</p>';
echo '</div>';

// ── Step 5: API Test ──
echo '<div class="step"><h3>Step 5: Quick API Test</h3>';
$healthUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/api/index.php?health=1';
echo '<p>Health endpoint: <a href="' . dirname($_SERVER['SCRIPT_NAME']) . '/api/health" target="_blank">' . dirname($_SERVER['SCRIPT_NAME']) . '/api/health</a></p>';
echo '</div>';

// ── Results ──
echo '<div class="step"><h3>📋 Setup Results</h3>';
if (empty($errors)) {
    echo '<p class="ok" style="font-size:18px">✅ Setup completed successfully!</p>';
    echo '<p><strong>Default Login:</strong></p>';
    echo '<ul><li>Email/Username: <code>admin</code></li><li>Password: <code>admin</code></li></ul>';
    echo '<p class="err" style="margin-top:20px">⚠️ <strong>IMPORTANT:</strong> Delete this setup.php file after setup is complete!</p>';
} else {
    echo '<p class="err" style="font-size:18px">❌ Setup completed with errors:</p>';
    echo '<ul>';
    foreach ($errors as $err) echo "<li class='err'>$err</li>";
    echo '</ul>';
}
if (!empty($warnings)) {
    echo '<p class="warn">Warnings:</p><ul>';
    foreach ($warnings as $w) echo "<li class='warn'>$w</li>";
    echo '</ul>';
}
echo '</div>';

echo '<div class="step"><h3>📝 Next Steps</h3>';
echo '<ol>';
echo '<li>Edit <code>.env</code> file with your actual database credentials</li>';
echo '<li>Update your React frontend <code>src/config.ts</code> with the PHP API URL</li>';
echo '<li>Build your React app: <code>npm run build</code></li>';
echo '<li>Upload the <code>dist/</code> folder contents to your domain root</li>';
echo '<li>Upload the <code>backend/</code> folder to your server</li>';
echo '<li><strong>Delete this setup.php file!</strong></li>';
echo '</ol></div>';

echo '</body></html>';
