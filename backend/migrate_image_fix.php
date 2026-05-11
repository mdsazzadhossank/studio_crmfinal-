<?php
/**
 * Migration: Fix models.image_url column to support base64 images
 * 
 * Run once: https://yourdomain.com/backend/migrate_image_fix.php
 * Then DELETE this file.
 */

header('Content-Type: text/html; charset=utf-8');
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

echo '<h2>🔧 Migration: Fix image_url column</h2>';

try {
    $db = Database::getConnection();
    
    // ALTER models.image_url from VARCHAR(500) to LONGTEXT
    $db->exec("ALTER TABLE `models` MODIFY COLUMN `image_url` LONGTEXT DEFAULT NULL");
    echo '<p style="color:green">✅ models.image_url changed to LONGTEXT — base64 images will now save correctly.</p>';
    
    echo '<p style="color:red"><strong>⚠️ DELETE this file now!</strong></p>';
} catch (Exception $e) {
    echo '<p style="color:red">❌ Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
}
