<?php
/**
 * Studio Pro CRM — Employee Controller
 */

require_once __DIR__ . '/../models/Employee.php';

class EmployeeController {

    public static function getAll(): void {
        try {
            jsonResponse(EmployeeModel::getAll());
        } catch (Exception $e) {
            jsonError('Failed to fetch employees: ' . $e->getMessage(), 500);
        }
    }

    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['name'])) {
                jsonError('Employee name is required', 400);
            }
            jsonResponse(EmployeeModel::create($data), 201);
        } catch (Exception $e) {
            jsonError('Failed to create employee: ' . $e->getMessage(), 500);
        }
    }

    public static function update(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Employee ID is required', 400);
            }
            $emp = EmployeeModel::update($data['id'], $data);
            jsonResponse($emp);
        } catch (Exception $e) {
            jsonError('Failed to update employee: ' . $e->getMessage(), 500);
        }
    }

    public static function delete(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Employee ID is required', 400);
            }
            EmployeeModel::delete($data['id']);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Failed to delete employee: ' . $e->getMessage(), 500);
        }
    }
}
