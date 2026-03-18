
<?php
// src/models/Module.php

class Module {
    private $conn;
    private $table_name = "modules";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getAll() {
        $query = "SELECT m.*, p.name as panel_name, p.slug as panel_slug 
                 FROM " . $this->table_name . " m 
                 LEFT JOIN panels p ON m.panel_id = p.id 
                 ORDER BY m.sort_order ASC, m.title ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByPanel($panelId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE panel_id = ? ORDER BY sort_order ASC, title ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $panelId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $query = "SELECT m.*, p.name as panel_name, p.slug as panel_slug 
                 FROM " . $this->table_name . " m 
                 LEFT JOIN panels p ON m.panel_id = p.id 
                 WHERE m.id = ? LIMIT 1";
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
                 (panel_id, title, slug, description, icon, color, price, cost_price, path, category, operational_status, is_active, is_premium, api_endpoint, api_method, sort_order, settings) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        
        $result = $stmt->execute([
            $data['panel_id'],
            $data['title'],
            $data['slug'],
            $data['description'] ?? '',
            $data['icon'] ?? 'Package',
            $data['color'] ?? '#6366f1',
            $data['price'] ?? 0.00,
            $data['cost_price'] ?? 0.00,
            $data['path'] ?? null,
            $data['category'] ?? 'general',
            $data['operational_status'] ?? 'on',
            $data['is_active'] ?? 1,
            $data['is_premium'] ?? 0,
            $data['api_endpoint'] ?? null,
            $data['api_method'] ?? 'POST',
            $data['sort_order'] ?? 0,
            $data['settings'] ?? '{}'
        ]);
        
        return $result ? $this->conn->lastInsertId() : false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $values = [];
        
        $allowedFields = ['panel_id', 'title', 'slug', 'description', 'icon', 'color', 'price', 'cost_price', 'path', 'category', 'operational_status', 'is_active', 'is_premium', 'api_endpoint', 'api_method', 'sort_order', 'settings'];
        
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
    
    public function toggleStatus($id) {
        $query = "UPDATE " . $this->table_name . " SET operational_status = CASE 
                 WHEN operational_status = 'on' THEN 'off' 
                 ELSE 'on' END WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
    
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>
