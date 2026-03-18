 <?php
 // routes/base-documento.php
 
 // Carregar configurações centralizadas
 require_once __DIR__ . '/../config/conexao.php';
 require_once __DIR__ . '/../src/controllers/BaseDocumentoController.php';
 require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
 require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
 
 // CORS
 $corsMiddleware = new CorsMiddleware();
 $corsMiddleware->handle();
 
 // Capturar método e caminho
 $method = $_SERVER['REQUEST_METHOD'];
 $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
 
 // Remover prefixo da API
 $path = preg_replace('#^/api#', '', $path);
 $path = preg_replace('#^/base-documento#', '', $path);
 
 // Usar conexão única do pool
 try {
     $db = getDBConnection();
 } catch (Exception $e) {
     error_log("BASE_DOCUMENTO: Erro de conexão: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(['success' => false, 'error' => 'Erro de conexão com banco de dados']);
     exit;
 }
 
 // Autenticação
 $authMiddleware = new AuthMiddleware($db);
 if (!$authMiddleware->authenticate()) {
     exit;
 }
 
 $controller = new BaseDocumentoController($db);
 
 // Roteamento
 if ($method === 'GET' && preg_match('#^/cpf/(\d+)$#', $path, $matches)) {
     // GET /base-documento/cpf/{cpf_id}
     $_GET['cpf_id'] = $matches[1];
     $controller->getByCpfId();
 } elseif ($method === 'POST' && $path === '') {
     // POST /base-documento
     $controller->create();
 } elseif ($method === 'PUT' && preg_match('#^/(\d+)$#', $path, $matches)) {
     // PUT /base-documento/{id}
     $controller->update($matches[1]);
 } elseif ($method === 'DELETE' && preg_match('#^/(\d+)$#', $path, $matches)) {
     // DELETE /base-documento/{id}
     $controller->delete($matches[1]);
 } elseif ($method === 'DELETE' && preg_match('#^/cpf/(\d+)$#', $path, $matches)) {
     // DELETE /base-documento/cpf/{cpf_id}
     $controller->deleteByCpfId($matches[1]);
 } else {
     http_response_code(404);
     echo json_encode(['success' => false, 'error' => 'Endpoint não encontrado']);
 }