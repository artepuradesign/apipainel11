 <?php
 // src/models/BaseDocumento.php
 
 class BaseDocumento {
     private $db;
     private $table = 'base_documento';
 
     public function __construct($db) {
         $this->db = $db;
     }
 
     public function getByCpfId($cpfId) {
         $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? LIMIT 1";
         $stmt = $this->db->prepare($query);
         $stmt->execute([$cpfId]);
 
         $row = $stmt->fetch(PDO::FETCH_ASSOC);
         return $row ?: null;
     }
 
     public function create($data) {
         $query = "INSERT INTO {$this->table} (cpf_id, numero_identificador, data_expedicao, orgao_emissor, sigla_uf) 
                   VALUES (?, ?, ?, ?, ?)";
         $stmt = $this->db->prepare($query);
         return $stmt->execute([
             $data['cpf_id'],
             $data['numero_identificador'] ?? null,
             $data['data_expedicao'] ?? null,
             $data['orgao_emissor'] ?? null,
             $data['sigla_uf'] ?? null
         ]);
     }
 
     public function update($id, $data) {
         $query = "UPDATE {$this->table} SET 
                   numero_identificador = ?, 
                   data_expedicao = ?, 
                   orgao_emissor = ?, 
                   sigla_uf = ?, 
                   updated_at = NOW() 
                   WHERE id = ?";
         $stmt = $this->db->prepare($query);
         return $stmt->execute([
             $data['numero_identificador'] ?? null,
             $data['data_expedicao'] ?? null,
             $data['orgao_emissor'] ?? null,
             $data['sigla_uf'] ?? null,
             $id
         ]);
     }
 
     public function delete($id) {
         $query = "DELETE FROM {$this->table} WHERE id = ?";
         $stmt = $this->db->prepare($query);
         return $stmt->execute([$id]);
     }
 
     public function deleteByCpfId($cpfId) {
         $query = "DELETE FROM {$this->table} WHERE cpf_id = ?";
         $stmt = $this->db->prepare($query);
         return $stmt->execute([$cpfId]);
     }
 }