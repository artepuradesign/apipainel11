
<?php
// src/models/ModuleModel.php

class ModuleModel {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function getAll() {
        $sql = "
            SELECT m.*, p.name as panel_name, p.slug as panel_slug 
            FROM modules m 
            LEFT JOIN panels p ON m.panel_id = p.id 
            ORDER BY m.sort_order ASC, m.created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getModulesWithPanel() {
        return $this->getAll();
    }
    
    public function getActiveModules() {
        $sql = "
            SELECT m.*, p.name as panel_name, p.slug as panel_slug 
            FROM modules m 
            LEFT JOIN panels p ON m.panel_id = p.id 
            WHERE m.is_active = 1 AND m.operational_status = 'on'
            ORDER BY m.sort_order ASC, m.created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByPanel($panelId) {
        $sql = "
            SELECT m.*, p.name as panel_name, p.slug as panel_slug 
            FROM modules m 
            LEFT JOIN panels p ON m.panel_id = p.id 
            WHERE m.panel_id = ? 
            ORDER BY m.sort_order ASC, m.created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$panelId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $sql = "
            SELECT m.*, p.name as panel_name, p.slug as panel_slug 
            FROM modules m 
            LEFT JOIN panels p ON m.panel_id = p.id 
            WHERE m.id = ?
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $sql = "INSERT INTO modules (panel_id, title, slug, description, icon, color, price, cost_price, path, category, operational_status, is_active, is_premium, api_endpoint, api_method, sort_order, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        
        $success = $stmt->execute([
            $data['panel_id'],
            $data['title'],
            $data['slug'],
            $data['description'],
            $data['icon'],
            $data['color'],
            $data['price'],
            $data['cost_price'],
            $data['path'],
            $data['category'],
            $data['operational_status'],
            $data['is_active'],
            $data['is_premium'],
            $data['api_endpoint'],
            $data['api_method'],
            $data['sort_order'],
            $data['settings']
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
        $sql = "UPDATE modules SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM modules WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function slugExists($slug, $excludeId = null) {
        $sql = "SELECT COUNT(*) FROM modules WHERE slug = ?";
        $params = [$slug];
        
        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn() > 0;
    }
    
    public function toggleStatus($id) {
        $module = $this->getById($id);
        if (!$module) return false;
        
        $newStatus = $module['operational_status'] === 'on' ? 'off' : 'on';
        return $this->update($id, ['operational_status' => $newStatus]);
    }
}
