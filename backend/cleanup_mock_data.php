<?php
/**
 * Studio Pro CRM — Database Cleanup Script v2
 * Removes ALL mock/demo data from kv_store
 * DELETE THIS FILE AFTER RUNNING!
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $db = Database::getConnection();
    $results = [];

    // 1. Clean mock VIP clients (IDs 101-104)
    $stmt = $db->prepare("SELECT store_value FROM kv_store WHERE store_key = 'vipClientsData'");
    $stmt->execute();
    $row = $stmt->fetch();
    if ($row) {
        $vipClients = json_decode($row['store_value'], true);
        if (is_array($vipClients)) {
            $mockIds = [101, 102, 103, 104];
            $cleaned = array_values(array_filter($vipClients, function($c) use ($mockIds) {
                return !in_array($c['id'], $mockIds);
            }));
            $stmt2 = $db->prepare("UPDATE kv_store SET store_value = :val, updated_at = NOW() WHERE store_key = 'vipClientsData'");
            $stmt2->execute([':val' => json_encode($cleaned, JSON_UNESCAPED_UNICODE)]);
            $results['vipClientsData'] = 'Cleaned ' . (count($vipClients) - count($cleaned)) . ' mock VIP clients. ' . count($cleaned) . ' real clients remain.';
        }
    }

    // 2. Clean demo service clients (IDs d1 through d20)
    $stmt = $db->prepare("SELECT store_value FROM kv_store WHERE store_key = 'allClientsData'");
    $stmt->execute();
    $row = $stmt->fetch();
    if ($row) {
        $allClients = json_decode($row['store_value'], true);
        if (is_array($allClients)) {
            $demoIds = ['d1','d2','d3','d4','d5','d6','d7','d8','d9','d10','d11','d12','d13','d14','d15','d16','d17','d18','d19','d20'];
            $cleaned = array_values(array_filter($allClients, function($c) use ($demoIds) {
                return !in_array($c['id'], $demoIds);
            }));
            $stmt2 = $db->prepare("UPDATE kv_store SET store_value = :val, updated_at = NOW() WHERE store_key = 'allClientsData'");
            $stmt2->execute([':val' => json_encode($cleaned, JSON_UNESCAPED_UNICODE)]);
            $results['allClientsData'] = 'Cleaned ' . (count($allClients) - count($cleaned)) . ' demo clients. ' . count($cleaned) . ' real clients remain.';
        }
    } else {
        $results['allClientsData'] = 'No data found in DB yet.';
    }

    // 3. Reset monthly goals to 0
    $stmt = $db->prepare("SELECT store_value FROM kv_store WHERE store_key = 'monthlyGoals'");
    $stmt->execute();
    $row = $stmt->fetch();
    if ($row) {
        $goals = json_decode($row['store_value'], true);
        if (is_array($goals)) {
            foreach ($goals as &$goal) {
                $goal['current'] = 0;
                $goal['clientsSigned'] = 0;
            }
            $stmt2 = $db->prepare("UPDATE kv_store SET store_value = :val, updated_at = NOW() WHERE store_key = 'monthlyGoals'");
            $stmt2->execute([':val' => json_encode($goals, JSON_UNESCAPED_UNICODE)]);
            $results['monthlyGoals'] = 'Reset all goal values to 0';
        }
    }

    // 4. Show all kv_store keys
    $stmt = $db->query("SELECT store_key, LENGTH(store_value) as data_size, updated_at FROM kv_store ORDER BY updated_at DESC");
    $keys = [];
    while ($row = $stmt->fetch()) {
        $keys[] = [
            'key' => $row['store_key'],
            'data_size_bytes' => $row['data_size'],
            'last_updated' => $row['updated_at']
        ];
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'All mock/demo data cleaned successfully!',
        'cleanup_results' => $results,
        'all_kv_store_keys' => $keys
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
