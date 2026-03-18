
<?php
// src/models/UserProfile.php

require_once 'BaseModel.php';

class UserProfile extends BaseModel {
    protected $table = 'user_profiles';
    
    public $id;
    public $user_id;
    public $avatar_url;
    public $bio;
    public $company;
    public $website;
    public $social_links;
    public $preferences;
    public $timezone;
    public $language;
    public $theme;
    public $two_factor_enabled;
    public $two_factor_secret;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getByUserId($userId) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function createProfile($userId, $data = []) {
        $query = "INSERT INTO {$this->table} (user_id, timezone, language, theme) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE updated_at = NOW()";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            $userId,
            $data['timezone'] ?? 'America/Sao_Paulo',
            $data['language'] ?? 'pt-BR', 
            $data['theme'] ?? 'light'
        ]);
    }
    
    public function updateProfile($userId, $data) {
        $fields = [];
        $values = [];
        
        $allowedFields = ['avatar_url', 'bio', 'company', 'website', 'social_links', 
                         'preferences', 'timezone', 'language', 'theme'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = is_array($data[$field]) ? json_encode($data[$field]) : $data[$field];
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $userId;
        $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute($values);
    }
}
