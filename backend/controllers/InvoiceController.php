<?php
/**
 * Studio Pro CRM — Invoice Controller
 */

require_once __DIR__ . '/../models/Invoice.php';

class InvoiceController {

    public static function getAll(): void {
        try {
            jsonResponse(InvoiceModel::getAll());
        } catch (Exception $e) {
            jsonError('Failed to fetch invoices: ' . $e->getMessage(), 500);
        }
    }

    public static function create(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data)) {
                jsonError('Invalid invoice data', 400);
            }
            $invoice = InvoiceModel::create($data);
            jsonResponse($invoice, 201);
        } catch (Exception $e) {
            jsonError('Failed to create invoice: ' . $e->getMessage(), 500);
        }
    }

    public static function delete(): void {
        try {
            $data = getJsonBody();
            if (!is_array($data) || empty($data['id'])) {
                jsonError('Invoice ID is required', 400);
            }
            InvoiceModel::delete($data['id']);
            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonError('Failed to delete invoice: ' . $e->getMessage(), 500);
        }
    }
}
