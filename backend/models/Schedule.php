<?php
/**
 * Studio Pro CRM — Schedule Model
 */

require_once __DIR__ . '/../config/database.php';

class ScheduleModel {

    public static function getAll(): array {
        $db = Database::getConnection();
        $events = $db->query("SELECT * FROM schedule_events ORDER BY date ASC")->fetchAll();
        return array_map([self::class, 'format'], $events);
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM schedule_events WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $event = $stmt->fetch();
        return $event ? self::format($event) : null;
    }

    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 's' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        
        $stmt = $db->prepare(
            "INSERT INTO schedule_events (id, title, date, type, models, crew, project_id) 
             VALUES (:id, :title, :date, :type, :models, :crew, :project_id)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'] ?? '',
            ':date' => $data['date'] ?? date('Y-m-d'),
            ':type' => $data['type'] ?? 'Meeting',
            ':models' => json_encode($data['models'] ?? []),
            ':crew' => json_encode($data['crew'] ?? []),
            ':project_id' => $data['projectId'] ?? '',
        ]);
        
        return self::findById($id);
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        return $db->prepare("DELETE FROM schedule_events WHERE id = :id")->execute([':id' => $id]);
    }

    private static function format(array $e): array {
        $e['models'] = json_decode($e['models'] ?? '[]', true) ?: [];
        $e['crew'] = json_decode($e['crew'] ?? '[]', true) ?: [];
        $e['projectId'] = $e['project_id'];
        unset($e['project_id']);
        return $e;
    }
}
