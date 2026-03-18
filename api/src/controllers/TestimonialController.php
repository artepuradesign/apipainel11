
<?php
// src/controllers/TestimonialController.php

require_once __DIR__ . '/../models/Testimonial.php';
require_once __DIR__ . '/../utils/Response.php';

class TestimonialController {
    private $db;
    private $testimonial;
    
    public function __construct($db) {
        $this->db = $db;
        $this->testimonial = new Testimonial($db);
    }
    
    public function getActive() {
        try {
            $stmt = $this->testimonial->readActive();
            $testimonials = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $testimonials[] = [
                    'id' => (int)$row['id'],
                    'name' => $row['name'],
                    'message' => $row['message'],
                    'rating' => (int)$row['rating'],
                    'avatar' => $row['avatar'],
                    'position' => $row['position'],
                    'company' => $row['company'],
                    'status' => $row['status'],
                    'featured' => (bool)$row['featured'],
                    'display_order' => (int)$row['display_order'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
            
            Response::success($testimonials);
        } catch (Exception $e) {
            Response::error('Erro ao buscar depoimentos ativos: ' . $e->getMessage(), 500);
        }
    }
    
    public function getAll() {
        try {
            $stmt = $this->testimonial->read();
            $testimonials = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $testimonials[] = [
                    'id' => (int)$row['id'],
                    'name' => $row['name'],
                    'message' => $row['message'],
                    'rating' => (int)$row['rating'],
                    'avatar' => $row['avatar'],
                    'position' => $row['position'],
                    'company' => $row['company'],
                    'status' => $row['status'],
                    'featured' => (bool)$row['featured'],
                    'display_order' => (int)$row['display_order'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
            
            Response::success($testimonials);
        } catch (Exception $e) {
            Response::error('Erro ao buscar depoimentos: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $this->testimonial->id = $id;
            if ($this->testimonial->readOne()) {
                $testimonialData = [
                    'id' => (int)$this->testimonial->id,
                    'name' => $this->testimonial->name,
                    'message' => $this->testimonial->message,
                    'rating' => (int)$this->testimonial->rating,
                    'avatar' => $this->testimonial->avatar,
                    'position' => $this->testimonial->position,
                    'company' => $this->testimonial->company,
                    'status' => $this->testimonial->status,
                    'featured' => (bool)$this->testimonial->featured,
                    'display_order' => (int)$this->testimonial->display_order,
                    'created_at' => $this->testimonial->created_at,
                    'updated_at' => $this->testimonial->updated_at
                ];
                
                Response::success($testimonialData);
            } else {
                Response::error('Depoimento não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro ao buscar depoimento: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['name', 'message'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        try {
            $this->testimonial->name = $data['name'];
            $this->testimonial->message = $data['message'];
            $this->testimonial->rating = $data['rating'] ?? 5;
            $this->testimonial->avatar = $data['avatar'] ?? null;
            $this->testimonial->position = $data['position'] ?? null;
            $this->testimonial->company = $data['company'] ?? null;
            $this->testimonial->status = $data['status'] ?? 'pendente';
            $this->testimonial->featured = isset($data['featured']) ? (int)$data['featured'] : 0;
            $this->testimonial->display_order = $data['display_order'] ?? 0;
            
            if ($this->testimonial->create()) {
                Response::success(null, 'Depoimento criado com sucesso', 201);
            } else {
                Response::error('Erro ao criar depoimento', 400);
            }
        } catch (Exception $e) {
            error_log('Erro ao criar depoimento: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            Response::error('Erro ao criar depoimento: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $this->testimonial->id = $id;
            if ($this->testimonial->readOne()) {
                if (isset($data['name'])) $this->testimonial->name = $data['name'];
                if (isset($data['message'])) $this->testimonial->message = $data['message'];
                if (isset($data['rating'])) $this->testimonial->rating = $data['rating'];
                if (isset($data['avatar'])) $this->testimonial->avatar = $data['avatar'];
                if (isset($data['position'])) $this->testimonial->position = $data['position'];
                if (isset($data['company'])) $this->testimonial->company = $data['company'];
                if (isset($data['status'])) $this->testimonial->status = $data['status'];
                if (isset($data['featured'])) $this->testimonial->featured = $data['featured'];
                if (isset($data['display_order'])) $this->testimonial->display_order = $data['display_order'];
                
                if ($this->testimonial->update()) {
                    Response::success(null, 'Depoimento atualizado com sucesso');
                } else {
                    Response::error('Erro ao atualizar depoimento', 400);
                }
            } else {
                Response::error('Depoimento não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function delete($id) {
        try {
            $this->testimonial->id = $id;
            if ($this->testimonial->delete()) {
                Response::success(null, 'Depoimento deletado com sucesso');
            } else {
                Response::error('Erro ao deletar depoimento', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
}
