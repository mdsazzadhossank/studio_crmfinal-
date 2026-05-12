<?php
/**
 * Studio Pro CRM — User Management Controller
 */

require_once __DIR__ . '/../models/User.php';

class UserController {

    public static function getAll(): void {
        try {
            jsonResponse(User::getAll());
        } catch (Exception $e) {
            jsonError('Failed to fetch users: ' . $e->getMessage(), 500);
        }
    }

    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['name']) || empty($data['email'])) {
                jsonError('Name and email are required', 400);
            }
            
            // Check if email already exists to prevent 500 duplicate key error
            $existing = User::findByEmail($data['email']);
            if ($existing) {
                jsonError('A user with this email already exists', 400);
            }
            
            $user = User::create($data);
            $formatted = User::formatForFrontend($user);
            jsonResponse($formatted, 201);
        } catch (Exception $e) {
            jsonError('Failed to create user: ' . $e->getMessage(), 500);
        }
    }

    public static function update(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('User ID is required', 400);
            }
            $user = User::update($data['id'], $data);
            if (!$user) {
                jsonError('User not found', 404);
            }
            $formatted = User::formatForFrontend($user);
            jsonResponse($formatted);
        } catch (Exception $e) {
            jsonError('Failed to update user: ' . $e->getMessage(), 500);
        }
    }

    public static function delete(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('User ID is required', 400);
            }
            User::delete($data['id']);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Failed to delete user: ' . $e->getMessage(), 500);
        }
    }
}
