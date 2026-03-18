 <?php
 // src/models/BaseGestao.php
 
 require_once __DIR__ . '/BaseModel.php';
 
 class BaseGestao extends BaseModel {
     protected $table = 'base_gestao';
 
     public function __construct($db) {
         parent::__construct($db);
     }
 
     /**
      * Buscar registros por CPF ID
      */
     public function getByCpfId($cpfId) {
         $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY id DESC";
         $stmt = $this->db->prepare($query);
         $stmt->execute([$cpfId]);
         return $stmt->fetchAll(PDO::FETCH_ASSOC);
     }
 }