<?php
/**
 * Studio Pro CRM — Store Controller
 * Universal key-value store (backward compatible with Node.js server.ts)
 * Handles: /api/sync, /api/store/{key}
 */

require_once __DIR__ . '/../models/KeyValueStore.php';

class StoreController {

    /**
     * GET /api/sync — Dump entire database for frontend boot
     */
    public static function sync(): void {
        try {
            $data = KeyValueStore::getAll();
            jsonResponse($data);
        } catch (Exception $e) {
            jsonError('Error in /api/sync: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/store/{key} — Get a single key
     */
    public static function get(string $key): void {
        try {
            $value = KeyValueStore::get($key);
            jsonResponse($value);
        } catch (Exception $e) {
            jsonError('Error fetching ' . $key . ': ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/store/{key} — Set a single key
     */
    public static function set(string $key): void {
        try {
            $body = getJsonBody();
            KeyValueStore::set($key, $body);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Error saving ' . $key . ': ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/store/{key} — Delete a single key
     */
    public static function delete(string $key): void {
        try {
            KeyValueStore::delete($key);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Error deleting ' . $key . ': ' . $e->getMessage(), 500);
        }
    }
}
