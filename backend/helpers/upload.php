<?php
/**
 * Studio Pro CRM — File Upload Helper
 */

/**
 * Handle a file upload (image, document, etc.)
 * Returns the relative path on success, or null on failure
 */
function handleFileUpload(
    array $file,
    string $subDir = '',
    array $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    int $maxSize = 0
): ?string {
    if ($maxSize === 0) {
        $maxSize = MAX_UPLOAD_SIZE;
    }

    // Validate upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    // Check file size
    if ($file['size'] > $maxSize) {
        return null;
    }

    // Check file type
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    if (!in_array($mimeType, $allowedTypes)) {
        return null;
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $extension = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $extension));
    $filename = uniqid('file_', true) . '.' . $extension;

    // Create target directory
    $targetDir = UPLOAD_DIR;
    if (!empty($subDir)) {
        $targetDir .= trim($subDir, '/') . '/';
    }

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $targetPath = $targetDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return relative path from backend root
        return str_replace(UPLOAD_DIR, 'uploads/', $targetPath);
    }

    return null;
}

/**
 * Handle base64 image upload (for logo uploads, etc.)
 * Returns the relative path on success
 */
function handleBase64Upload(string $base64Data, string $subDir = 'images'): ?string {
    // Extract mime type and data
    if (!preg_match('/^data:(image\/\w+);base64,(.+)$/', $base64Data, $matches)) {
        return null;
    }

    $mimeType = $matches[1];
    $data = base64_decode($matches[2]);

    if ($data === false) {
        return null;
    }

    // Determine extension
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
    ];

    $ext = $extensions[$mimeType] ?? 'png';
    $filename = uniqid('img_', true) . '.' . $ext;

    // Create target directory
    $targetDir = UPLOAD_DIR . trim($subDir, '/') . '/';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $targetPath = $targetDir . $filename;

    // Write file
    if (file_put_contents($targetPath, $data) !== false) {
        return str_replace(UPLOAD_DIR, 'uploads/', $targetPath);
    }

    return null;
}

/**
 * Delete an uploaded file
 */
function deleteUploadedFile(string $relativePath): bool {
    $fullPath = UPLOAD_DIR . str_replace('uploads/', '', $relativePath);
    if (file_exists($fullPath)) {
        return unlink($fullPath);
    }
    return false;
}
