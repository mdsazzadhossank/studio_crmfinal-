<?php
/**
 * Studio Pro CRM — Lead Model
 */

require_once __DIR__ . '/../config/database.php';

class LeadModel {

    public static function getAll(): array {
        $db = Database::getConnection();
        $leads = $db->query("SELECT * FROM leads ORDER BY created_at DESC")->fetchAll();
        return array_map([self::class, 'format'], $leads);
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM leads WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $lead = $stmt->fetch();
        return $lead ? self::format($lead) : null;
    }

    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'lead_' . round(microtime(true) * 1000);
        
        $stmt = $db->prepare(
            "INSERT INTO leads (id, client_name, conversation_id, whatsapp_number, facebook_page, 
             business_type, business_duration, average_product_price, daily_marketing_budget, 
             current_problems, website_status, main_goal, status, tags, reminder_date, notes) 
             VALUES (:id, :client_name, :conversation_id, :whatsapp_number, :facebook_page, 
             :business_type, :business_duration, :average_product_price, :daily_marketing_budget,
             :current_problems, :website_status, :main_goal, :status, :tags, :reminder_date, :notes)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':client_name' => $data['clientName'] ?? '',
            ':conversation_id' => $data['conversationId'] ?? '',
            ':whatsapp_number' => $data['whatsappNumber'] ?? '',
            ':facebook_page' => $data['facebookPageLink'] ?? '',
            ':business_type' => $data['businessType'] ?? '',
            ':business_duration' => $data['businessDuration'] ?? '',
            ':average_product_price' => $data['averageProductPrice'] ?? '',
            ':daily_marketing_budget' => $data['dailyMarketingBudget'] ?? '',
            ':current_problems' => $data['currentProblems'] ?? '',
            ':website_status' => $data['websiteStatus'] ?? '',
            ':main_goal' => $data['mainGoal'] ?? '',
            ':status' => $data['status'] ?? 'new',
            ':tags' => json_encode($data['tags'] ?? []),
            ':reminder_date' => !empty($data['reminderDate']) ? $data['reminderDate'] : null,
            ':notes' => $data['notes'] ?? '',
        ]);
        
        return self::findById($id);
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        return $db->prepare("DELETE FROM leads WHERE id = :id")->execute([':id' => $id]);
    }

    private static function format(array $l): array {
        $l['clientName'] = $l['client_name'];
        $l['conversationId'] = $l['conversation_id'];
        $l['whatsappNumber'] = $l['whatsapp_number'];
        $l['facebookPageLink'] = $l['facebook_page'];
        $l['businessType'] = $l['business_type'];
        $l['businessDuration'] = $l['business_duration'];
        $l['averageProductPrice'] = $l['average_product_price'];
        $l['dailyMarketingBudget'] = $l['daily_marketing_budget'];
        $l['currentProblems'] = $l['current_problems'];
        $l['websiteStatus'] = $l['website_status'];
        $l['mainGoal'] = $l['main_goal'];
        $l['reminderDate'] = $l['reminder_date'];
        $l['tags'] = json_decode($l['tags'] ?? '[]', true) ?: [];
        $l['createdAt'] = $l['created_at'];
        unset($l['client_name'], $l['conversation_id'], $l['whatsapp_number'], $l['facebook_page'],
              $l['business_type'], $l['business_duration'], $l['average_product_price'], 
              $l['daily_marketing_budget'], $l['current_problems'], $l['website_status'],
              $l['main_goal'], $l['reminder_date']);
        return $l;
    }
}
