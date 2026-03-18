
<?php
// src/controllers/BaseController.php

abstract class BaseController {
    protected $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    protected function validateJsonInput() {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            return ['valid' => false, 'data' => null, 'raw' => $rawInput];
        }
        
        return ['valid' => true, 'data' => $input, 'raw' => $rawInput];
    }
    
    protected function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader)) {
            return null;
        }
        
        return str_replace('Bearer ', '', $authHeader);
    }
}
