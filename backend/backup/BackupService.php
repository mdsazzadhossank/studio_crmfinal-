<?php
/**
 * Studio Pro CRM — Backup Service
 * 
 * Orchestrates the full backup process:
 * 1. Database dump
 * 2. kv_store export
 * 3. Zip file creation with uploads
 * 4. Google Drive upload
 */

require_once __DIR__ . '/GoogleDriveService.php';

class BackupService {
    private $db;
    private $tempDir;
    private $uploadsDir;
    
    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->tempDir = __DIR__ . '/../uploads/temp_backups';
        $this->uploadsDir = __DIR__ . '/../uploads';
        
        if (!is_dir($this->tempDir)) {
            mkdir($this->tempDir, 0755, true);
        }
    }

    public function runBackup($userId) {
        // Increase limits for large backups
        if (function_exists('set_time_limit')) {
            @set_time_limit(0);
        }
        if (function_exists('ini_set')) {
            @ini_set('memory_limit', '1024M');
        }

        $timestamp = date('Y-m-d_H-i-s');
        $backupId = 'bck_' . round(microtime(true) * 1000);
        $fileName = "StudioProCRM_Backup_{$timestamp}";
        $zipFileName = "{$fileName}.zip";
        $zipFilePath = "{$this->tempDir}/{$zipFileName}";

        try {
            // Log pending backup
            $this->logBackup($backupId, $zipFileName, 'pending', $userId);

            // 1. Export Database
            $sqlFilePath = "{$this->tempDir}/database_{$timestamp}.sql";
            $this->exportDatabase($sqlFilePath);

            // 2. Export kv_store
            $kvFilePath = "{$this->tempDir}/kv_store_{$timestamp}.json";
            $this->exportKvStore($kvFilePath);

            // 3. Create Zip Archive
            $this->createZipArchive($zipFilePath, $sqlFilePath, $kvFilePath);

            // Calculate size
            $fileSize = $this->formatBytes(filesize($zipFilePath));

            // 4. Upload to Google Drive
            $driveService = new GoogleDriveService();
            $driveFileId = null;
            $driveUrl = null;
            $localOnly = false;

            if ($driveService->isConfigured()) {
                $driveData = $driveService->uploadFile($zipFilePath, $zipFileName);
                $driveFileId = $driveData['id'] ?? null;
                $driveUrl = $driveData['webViewLink'] ?? null;
                
                // Cleanup temp files if uploaded successfully
                $this->cleanup([$sqlFilePath, $kvFilePath, $zipFilePath]);
            } else {
                $localOnly = true;
                // If local only, keep the zip file but delete sql and kv_store
                $this->cleanup([$sqlFilePath, $kvFilePath]);
                
                // Provide local URL for download
                // Assuming api is at /api/index.php and uploads are accessible via /backend/uploads
                $driveUrl = '/backend/uploads/temp_backups/' . $zipFileName;
            }

            // Update Log
            $this->updateBackupLog($backupId, 'success', $fileSize, $driveFileId, $driveUrl);

            return [
                'success' => true,
                'message' => $localOnly ? 'Backup created locally successfully (Drive credentials missing)' : 'Backup completed successfully',
                'drive_url' => $driveUrl,
                'backup_size' => $fileSize
            ];

        } catch (Exception $e) {
            $this->updateBackupLog($backupId, 'failed', null, null, null, $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function exportDatabase($filePath) {
        $tables = [];
        $query = $this->db->query("SHOW TABLES");
        while ($row = $query->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }

        $sql = "-- Studio Pro CRM Database Dump\n";
        $sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $sql .= "-- Table structure for `$table`\n";
            $createTable = $this->db->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_NUM);
            $sql .= "DROP TABLE IF EXISTS `$table`;\n";
            $sql .= $createTable[1] . ";\n\n";

            $sql .= "-- Dumping data for `$table`\n";
            $rows = $this->db->query("SELECT * FROM `$table`");
            $rowCount = $rows->rowCount();
            
            if ($rowCount > 0) {
                $sql .= "INSERT INTO `$table` VALUES \n";
                $counter = 0;
                while ($row = $rows->fetch(PDO::FETCH_ASSOC)) {
                    $counter++;
                    $values = [];
                    foreach ($row as $val) {
                        if ($val === null) {
                            $values[] = "NULL";
                        } else {
                            $val = addslashes($val);
                            $val = str_replace("\n", "\\n", $val);
                            $val = str_replace("\r", "\\r", $val);
                            $values[] = "'$val'";
                        }
                    }
                    $sql .= "(" . implode(", ", $values) . ")";
                    if ($counter < $rowCount) {
                        $sql .= ",\n";
                    } else {
                        $sql .= ";\n\n";
                    }
                }
            }
        }
        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        file_put_contents($filePath, $sql);
    }

    private function exportKvStore($filePath) {
        $stmt = $this->db->query("SELECT store_key, store_value FROM kv_store");
        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[$row['store_key']] = json_decode($row['store_value'], true) ?? $row['store_value'];
        }
        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }

    private function createZipArchive($zipPath, $sqlPath, $kvPath) {
        if (!extension_loaded('zip')) {
            throw new Exception("ZIP extension not loaded in PHP.");
        }

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new Exception("Cannot create zip file.");
        }

        // Add DB & KV
        $zip->addFile($sqlPath, basename($sqlPath));
        $zip->addFile($kvPath, basename($kvPath));

        // Add uploads directory
        $this->addFolderToZip($this->uploadsDir, $zip, 'uploads');

        // Add config files (masking sensitive info if needed, but since it's super admin backup, include .env)
        $envPath = __DIR__ . '/../.env';
        if (file_exists($envPath)) {
            $zip->addFile($envPath, 'config/.env');
        }

        $zip->close();
    }

    private function addFolderToZip($dir, $zipArchive, $zipDir = '') {
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                if ($file == '.' || $file == '..') continue;
                
                // Skip temp backups folder to avoid recursion/massive sizes
                if ($file == 'temp_backups') continue;

                $filePath = $dir . '/' . $file;
                $localPath = $zipDir ? $zipDir . '/' . $file : $file;

                if (is_dir($filePath)) {
                    $zipArchive->addEmptyDir($localPath);
                    $this->addFolderToZip($filePath, $zipArchive, $localPath);
                } else {
                    $zipArchive->addFile($filePath, $localPath);
                }
            }
        }
    }

    private function cleanup($files) {
        foreach ($files as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }
    }

    private function logBackup($id, $filename, $status, $userId) {
        // Create table if not exists just in case
        $this->db->exec("CREATE TABLE IF NOT EXISTS `backup_logs` (
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

        $stmt = $this->db->prepare("INSERT INTO backup_logs (id, filename, backup_status, created_by) VALUES (:id, :filename, :status, :created_by)");
        $stmt->execute([
            ':id' => $id,
            ':filename' => $filename,
            ':status' => $status,
            ':created_by' => $userId
        ]);
    }

    private function updateBackupLog($id, $status, $size = null, $fileId = null, $url = null, $error = null) {
        $stmt = $this->db->prepare("UPDATE backup_logs SET backup_status = :status, backup_size = :size, google_drive_file_id = :fileId, google_drive_url = :url, error_message = :error WHERE id = :id");
        $stmt->execute([
            ':status' => $status,
            ':size' => $size,
            ':fileId' => $fileId,
            ':url' => $url,
            ':error' => $error,
            ':id' => $id
        ]);
    }

    private function formatBytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
