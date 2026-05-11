<?php
/**
 * Studio Pro CRM — Project Controller
 */

require_once __DIR__ . '/../models/Project.php';

class ProjectController {

    /**
     * POST /api/add_project.php
     * Body: { clientId, title, ... }
     */
    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['clientId'])) {
                jsonError('Client ID is required', 400);
            }
            
            $clientId = $data['clientId'];
            unset($data['clientId']);
            
            $project = ProjectModel::create($clientId, $data);
            jsonResponse($project, 201);
        } catch (Exception $e) {
            jsonError('Failed to create project: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/update_project.php
     * Body: { clientId, projectId, newClientId?, ...data }
     */
    public static function update(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['projectId'])) {
                jsonError('Project ID is required', 400);
            }
            
            $projectId = $data['projectId'];
            $newClientId = $data['newClientId'] ?? null;
            unset($data['projectId'], $data['clientId'], $data['newClientId']);
            
            $project = ProjectModel::update($projectId, $data, $newClientId);
            if (!$project) {
                jsonError('Project not found', 404);
            }
            jsonResponse($project);
        } catch (Exception $e) {
            jsonError('Failed to update project: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/delete_project.php
     */
    public static function delete(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Project ID is required', 400);
            }
            
            ProjectModel::delete($data['id']);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Failed to delete project: ' . $e->getMessage(), 500);
        }
    }
}
