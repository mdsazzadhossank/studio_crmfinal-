<?php
/**
 * Studio Pro CRM — Backup Controller
 */

require_once __DIR__ . '/../backup/BackupService.php';

class BackupController {

    private static function requireSuperAdmin() {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['is_super_admin'])) {
            jsonError('Unauthorized. Only Super Admin can perform backups.', 403);
        }
    }

    public static function run() {
        self::requireSuperAdmin();

        $db = Database::getConnection();
        
        // Prevent concurrent backups
        $stmt = $db->query("SELECT id FROM backup_logs WHERE backup_status = 'pending' AND created_at > (NOW() - INTERVAL 1 HOUR)");
        if ($stmt->fetch()) {
            jsonError('A backup is already in progress.', 409);
        }

        $backupService = new BackupService($db);
        $result = $backupService->runBackup($_SESSION['user_id']);

        if ($result['success']) {
            jsonResponse($result);
        } else {
            jsonError($result['error'], 500);
        }
    }

    public static function getHistory() {
        self::requireSuperAdmin();

        $db = Database::getConnection();
        
        // Ensure table exists
        $db->exec("CREATE TABLE IF NOT EXISTS `backup_logs` (
            `id` VARCHAR(50) NOT NULL,
            `filename` VARCHAR(255) NOT NULL,
            `backup_type` VARCHAR(50) DEFAULT 'full',
            `google_drive_file_id` VARCHAR(255) DEFAULT NULL,
            `google_drive_url` VARCHAR(1000) DEFAULT NULL,
            `backup_size` VARCHAR(50) DEFAULT NULL,
            `backup_status` ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
            `created_by` VARCHAR(50) DEFAULT NULL,
            `error_message` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_backup_logs_status` (`backup_status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $stmt = $db->query("
            SELECT b.*, u.name as created_by_name 
            FROM backup_logs b 
            LEFT JOIN users u ON b.created_by = u.id 
            ORDER BY b.created_at DESC 
            LIMIT 50
        ");
        
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse($logs);
    }
}
