<?php
/**
 * Studio Pro CRM — Model (Talent) Controller
 */

require_once __DIR__ . '/../models/ModelTalent.php';

class ModelController {

    public static function getAll(): void {
        try {
            jsonResponse(ModelTalent::getAll());
        } catch (Exception $e) {
            jsonError('Failed to fetch models: ' . $e->getMessage(), 500);
        }
    }

    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['name'])) {
                jsonError('Model name is required', 400);
            }
            $model = ModelTalent::create($data);
            jsonResponse($model, 201);
        } catch (Exception $e) {
            jsonError('Failed to create model: ' . $e->getMessage(), 500);
        }
    }
}
