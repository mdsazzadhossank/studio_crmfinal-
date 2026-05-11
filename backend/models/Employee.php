<?php
/**
 * Studio Pro CRM — Employee Model
 */

require_once __DIR__ . '/../config/database.php';

class EmployeeModel {

    public static function getAll(): array {
        $db = Database::getConnection();
        $employees = $db->query("SELECT * FROM employees ORDER BY created_at DESC")->fetchAll();
        return array_map([self::class, 'format'], $employees);
    }

    public static function findById(string $id): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM employees WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $emp = $stmt->fetch();
        return $emp ? self::format($emp) : null;
    }

    public static function create(array $data): array {
        $db = Database::getConnection();
        $id = $data['id'] ?? 'emp_' . round(microtime(true) * 1000);
        
        $stmt = $db->prepare(
            "INSERT INTO employees (id, name, designation, phone, email, address, joining_date, salary, status) 
             VALUES (:id, :name, :designation, :phone, :email, :address, :joining_date, :salary, :status)"
        );
        
        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':designation' => $data['designation'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':email' => $data['email'] ?? '',
            ':address' => $data['address'] ?? '',
            ':joining_date' => !empty($data['joiningDate']) ? $data['joiningDate'] : null,
            ':salary' => $data['salary'] ?? '',
            ':status' => $data['status'] ?? 'Active',
        ]);
        
        return self::findById($id);
    }

    public static function update(string $id, array $data): ?array {
        $db = Database::getConnection();
        $fields = [];
        $params = [':id' => $id];
        
        $map = [
            'name' => 'name', 'designation' => 'designation', 'phone' => 'phone',
            'email' => 'email', 'address' => 'address', 'joiningDate' => 'joining_date',
            'salary' => 'salary', 'status' => 'status',
        ];
        
        foreach ($map as $fe => $dbk) {
            if (isset($data[$fe])) {
                $fields[] = "$dbk = :$dbk";
                $params[":$dbk"] = $data[$fe];
            }
        }
        
        if (!empty($fields)) {
            $db->prepare("UPDATE employees SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
        }
        
        return self::findById($id);
    }

    public static function delete(string $id): bool {
        $db = Database::getConnection();
        return $db->prepare("DELETE FROM employees WHERE id = :id")->execute([':id' => $id]);
    }

    private static function format(array $e): array {
        $e['joiningDate'] = $e['joining_date'];
        unset($e['joining_date']);
        return $e;
    }
}
