
<?php
// src/models/Panel.php

class Panel {
    private $conn;
    private $table_name = "panels";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY sort_order ASC, name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getActivePanels() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = 1 ORDER BY sort_order ASC, name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function slugExists($slug, $excludeId = null) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE slug = ?";
        if ($excludeId) {
            $query .= " AND id != ?";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $slug);
        if ($excludeId) {
            $stmt->bindParam(2, $excludeId);
        }
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] > 0;
    }
    
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                 (name, slug, description, icon, color, background_color, category, template, is_active, is_premium, sort_order, settings) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        
        $result = $stmt->execute([
            $data['name'],
            $data['slug'],
            $data['description'] ?? '',
            $data['icon'] ?? 'Package',
            $data['color'] ?? '#6366f1',
            $data['background_color'] ?? '#f8fafc',
            $data['category'] ?? 'general',
            $data['template'] ?? 'modern',
            $data['is_active'] ?? 1,
            $data['is_premium'] ?? 0,
            $data['sort_order'] ?? 0,
            $data['settings'] ?? '{}'
        ]);
        
        return $result ? $this->conn->lastInsertId() : false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $values = [];
        
        $allowedFields = ['name', 'slug', 'description', 'icon', 'color', 'background_color', 'category', 'template', 'is_active', 'is_premium', 'sort_order', 'settings'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>
