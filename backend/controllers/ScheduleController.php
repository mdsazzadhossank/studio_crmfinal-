<?php
/**
 * Studio Pro CRM — Schedule Controller
 */

require_once __DIR__ . '/../models/Schedule.php';

class ScheduleController {

    public static function getAll(): void {
        try {
            jsonResponse(ScheduleModel::getAll());
        } catch (Exception $e) {
            jsonError('Failed to fetch schedule: ' . $e->getMessage(), 500);
        }
    }

    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['title'])) {
                jsonError('Event title is required', 400);
            }
            jsonResponse(ScheduleModel::create($data), 201);
        } catch (Exception $e) {
            jsonError('Failed to create event: ' . $e->getMessage(), 500);
        }
    }
}
