<?php
/**
 * Studio Pro CRM — Project Model
 */

require_once __DIR__ . '/../config/database.php';

class ProjectModel {

    public static function create(string $clientId, array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'p' . round(microtime(true) * 1000);
        
        $stmt = $db->prepare(
            "INSERT INTO projects (id, client_id, title, category, status, budget, client_advance, 
             model_payment, extra_expenses, models, content_log, script, scripts, thumbnail_url,
             recommendation_link, video_duration, formats, content_type, framework, 
             content_writer_id, editor_id, link, start_date, end_date, priority) 
             VALUES (:id, :client_id, :title, :category, :status, :budget, :client_advance, 
             :model_payment, :extra_expenses, :models, :content_log, :script, :scripts, :thumbnail_url,
             :recommendation_link, :video_duration, :formats, :content_type, :framework,
             :content_writer_id, :editor_id, :link, :start_date, :end_date, :priority)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':client_id' => $clientId,
            ':title' => $data['title'] ?? '',
            ':category' => $data['category'] ?? '',
            ':status' => $data['status'] ?? 'Planning',
            ':budget' => $data['budget'] ?? 0,
            ':client_advance' => $data['clientAdvance'] ?? 0,
            ':model_payment' => $data['modelPayment'] ?? 0,
            ':extra_expenses' => $data['extraExpenses'] ?? 0,
            ':models' => json_encode($data['models'] ?? []),
            ':content_log' => json_encode($data['contentLog'] ?? []),
            ':script' => $data['script'] ?? '',
            ':scripts' => json_encode($data['scripts'] ?? []),
            ':thumbnail_url' => $data['thumbnailUrl'] ?? '',
            ':recommendation_link' => $data['recommendationLink'] ?? '',
            ':video_duration' => $data['videoDuration'] ?? '',
            ':formats' => json_encode($data['formats'] ?? []),
            ':content_type' => $data['contentType'] ?? '',
            ':framework' => $data['framework'] ?? '',
            ':content_writer_id' => $data['contentWriterId'] ?? '',
            ':editor_id' => $data['editorId'] ?? '',
            ':link' => $data['link'] ?? '',
            ':start_date' => !empty($data['startDate']) ? $data['startDate'] : null,
            ':end_date' => !empty($data['endDate']) ? $data['endDate'] : null,
            ':priority' => $data['priority'] ?? 'Normal',
        ]);
        
        return self::findById($id);
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM projects WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $p = $stmt->fetch();
        if (!$p) return null;
        return self::formatProject($p);
    }

    public static function update(string $id, array $data, ?string $newClientId = null): ?array {
        $db = Database::getConnection();
        $fields = [];
        $params = [':id' => $id];
        
        if ($newClientId) {
            $fields[] = "client_id = :new_client_id";
            $params[':new_client_id'] = $newClientId;
        }
        
        $map = [
            'title' => 'title', 'category' => 'category', 'status' => 'status',
            'budget' => 'budget', 'clientAdvance' => 'client_advance',
            'modelPayment' => 'model_payment', 'extraExpenses' => 'extra_expenses',
            'script' => 'script', 'thumbnailUrl' => 'thumbnail_url',
            'recommendationLink' => 'recommendation_link', 'videoDuration' => 'video_duration',
            'contentType' => 'content_type', 'framework' => 'framework',
            'contentWriterId' => 'content_writer_id', 'editorId' => 'editor_id',
            'link' => 'link', 'startDate' => 'start_date', 'endDate' => 'end_date',
            'priority' => 'priority',
        ];
        
        foreach ($map as $feKey => $dbKey) {
            if (array_key_exists($feKey, $data)) {
                $fields[] = "$dbKey = :$dbKey";
                $params[":$dbKey"] = $data[$feKey];
            }
        }
        
        // JSON fields
        $jsonMap = ['models' => 'models', 'contentLog' => 'content_log', 
                    'scripts' => 'scripts', 'formats' => 'formats', 'messages' => 'messages'];
        foreach ($jsonMap as $feKey => $dbKey) {
            if (array_key_exists($feKey, $data)) {
                $fields[] = "$dbKey = :$dbKey";
                $params[":$dbKey"] = json_encode($data[$feKey]);
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE projects SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->prepare($sql)->execute($params);
        }
        
        return self::findById($id);
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        return $db->prepare("DELETE FROM projects WHERE id = :id")->execute([':id' => $id]);
    }

    private static function formatProject(array $p): array {
        $jsonFields = ['models', 'content_log', 'scripts', 'messages', 'formats'];
        foreach ($jsonFields as $field) {
            $p[$field] = json_decode($p[$field] ?? '[]', true) ?: [];
        }
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
        unset($p['client_id'], $p['client_advance'], $p['model_payment'], $p['extra_expenses'],
              $p['content_log'], $p['thumbnail_url'], $p['recommendation_link'], $p['video_duration'],
              $p['content_type'], $p['content_writer_id'], $p['editor_id'], $p['start_date'], $p['end_date']);
        return $p;
    }
}
