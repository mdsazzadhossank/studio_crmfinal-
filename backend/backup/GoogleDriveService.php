<?php
/**
 * Studio Pro CRM — Google Drive Service
 * 
 * Handles uploading files to Google Drive using a Service Account and cURL.
 * This avoids the need for heavy Composer dependencies on shared hosting.
 */

class GoogleDriveService {
    private $credentialsPath;
    private $folderId;
    
    public function __construct() {
        // Look for credentials.json in backend/config/
        $this->credentialsPath = __DIR__ . '/../config/credentials.json';
        
        // Define a specific folder ID if you want to upload to a specific folder.
        // Otherwise, it uploads to the root of the service account's drive.
        // To use a shared folder, share it with the service account email and put the ID here.
        // E.g., '1A2b3C4d5E6f7G8h9I0j'
        $this->folderId = getenv('GOOGLE_DRIVE_FOLDER_ID') ?: null;
    }

    /**
     * Checks if credentials exist
     */
    public function isConfigured() {
        return file_exists($this->credentialsPath);
    }

    /**
     * Generates a JWT token for Google API Service Account authentication
     */
    private function getAccessToken() {
        if (!$this->isConfigured()) {
            throw new Exception("Google Drive credentials.json not found in backend/config/");
        }

        $fileContent = file_get_contents($this->credentialsPath);
        $credentials = json_decode($fileContent, true);
        if (!$credentials) {
            $jsonError = json_last_error_msg();
            throw new Exception("Invalid credentials.json format. JSON Error: " . $jsonError);
        }

        // Check if using OAuth2 Refresh Token method (to bypass Service Account Quota issues)
        if (isset($credentials['refresh_token']) && isset($credentials['client_id']) && isset($credentials['client_secret'])) {
            $ch = curl_init('https://oauth2.googleapis.com/token');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'client_id' => $credentials['client_id'],
                'client_secret' => $credentials['client_secret'],
                'refresh_token' => $credentials['refresh_token'],
                'grant_type' => 'refresh_token'
            ]));

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception("Failed to get OAuth2 access token: " . $response);
            }

            $responseData = json_decode($response, true);
            return $responseData['access_token'];
        }

        // Otherwise fallback to Service Account JWT method
        if (!isset($credentials['client_email']) || !isset($credentials['private_key'])) {
            throw new Exception("Invalid credentials.json format. Must contain either (client_id, client_secret, refresh_token) OR (client_email, private_key).");
        }

        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $now = time();
        $claim = json_encode([
            'iss' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/drive',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlClaim = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claim));

        $signatureInput = $base64UrlHeader . "." . $base64UrlClaim;

        $signature = '';
        if (!openssl_sign($signatureInput, $signature, $credentials['private_key'], 'SHA256')) {
            throw new Exception("Failed to sign JWT for Google API authentication");
        }

        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        $jwt = $signatureInput . "." . $base64UrlSignature;

        // Exchange JWT for Access Token
        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Failed to get Service Account access token: " . $response);
        }

        $responseData = json_decode($response, true);
        return $responseData['access_token'];
    }

    /**
     * Uploads a file to Google Drive
     * 
     * @param string $filePath Local path to the file
     * @param string $fileName Desired name on Google Drive
     * @param string $mimeType File MIME type
     * @return array Contains 'id' and 'webViewLink'
     */
    public function uploadFile($filePath, $fileName, $mimeType = 'application/zip') {
        if (!file_exists($filePath)) {
            throw new Exception("File not found for upload: " . $filePath);
        }

        $accessToken = $this->getAccessToken();

        // 1. Initiate resumable upload session
        $metadata = [
            'name' => $fileName,
            'mimeType' => $mimeType
        ];
        
        if ($this->folderId) {
            $metadata['parents'] = [$this->folderId];
        }

        $ch = curl_init('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($metadata));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
            'X-Upload-Content-Type: ' . $mimeType,
            'X-Upload-Content-Length: ' . filesize($filePath)
        ]);
        curl_setopt($ch, CURLOPT_HEADER, true);

        $response = curl_exec($ch);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headerStr = substr($response, 0, $headerSize);
        curl_close($ch);

        // Extract upload URL from Location header
        $uploadUrl = '';
        foreach (explode("\r\n", $headerStr) as $line) {
            if (stripos($line, 'Location:') === 0) {
                $uploadUrl = trim(substr($line, 9));
                break;
            }
        }

        if (empty($uploadUrl)) {
            $bodyStr = substr($response, $headerSize);
            throw new Exception("Failed to get Google Drive upload URL. Response: " . $bodyStr . " | Header: " . $headerStr);
        }

        // 2. Upload the actual file
        $fileHandle = fopen($filePath, 'r');
        $fileSize = filesize($filePath);

        $ch2 = curl_init($uploadUrl);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_PUT, true);
        curl_setopt($ch2, CURLOPT_INFILE, $fileHandle);
        curl_setopt($ch2, CURLOPT_INFILESIZE, $fileSize);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Content-Length: ' . $fileSize
        ]);

        $uploadResponse = curl_exec($ch2);
        $uploadHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        fclose($fileHandle);

        if ($uploadHttpCode !== 200 && $uploadHttpCode !== 201) {
            throw new Exception("Failed to upload file to Google Drive: " . $uploadResponse);
        }

        $fileData = json_decode($uploadResponse, true);
        
        // 3. Make file accessible via link (anyone with link can view)
        // If you want it private, remove this section. But typically backups are accessible to the super admin.
        // In an enterprise system, you might want it private to the service account, but shared with specific emails.
        // For simplicity and to return a webViewLink, we'll try to share it or at least fetch the webViewLink.
        $fileId = $fileData['id'];

        // Get webViewLink
        $ch3 = curl_init("https://www.googleapis.com/drive/v3/files/{$fileId}?fields=webViewLink,id");
        curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch3, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken
        ]);
        
        $linkResponse = curl_exec($ch3);
        curl_close($ch3);
        $linkData = json_decode($linkResponse, true);

        return [
            'id' => $fileId,
            'webViewLink' => $linkData['webViewLink'] ?? "https://drive.google.com/file/d/{$fileId}/view"
        ];
    }
}
