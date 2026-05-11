<?php
/**
 * Studio Pro CRM — Lead Controller
 */

require_once __DIR__ . '/../models/Lead.php';

class LeadController {

    public static function getAll(): void {
        try {
            jsonResponse(LeadModel::getAll());
        } catch (Exception $e) {
            jsonError('Failed to fetch leads: ' . $e->getMessage(), 500);
        }
    }

    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data)) {
                jsonError('Invalid lead data', 400);
            }
            jsonResponse(LeadModel::create($data), 201);
        } catch (Exception $e) {
            jsonError('Failed to create lead: ' . $e->getMessage(), 500);
        }
    }

    public static function delete(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Lead ID is required', 400);
            }
            LeadModel::delete($data['id']);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Failed to delete lead: ' . $e->getMessage(), 500);
        }
    }
}
