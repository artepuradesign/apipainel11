<?php
// src/models/Consultations.php

class Consultations {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        try {
            $query = "INSERT INTO consultations (
                user_id, module_type, document, cost, result_data, status, 
                ip_address, user_agent, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = $this->db->prepare($query);
            
            // Garantir que o saldo_usado está no metadata para recuperação posterior
            $metadata = isset($data['metadata']) ? $data['metadata'] : [];
            if (isset($data['saldo_usado'])) {
                $metadata['saldo_usado'] = $data['saldo_usado'];
                error_log("CONSULTATIONS_MODEL: Salvando saldo_usado no metadata: " . $data['saldo_usado']);
            }
            
            $values = [
                $data['user_id'],
                $data['module_type'] ?? 'cpf',
                $data['document'],
                $data['cost'] ?? 0,
                isset($data['result_data']) ? json_encode($data['result_data']) : null,
                $data['status'] ?? 'processing',
                $data['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
                $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? null,
                !empty($metadata) ? json_encode($metadata) : null
            ];
            
            $stmt->execute($values);
            return $this->db->lastInsertId();
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_MODEL CREATE ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getByUserId($userId, $limit = 50, $offset = 0) {
        try {
            $query = "SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            
            $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON fields
            foreach ($consultations as &$consultation) {
                if (isset($consultation['result_data'])) {
                    $consultation['result_data'] = json_decode($consultation['result_data'], true);
                }
                if (isset($consultation['metadata'])) {
                    $consultation['metadata'] = json_decode($consultation['metadata'], true);
                }
            }
            
            return $consultations;
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_MODEL GET_BY_USER ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getById($id) {
        try {
            $query = "SELECT * FROM consultations WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            
            $consultation = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($consultation) {
                // Decode JSON fields
                if (isset($consultation['result_data'])) {
                    $consultation['result_data'] = json_decode($consultation['result_data'], true);
                }
                if (isset($consultation['metadata'])) {
                    $consultation['metadata'] = json_decode($consultation['metadata'], true);
                }
            }
            
            return $consultation;
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_MODEL GET_BY_ID ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function update($id, $data) {
        try {
            $fields = [];
            $values = [];
            
            foreach ($data as $key => $value) {
                if ($key === 'id') continue;
                
                $fields[] = "$key = ?";
                
                // Handle JSON fields
                if (in_array($key, ['result_data', 'metadata'])) {
                    $values[] = is_array($value) || is_object($value) ? json_encode($value) : $value;
                } else {
                    $values[] = $value;
                }
            }
            
            $values[] = $id;
            
            $query = "UPDATE consultations SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            return $stmt->execute($values);
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_MODEL UPDATE ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getCount($userId = null) {
        try {
            if ($userId) {
                $query = "SELECT COUNT(*) as total FROM consultations WHERE user_id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$userId]);
            } else {
                $query = "SELECT COUNT(*) as total FROM consultations";
                $stmt = $this->db->prepare($query);
                $stmt->execute();
            }
            
            return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_MODEL GET_COUNT ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getUserStats($userId) {
        try {
            $query = "SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                        SUM(CASE WHEN status = 'naoencontrado' THEN 1 ELSE 0 END) as naoencontrado,
                        SUM(cost) as total_cost,
                        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today,
                        COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as this_month
                      FROM consultations 
                      WHERE user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_MODEL GET_USER_STATS ERROR: " . $e->getMessage());
            throw $e;
        }
    }
}