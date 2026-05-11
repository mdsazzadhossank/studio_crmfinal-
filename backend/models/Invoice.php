<?php
/**
 * Studio Pro CRM — Invoice Model
 */

require_once __DIR__ . '/../config/database.php';

class InvoiceModel {

    public static function getAll(): array {
        $db = Database::getConnection();
        $invoices = $db->query("SELECT * FROM invoices ORDER BY created_at DESC")->fetchAll();
        
        foreach ($invoices as &$inv) {
            $inv['items'] = self::getItems($inv['id']);
            $inv = self::format($inv);
        }
        
        return $invoices;
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM invoices WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $inv = $stmt->fetch();
        if (!$inv) return null;
        $inv['items'] = self::getItems($id);
        return self::format($inv);
    }

    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'inv' . round(microtime(true) * 1000);
        
        $db->beginTransaction();
        
        try {
            $stmt = $db->prepare(
                "INSERT INTO invoices (id, client_id, project_id, invoice_number, date, due_date, subtotal, tax_rate, discount, total, status, notes) 
                 VALUES (:id, :client_id, :project_id, :invoice_number, :date, :due_date, :subtotal, :tax_rate, :discount, :total, :status, :notes)"
            );
            
            $stmt->execute([
                ':id' => $id,
                ':client_id' => $data['clientId'] ?? '',
                ':project_id' => $data['projectId'] ?? '',
                ':invoice_number' => $data['invoiceNumber'] ?? '',
                ':date' => $data['date'] ?? date('Y-m-d'),
                ':due_date' => !empty($data['dueDate']) ? $data['dueDate'] : null,
                ':subtotal' => $data['subtotal'] ?? 0,
                ':tax_rate' => $data['taxRate'] ?? 0,
                ':discount' => $data['discount'] ?? 0,
                ':total' => $data['total'] ?? 0,
                ':status' => $data['status'] ?? 'Unpaid',
                ':notes' => $data['notes'] ?? '',
            ]);
            
            // Insert items
            if (!empty($data['items'])) {
                $itemStmt = $db->prepare(
                    "INSERT INTO invoice_items (id, invoice_id, description, quantity, rate) VALUES (:id, :invoice_id, :description, :quantity, :rate)"
                );
                foreach ($data['items'] as $item) {
                    $itemStmt->execute([
                        ':id' => $item['id'] ?? 'ii' . round(microtime(true) * 1000) . rand(100,999),
                        ':invoice_id' => $id,
                        ':description' => $item['description'] ?? '',
                        ':quantity' => $item['quantity'] ?? 1,
                        ':rate' => $item['rate'] ?? 0,
                    ]);
                }
            }
            
            $db->commit();
            return self::findById($id);
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        // invoice_items cascade deleted via FK
        return $db->prepare("DELETE FROM invoices WHERE id = :id")->execute([':id' => $id]);
    }

    private static function getItems(string $invoiceId): array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM invoice_items WHERE invoice_id = :invoice_id");
        $stmt->execute([':invoice_id' => $invoiceId]);
        $items = $stmt->fetchAll();
        
        return array_map(function($item) {
            $item['quantity'] = (int)$item['quantity'];
            $item['rate'] = (float)$item['rate'];
            unset($item['invoice_id']);
            return $item;
        }, $items);
    }

    private static function format(array $inv): array {
        $inv['clientId'] = $inv['client_id'];
        $inv['projectId'] = $inv['project_id'];
        $inv['invoiceNumber'] = $inv['invoice_number'];
        $inv['dueDate'] = $inv['due_date'];
        $inv['taxRate'] = (float)$inv['tax_rate'];
        $inv['subtotal'] = (float)$inv['subtotal'];
        $inv['discount'] = (float)$inv['discount'];
        $inv['total'] = (float)$inv['total'];
        unset($inv['client_id'], $inv['project_id'], $inv['invoice_number'], $inv['due_date'], $inv['tax_rate']);
        return $inv;
    }
}
