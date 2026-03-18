
<?php
// src/models/Testimonial.php

class Testimonial {
    private $conn;
    private $table_name = "testimonials";  // Mudança para usar a tabela correta
    
    public $id;
    public $name;      // Mudança de 'nome' para 'name'
    public $message;   // Mudança de 'mensagem' para 'message'
    public $rating;    // Mudança de 'nota' para 'rating'
    public $avatar;
    public $position;  // Mudança de 'cargo' para 'position'
    public $company;   // Mudança de 'empresa' para 'company'
    public $status;
    public $featured;
    public $display_order;
    public $user_id;
    public $approved_by;
    public $approved_at;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY status DESC, featured DESC, display_order ASC, created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    public function readActive() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE status = 'ativo' ORDER BY featured DESC, display_order ASC, created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->name = $row['name'];
            $this->message = $row['message'];
            $this->rating = $row['rating'];
            $this->avatar = $row['avatar'];
            $this->position = $row['position'];
            $this->company = $row['company'];
            $this->status = $row['status'];
            $this->featured = $row['featured'];
            $this->display_order = $row['display_order'];
            $this->user_id = $row['user_id'];
            $this->approved_by = $row['approved_by'];
            $this->approved_at = $row['approved_at'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET name = :name, message = :message, rating = :rating, 
                     avatar = :avatar, position = :position, company = :company, 
                     status = :status, featured = :featured, display_order = :display_order";
                     
        $stmt = $this->conn->prepare($query);
        
        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->company = htmlspecialchars(strip_tags($this->company));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":rating", $this->rating);
        $stmt->bindParam(":avatar", $this->avatar);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":featured", $this->featured);
        $stmt->bindParam(":display_order", $this->display_order);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                 SET name = :name, message = :message, rating = :rating,
                     avatar = :avatar, position = :position, company = :company,
                     status = :status, featured = :featured, display_order = :display_order,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->company = htmlspecialchars(strip_tags($this->company));
        
        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":rating", $this->rating);
        $stmt->bindParam(":avatar", $this->avatar);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":featured", $this->featured);
        $stmt->bindParam(":display_order", $this->display_order);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}
