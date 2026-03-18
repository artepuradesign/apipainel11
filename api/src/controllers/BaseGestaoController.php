 <?php
 
 require_once __DIR__ . '/../utils/Response.php';
 require_once __DIR__ . '/../models/BaseGestao.php';
 
 class BaseGestaoController {
     private $db;
     private $model;
     
     public function __construct($db) {
         $this->db = $db;
         $this->model = new BaseGestao($db);
     }
     
     public function getByCpfId() {
         try {
             $cpfId = $_GET['cpf_id'] ?? null;
             if (!$cpfId) {
                 Response::error('CPF ID obrigatorio', 400);
                 return;
             }
             
             $data = $this->model->getByCpfId($cpfId);
             
             // Log para debug
             if (!empty($data)) {
                 error_log("BASE_GESTAO RAW DATA: " . json_encode($data[0]));
             }
             
             $mappedData = array_map(function($item) {
                 // Log valores originais do banco
                 error_log("ORIGINAL_RFB do banco: [" . var_export($item['original_rfb'], true) . "]");
                 error_log("VIVO do banco: [" . var_export($item['vivo'], true) . "]");
                 
                $result = [
                     'id' => (int)$item['id'],
                     'cpf_id' => (int)$item['cpf_id'],
                     'grau_qualidade' => $item['grau_qualidade'] ?? null,
                     'identificador_corporativo' => $item['identificador_corporativo'] ?? null,
                     'original_rfb' => $item['original_rfb'] ?? null,
                     'nomade' => $item['nomade'] ?? null,
                     'situacao' => $item['situacao'] ?? null,
                     'motivo_alteracao_situacao' => $item['motivo_alteracao_situacao'] ?? null,
                     'vip' => $item['vip'] ?? null,
                     'motivo_alteracao_vip' => $item['motivo_alteracao_vip'] ?? null,
                     'protecao_testemunha' => $item['protecao_testemunha'] ?? null,
                     'descricao_protecao_testemunha' => $item['descricao_protecao_testemunha'] ?? null,
                     'motivo_nao_higienizado' => $item['motivo_nao_higienizado'] ?? null,
                     'vivo' => $item['vivo'] ?? null,
                     'created_at' => $item['created_at'],
                     'updated_at' => $item['updated_at']
                 ];
                
                 error_log("RESULT FINAL: " . json_encode($result));
                return $result;
             }, $data);
             
             Response::success($mappedData);
             
         } catch (Exception $e) {
             Response::error('Erro: ' . $e->getMessage(), 500);
         }
     }
     
     public function getById() {
         try {
             $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
             if ($id <= 0) {
                 Response::error('ID invalido', 400);
                 return;
             }
             
             $data = $this->model->getById($id);
             if (!$data) {
                 Response::error('Registro nao encontrado', 404);
                 return;
             }
             
             Response::success($data);
         } catch (Exception $e) {
             Response::error('Erro: ' . $e->getMessage(), 500);
         }
     }
     
     public function create() {
         try {
             $input = json_decode(file_get_contents('php://input'), true);
             if (!$input || !isset($input['cpf_id'])) {
                 Response::error('CPF ID obrigatorio', 400);
                 return;
             }
             
             $id = $this->model->create($input);
             if ($id) {
                 Response::success(['id' => $id], 'Criado', 201);
             } else {
                 Response::error('Erro ao criar', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro: ' . $e->getMessage(), 500);
         }
     }
     
     public function update() {
         try {
             $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
             if ($id <= 0) {
                 Response::error('ID invalido', 400);
                 return;
             }
             
             $input = json_decode(file_get_contents('php://input'), true);
             if (!$input) {
                 Response::error('Dados invalidos', 400);
                 return;
             }
             
             $success = $this->model->update($id, $input);
             if ($success) {
                 Response::success(null, 'Atualizado');
             } else {
                 Response::error('Erro ao atualizar', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro: ' . $e->getMessage(), 500);
         }
     }
     
     public function delete() {
         try {
             $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
             if ($id <= 0) {
                 Response::error('ID invalido', 400);
                 return;
             }
             
             $success = $this->model->delete($id);
             if ($success) {
                 Response::success(null, 'Deletado');
             } else {
                 Response::error('Erro ao deletar', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro: ' . $e->getMessage(), 500);
         }
     }
 }