
<?php
// src/utils/QRCode.php

class QRCode {
    private $size;
    private $margin;
    private $errorCorrection;
    
    public function __construct($size = 200, $margin = 10, $errorCorrection = 'M') {
        $this->size = $size;
        $this->margin = $margin;
        $this->errorCorrection = $errorCorrection;
    }
    
    public function generate($text, $format = 'png') {
        // Implementação básica usando API externa
        $apiUrl = "https://api.qrserver.com/v1/create-qr-code/";
        
        $params = [
            'size' => $this->size . 'x' . $this->size,
            'data' => urlencode($text),
            'format' => $format,
            'margin' => $this->margin,
            'ecc' => $this->errorCorrection
        ];
        
        $url = $apiUrl . '?' . http_build_query($params);
        
        $qrCode = file_get_contents($url);
        
        if ($qrCode === false) {
            throw new Exception('Erro ao gerar QR Code');
        }
        
        return $qrCode;
    }
    
    public function generatePixQR($pixKey, $amount = null, $description = null) {
        $pixData = $this->buildPixPayload($pixKey, $amount, $description);
        return $this->generate($pixData);
    }
    
    public function saveToFile($text, $filename, $format = 'png') {
        $qrCode = $this->generate($text, $format);
        
        $filePath = __DIR__ . '/../../storage/temp/' . $filename;
        
        if (!is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }
        
        if (file_put_contents($filePath, $qrCode) === false) {
            throw new Exception('Erro ao salvar QR Code');
        }
        
        return $filePath;
    }
    
    public function generateBase64($text, $format = 'png') {
        $qrCode = $this->generate($text, $format);
        return 'data:image/' . $format . ';base64,' . base64_encode($qrCode);
    }
    
    private function buildPixPayload($pixKey, $amount = null, $description = null) {
        // Implementação simplificada do payload PIX
        $payload = "00020126";
        
        // Merchant Account Information
        $pixKeyLength = str_pad(strlen($pixKey), 2, '0', STR_PAD_LEFT);
        $merchantInfo = "0014br.gov.bcb.pix01" . $pixKeyLength . $pixKey;
        $merchantInfoLength = str_pad(strlen($merchantInfo), 2, '0', STR_PAD_LEFT);
        $payload .= "26" . $merchantInfoLength . $merchantInfo;
        
        // Merchant Category Code
        $payload .= "52040000";
        
        // Transaction Currency
        $payload .= "5303986";
        
        // Transaction Amount
        if ($amount) {
            $amountStr = number_format($amount, 2, '.', '');
            $amountLength = str_pad(strlen($amountStr), 2, '0', STR_PAD_LEFT);
            $payload .= "54" . $amountLength . $amountStr;
        }
        
        // Country Code
        $payload .= "5802BR";
        
        // Additional Data Field Template
        if ($description) {
            $descLength = str_pad(strlen($description), 2, '0', STR_PAD_LEFT);
            $additionalData = "05" . $descLength . $description;
            $additionalDataLength = str_pad(strlen($additionalData), 2, '0', STR_PAD_LEFT);
            $payload .= "62" . $additionalDataLength . $additionalData;
        }
        
        // CRC16
        $payload .= "6304";
        $crc = $this->calculateCRC16($payload);
        $payload .= strtoupper(dechex($crc));
        
        return $payload;
    }
    
    private function calculateCRC16($data) {
        $crc = 0xFFFF;
        
        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= ord($data[$i]) << 8;
            
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc = $crc << 1;
                }
            }
        }
        
        return $crc & 0xFFFF;
    }
    
    public function readQRCode($imagePath) {
        // Implementação para ler QR Code seria necessária uma biblioteca externa
        // Como ZXing ou similar
        throw new Exception('Funcionalidade de leitura de QR Code não implementada');
    }
}
