
<?php
// src/models/PanelModel.php

class PanelModel {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function getAll() {
        $sql = "SELECT * FROM panels ORDER BY sort_order ASC, created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getPanelsWithStats() {
        $sql = "
            SELECT p.*, 
                   COUNT(m.id) as modules_count,
                   SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) as active_modules_count
            FROM panels p 
            LEFT JOIN modules m ON p.id = m.panel_id 
            GROUP BY p.id 
            ORDER BY p.sort_order ASC, p.created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getActivePanels() {
        $sql = "
            SELECT p.*, 
                   COUNT(m.id) as modules_count,
                   SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) as active_modules_count
            FROM panels p 
            LEFT JOIN modules m ON p.id = m.panel_id 
            WHERE p.is_active = 1 
            GROUP BY p.id 
            ORDER BY p.sort_order ASC, p.created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $sql = "SELECT * FROM panels WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getPanelWithModules($id) {
        $panel = $this->getById($id);
        if ($panel) {
            $sql = "SELECT * FROM modules WHERE panel_id = ? ORDER BY sort_order ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            $panel['modules'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return $panel;
    }
    
    public function create($data) {
        $sql = "INSERT INTO panels (name, slug, description, icon, color, background_color, category, template, is_active, is_premium, sort_order, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        
        $success = $stmt->execute([
            $data['name'],
            $data['slug'],
            $data['description'],
            $data['icon'],
            $data['color'],
            $data['background_color'],
            $data['category'],
            $data['template'],
            $data['is_active'],
            $data['is_premium'],
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
        $sql = "UPDATE panels SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM panels WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function slugExists($slug, $excludeId = null) {
        $sql = "SELECT COUNT(*) FROM panels WHERE slug = ?";
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
