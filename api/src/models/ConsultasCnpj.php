<?php
// src/models/ConsultasCnpj.php

class ConsultasCnpj {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO consultas_cnpj (
                user_id, cnpj, cost, status, result_data,
                ip_address, user_agent, saldo_usado, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        // Codificar JSON
        $result_data = isset($data['result_data']) ? json_encode($data['result_data']) : null;
        $metadata = isset($data['metadata']) ? json_encode($data['metadata']) : null;
        
        $stmt->bind_param(
            "isdsssss",
            $data['user_id'],
            $data['cnpj'],
            $data['cost'],
            $data['status'],
            $result_data,
            $data['ip_address'],
            $data['user_agent'],
            $data['saldo_usado'],
            $metadata
        );
        
        if ($stmt->execute()) {
            return $this->db->insert_id;
        }
        
        return false;
    }
    
    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT c.*, u.username, u.full_name
            FROM consultas_cnpj c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
            LIMIT 1
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            
            // Decodificar JSON
            if (!empty($row['result_data'])) {
                $row['result_data'] = json_decode($row['result_data'], true);
            }
            if (!empty($row['metadata'])) {
                $row['metadata'] = json_decode($row['metadata'], true);
            }
            
            return $row;
        }
        
        return null;
    }
    
    public function getByUserId($userId, $limit = 10, $offset = 0) {
        $stmt = $this->db->prepare("
            SELECT * FROM consultas_cnpj 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        $stmt->bind_param("iii", $userId, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $consultas = [];
        
        while ($row = $result->fetch_assoc()) {
            // Decodificar JSON
            if (!empty($row['result_data'])) {
                $row['result_data'] = json_decode($row['result_data'], true);
            }
            if (!empty($row['metadata'])) {
                $row['metadata'] = json_decode($row['metadata'], true);
            }
            $consultas[] = $row;
        }
        
        return $consultas;
    }
    
    public function getAll($limit = 50, $offset = 0) {
        $stmt = $this->db->prepare("
            SELECT c.*, u.username, u.full_name
            FROM consultas_cnpj c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC 
            LIMIT ? OFFSET ?
        ");
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $consultas = [];
        
        while ($row = $result->fetch_assoc()) {
            // Decodificar JSON
            if (!empty($row['result_data'])) {
                $row['result_data'] = json_decode($row['result_data'], true);
            }
            if (!empty($row['metadata'])) {
                $row['metadata'] = json_decode($row['metadata'], true);
            }
            $consultas[] = $row;
        }
        
        return $consultas;
    }
    
    public function getCount($userId = null) {
        if ($userId) {
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM consultas_cnpj WHERE user_id = ?");
            $stmt->bind_param("i", $userId);
        } else {
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM consultas_cnpj");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return (int)$row['total'];
    }
    
    public function getStats($userId = null) {
        $whereClause = $userId ? "WHERE user_id = ?" : "";
        
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(cost) as total_cost,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
            FROM consultas_cnpj
            $whereClause
        ");
        
        if ($userId) {
            $stmt->bind_param("i", $userId);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
}
