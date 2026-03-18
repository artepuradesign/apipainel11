
export const phpIntegrationExample = `<?php
// arquivo: src/services/ExternalApiService.php

class ExternalApiService {
    private $baseUrl = 'https://artepuradesign.com.br/api';
    private $apiKey;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function fetchPlans() {
        $url = $this->baseUrl . '/plans/public';
        
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey,
            'Accept: application/json'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception('Erro cURL: ' . $error);
        }
        
        if ($httpCode !== 200) {
            throw new Exception('HTTP Error: ' . $httpCode);
        }
        
        $data = json_decode($response, true);
        
        if (!$data['success']) {
            throw new Exception($data['message'] ?? 'Erro desconhecido');
        }
        
        return $data['data'];
    }
}

// Uso no seu controller:
// $apiService = new ExternalApiService('sua-api-key');
// $plans = $apiService->fetchPlans();
?>`;
