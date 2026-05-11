<?php
/**
 * Studio Pro CRM — Client Controller
 */

require_once __DIR__ . '/../models/Client.php';

class ClientController {

    /**
     * GET /api/get_clients.php
     */
    public static function getAll(): void {
        try {
            $clients = ClientModel::getAll();
            jsonResponse($clients);
        } catch (Exception $e) {
            jsonError('Failed to fetch clients: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/add_client.php
     */
    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['name'])) {
                jsonError('Client name is required', 400);
            }
            
            $client = ClientModel::create($data);
            jsonResponse($client, 201);
        } catch (Exception $e) {
            jsonError('Failed to create client: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/update_client.php
     */
    public static function update(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Client ID is required', 400);
            }
            
            $client = ClientModel::update($data['id'], $data);
            if (!$client) {
                jsonError('Client not found', 404);
            }
            jsonResponse($client);
        } catch (Exception $e) {
            jsonError('Failed to update client: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/delete_client.php
     */
    public static function delete(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Client ID is required', 400);
            }
            
            ClientModel::delete($data['id']);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Failed to delete client: ' . $e->getMessage(), 500);
        }
    }
}
