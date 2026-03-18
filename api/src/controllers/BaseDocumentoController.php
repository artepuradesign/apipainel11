 <?php
 // src/controllers/BaseDocumentoController.php
 
 require_once __DIR__ . '/../models/BaseDocumento.php';
 require_once __DIR__ . '/../utils/Response.php';
 
 class BaseDocumentoController {
     private $db;
     private $model;
 
     public function __construct($db) {
         $this->db = $db;
         $this->model = new BaseDocumento($db);
     }
 
     public function getByCpfId() {
         try {
             $cpfId = $_GET['cpf_id'] ?? null;
 
             if (!$cpfId) {
                 Response::error('CPF ID é obrigatório', 400);
                 return;
             }
 
             $data = $this->model->getByCpfId($cpfId);
 
             // Pode retornar null (sem registro) ou o objeto do documento
             Response::success($data, 'Documento carregado com sucesso');
         } catch (Exception $e) {
             Response::error('Erro ao carregar documento: ' . $e->getMessage(), 500);
         }
     }
 
     public function create() {
         try {
             $input = json_decode(file_get_contents('php://input'), true);
             
             if (!isset($input['cpf_id'])) {
                 Response::error('CPF ID é obrigatório', 400);
                 return;
             }
 
             $success = $this->model->create($input);
 
             if ($success) {
                 Response::success(['id' => $this->db->lastInsertId()], 'Documento criado com sucesso');
             } else {
                 Response::error('Erro ao criar documento', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro ao criar documento: ' . $e->getMessage(), 500);
         }
     }
 
     public function update($id) {
         try {
             $input = json_decode(file_get_contents('php://input'), true);
             
             $success = $this->model->update($id, $input);
 
             if ($success) {
                 Response::success(null, 'Documento atualizado com sucesso');
             } else {
                 Response::error('Erro ao atualizar documento', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro ao atualizar documento: ' . $e->getMessage(), 500);
         }
     }
 
     public function delete($id) {
         try {
             $success = $this->model->delete($id);
 
             if ($success) {
                 Response::success(null, 'Documento deletado com sucesso');
             } else {
                 Response::error('Erro ao deletar documento', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro ao deletar documento: ' . $e->getMessage(), 500);
         }
     }
 
     public function deleteByCpfId($cpfId) {
         try {
             $success = $this->model->deleteByCpfId($cpfId);
 
             if ($success) {
                 Response::success(null, 'Documentos do CPF deletados com sucesso');
             } else {
                 Response::error('Erro ao deletar documentos', 500);
             }
         } catch (Exception $e) {
             Response::error('Erro ao deletar documentos: ' . $e->getMessage(), 500);
         }
     }
 }