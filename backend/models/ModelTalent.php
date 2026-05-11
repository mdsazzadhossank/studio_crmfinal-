<?php
/**
 * Studio Pro CRM — ModelTalent Model (Talent/Model Profiles)
 * Named ModelTalent to avoid PHP keyword conflict
 */

require_once __DIR__ . '/../config/database.php';

class ModelTalent {

    public static function getAll(): array {
        $db = Database::getConnection();
        $models = $db->query("SELECT * FROM models ORDER BY created_at DESC")->fetchAll();
        return array_map([self::class, 'format'], $models);
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM models WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $model = $stmt->fetch();
        return $model ? self::format($model) : null;
    }

    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'm' . round(microtime(true) * 1000);
        
        $stmt = $db->prepare(
            "INSERT INTO models (id, name, category, hourly_rate, phone, email, facebook, image_url, portfolio_links, portfolio_images, projects) 
             VALUES (:id, :name, :category, :hourly_rate, :phone, :email, :facebook, :image_url, :portfolio_links, :portfolio_images, :projects)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':category' => $data['category'] ?? '',
            ':hourly_rate' => $data['hourlyRate'] ?? 0,
            ':phone' => $data['phone'] ?? '',
            ':email' => $data['email'] ?? '',
            ':facebook' => $data['facebook'] ?? '',
            ':image_url' => $data['imageUrl'] ?? '',
            ':portfolio_links' => json_encode($data['portfolioLinks'] ?? []),
            ':portfolio_images' => json_encode($data['portfolioImages'] ?? []),
            ':projects' => json_encode($data['projects'] ?? []),
        ]);
        
        return self::findById($id);
    }

    public static function update(string $id, array $data): ?array {
        $db = Database::getConnection();
        $fields = [];
        $params = [':id' => $id];
        
        $map = [
            'name' => 'name', 'category' => 'category', 'hourlyRate' => 'hourly_rate',
            'phone' => 'phone', 'email' => 'email', 'facebook' => 'facebook',
            'imageUrl' => 'image_url',
        ];
        
        foreach ($map as $fe => $db_key) {
            if (isset($data[$fe])) {
                $fields[] = "$db_key = :$db_key";
                $params[":$db_key"] = $data[$fe];
            }
        }
        
        $jsonMap = ['portfolioLinks' => 'portfolio_links', 'portfolioImages' => 'portfolio_images', 'projects' => 'projects'];
        foreach ($jsonMap as $fe => $db_key) {
            if (isset($data[$fe])) {
                $fields[] = "$db_key = :$db_key";
                $params[":$db_key"] = json_encode($data[$fe]);
            }
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE models SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->prepare($sql)->execute($params);
        }
        
        return self::findById($id);
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        return $db->prepare("DELETE FROM models WHERE id = :id")->execute([':id' => $id]);
    }

    private static function format(array $m): array {
        $m['hourlyRate'] = (float)$m['hourly_rate'];
        $m['imageUrl'] = $m['image_url'];
        $m['portfolioLinks'] = json_decode($m['portfolio_links'] ?? '[]', true) ?: [];
        $m['portfolioImages'] = json_decode($m['portfolio_images'] ?? '[]', true) ?: [];
        $m['projects'] = json_decode($m['projects'] ?? '[]', true) ?: [];
        unset($m['hourly_rate'], $m['image_url'], $m['portfolio_links'], $m['portfolio_images']);
        return $m;
    }
}
