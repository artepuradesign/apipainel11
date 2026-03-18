
<?php
// src/services/UsernameGenerationService.php

class UsernameGenerationService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function generateUsername($email) {
        $baseUsername = strtolower(explode('@', $email)[0]);
        $baseUsername = preg_replace('/[^a-z0-9]/', '', $baseUsername);
        
        if (strlen($baseUsername) < 3) {
            $baseUsername = 'user' . $baseUsername;
        }
        
        $username = $baseUsername;
        $counter = 1;
        
        while ($this->usernameExists($username)) {
            $username = $baseUsername . $counter;
            $counter++;
        }
        
        return $username;
    }
    
    private function usernameExists($username) {
        try {
            $query = "SELECT id FROM users WHERE username = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$username]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            error_log("USERNAME_CHECK ERROR: " . $e->getMessage());
            return false;
        }
    }
}
