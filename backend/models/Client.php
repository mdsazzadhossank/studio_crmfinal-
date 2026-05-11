<?php
/**
 * Studio Pro CRM — Client Model
 */

require_once __DIR__ . '/../config/database.php';

class ClientModel {

    public static function getAll(): array {
        $db = Database::getConnection();
        $clients = $db->query("SELECT * FROM clients ORDER BY created_at DESC")->fetchAll();
        
        // Attach projects to each client
        foreach ($clients as &$client) {
            $client['projects'] = self::getProjects($client['id']);
            $client['totalBudget'] = (float)$client['total_budget'];
            unset($client['total_budget']);
        }
        
        return $clients;
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM clients WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $client = $stmt->fetch();
        
        if (!$client) return null;
        
        $client['projects'] = self::getProjects($id);
        $client['totalBudget'] = (float)$client['total_budget'];
        unset($client['total_budget']);
        
        return $client;
    }

    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'c' . round(microtime(true) * 1000);
        
        $stmt = $db->prepare(
            "INSERT INTO clients (id, name, company, email, phone, facebook, total_budget) 
             VALUES (:id, :name, :company, :email, :phone, :facebook, :total_budget)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':company' => $data['company'] ?? '',
            ':email' => $data['email'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':facebook' => $data['facebook'] ?? '',
            ':total_budget' => $data['totalBudget'] ?? 0,
        ]);
        
        return self::findById($id);
    }

    public static function update(string $id, array $data): ?array {
        $db = Database::getConnection();
        $fields = [];
        $params = [':id' => $id];
        
        $map = [
            'name' => 'name', 'company' => 'company', 'email' => 'email',
            'phone' => 'phone', 'facebook' => 'facebook', 'totalBudget' => 'total_budget',
        ];
        
        foreach ($map as $frontendKey => $dbKey) {
            if (isset($data[$frontendKey])) {
                $fields[] = "$dbKey = :$dbKey";
                $params[":$dbKey"] = $data[$frontendKey];
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE clients SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->prepare($sql)->execute($params);
        }
        
        return self::findById($id);
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM clients WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    private static function getProjects(string $clientId): array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM projects WHERE client_id = :client_id ORDER BY created_at DESC");
        $stmt->execute([':client_id' => $clientId]);
        $projects = $stmt->fetchAll();
        
        return array_map(function($p) {
            // Decode JSON fields
            $jsonFields = ['models', 'content_log', 'scripts', 'messages', 'formats'];
            foreach ($jsonFields as $field) {
                $p[$field] = json_decode($p[$field] ?? '[]', true) ?: [];
            }
            // Map snake_case to camelCase
            $p['clientAdvance'] = (float)$p['client_advance'];
            $p['modelPayment'] = (float)$p['model_payment'];
            $p['extraExpenses'] = (float)$p['extra_expenses'];
            $p['contentLog'] = $p['content_log'];
            $p['thumbnailUrl'] = $p['thumbnail_url'];
            $p['recommendationLink'] = $p['recommendation_link'];
            $p['videoDuration'] = $p['video_duration'];
            $p['contentType'] = $p['content_type'];
            $p['contentWriterId'] = $p['content_writer_id'];
            $p['editorId'] = $p['editor_id'];
            $p['startDate'] = $p['start_date'];
            $p['endDate'] = $p['end_date'];
            $p['budget'] = (float)$p['budget'];
            
            // Clean up snake_case keys
            unset($p['client_id'], $p['client_advance'], $p['model_payment'], 
                  $p['extra_expenses'], $p['content_log'], $p['thumbnail_url'],
                  $p['recommendation_link'], $p['video_duration'], $p['content_type'],
                  $p['content_writer_id'], $p['editor_id'], $p['start_date'], $p['end_date']);
            
            return $p;
        }, $projects);
    }
}
