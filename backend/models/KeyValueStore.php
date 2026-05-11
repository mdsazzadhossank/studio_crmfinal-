<?php
/**
 * Studio Pro CRM — KeyValueStore Model
 * Universal JSON data store (backward compatible with localStorage sync)
 */

require_once __DIR__ . '/../config/database.php';

class KeyValueStore {
    
    /**
     * Get a value by key
     */
    public static function get(string $key): mixed {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT store_value FROM kv_store WHERE store_key = :key LIMIT 1");
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch();
        
        if (!$row) return null;
        
        $decoded = json_decode($row['store_value'], true);
        return (json_last_error() === JSON_ERROR_NONE) ? $decoded : $row['store_value'];
    }

    /**
     * Set a value by key (upsert)
     */
    public static function set(string $key, mixed $value): bool {
        $db = Database::getConnection();
        $jsonValue = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);
        
        $stmt = $db->prepare(
            "INSERT INTO kv_store (store_key, store_value, updated_at) 
             VALUES (:key, :value, NOW()) 
             ON DUPLICATE KEY UPDATE store_value = :value2, updated_at = NOW()"
        );
        
        return $stmt->execute([
            ':key' => $key,
            ':value' => $jsonValue,
            ':value2' => $jsonValue,
        ]);
    }

    /**
     * Delete a value by key
     */
    public static function delete(string $key): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM kv_store WHERE store_key = :key");
        return $stmt->execute([':key' => $key]);
    }

    /**
     * Get ALL key-value pairs (for /api/sync)
     */
    public static function getAll(): array {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT store_key, store_value FROM kv_store");
        $result = [];
        
        while ($row = $stmt->fetch()) {
            $decoded = json_decode($row['store_value'], true);
            $result[$row['store_key']] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $row['store_value'];
        }
        
        return $result;
    }

    /**
     * Bulk set (for initial data migration)
     */
    public static function bulkSet(array $data): bool {
        $db = Database::getConnection();
        $db->beginTransaction();
        
        try {
            $stmt = $db->prepare(
                "INSERT INTO kv_store (store_key, store_value, updated_at) 
                 VALUES (:key, :value, NOW()) 
                 ON DUPLICATE KEY UPDATE store_value = :value2, updated_at = NOW()"
            );
            
            foreach ($data as $key => $value) {
                $jsonValue = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);
                $stmt->execute([
                    ':key' => $key,
                    ':value' => $jsonValue,
                    ':value2' => $jsonValue,
                ]);
            }
            
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            return false;
        }
    }
}
