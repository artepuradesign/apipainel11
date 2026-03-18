
<?php
// src/models/PlanModel.php

class PlanModel {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function getAll() {
        $sql = "SELECT * FROM plans ORDER BY sort_order ASC, created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getActive() {
        $sql = "SELECT * FROM plans WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $sql = "SELECT * FROM plans WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $sql = "INSERT INTO plans (name, slug, description, price, duration_days, consultation_limit, features, category, is_active, is_popular, sort_order, theme_colors, card_theme, card_suit, card_type, discount_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        
        $success = $stmt->execute([
            $data['name'],
            $data['slug'],
            $data['description'],
            $data['price'],
            $data['duration_days'],
            $data['consultation_limit'],
            $data['features'],
            $data['category'],
            $data['is_active'],
            $data['is_popular'],
            $data['sort_order'],
            $data['theme_colors'],
            $data['card_theme'],
            $data['card_suit'],
            $data['card_type'],
            $data['discount_percentage']
        ]);
        
        return $success ? $this->db->lastInsertId() : false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }
        
        $values[] = $id;
        $sql = "UPDATE plans SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM plans WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function slugExists($slug, $excludeId = null) {
        $sql = "SELECT COUNT(*) FROM plans WHERE slug = ?";
        $params = [$slug];
        
        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn() > 0;
    }
}
