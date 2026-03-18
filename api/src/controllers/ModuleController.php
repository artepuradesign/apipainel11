<?php
// src/controllers/ModuleController.php

require_once __DIR__ . '/../models/Module.php';
require_once __DIR__ . '/../utils/Response.php';

class ModuleController {
    private $db;
    private $module;
    
    public function __construct($db) {
        $this->db = $db;
        $this->module = new Module($db);
    }
    
    public function getAll() {
        try {
            $query = "SELECT m.*, p.name as panel_name, p.slug as panel_slug 
                     FROM modules m 
                     LEFT JOIN panels p ON m.panel_id = p.id 
                     ORDER BY m.sort_order ASC, m.title ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("MODULE_CONTROLLER GET_ALL: Encontrados " . count($modules) . " módulos");
            
            // Processar dados dos módulos
            foreach ($modules as &$module) {
                $module['id'] = (int)$module['id'];
                $module['panel_id'] = (int)$module['panel_id'];
                $module['price'] = (float)$module['price'];
                $module['cost_price'] = (float)$module['cost_price'];
                $module['is_active'] = (bool)$module['is_active'];
                $module['is_premium'] = (bool)$module['is_premium'];
                $module['sort_order'] = (int)$module['sort_order'];
                $module['usage_count'] = (int)$module['usage_count'];
                $module['success_rate'] = (float)$module['success_rate'];
                
                $module['priceFormatted'] = 'R$ ' . number_format($module['price'], 2, ',', '.');
                $module['name'] = $module['title'];
                
                if ($module['settings']) {
                    $module['settings'] = json_decode($module['settings'], true);
                } else {
                    $module['settings'] = [];
                }
            }
            
            Response::success($modules, 'Módulos carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("MODULE_CONTROLLER GET_ALL ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar módulos: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("===== MODULE_CONTROLLER CREATE START =====");
            
            // Obter input raw
            $inputRaw = file_get_contents('php://input');
            error_log("RAW INPUT: " . $inputRaw);
            
            if (empty($inputRaw)) {
                error_log("ERROR: Input está vazio");
                Response::error('Dados não enviados no corpo da requisição', 400);
                return;
            }
            
            $input = json_decode($inputRaw, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("JSON ERROR: " . json_last_error_msg());
                Response::error('JSON inválido: ' . json_last_error_msg(), 400);
                return;
            }
            
            error_log("PARSED INPUT: " . json_encode($input));
            
            if (!$input) {
                error_log("INPUT é null após decode");
                Response::error('Dados de entrada inválidos', 400);
                return;
            }
            
            // Validações obrigatórias
            $requiredFields = ['title', 'slug', 'panel_id'];
            $missingFields = [];
            
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || empty(trim($input[$field]))) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                $errorMsg = 'Campos obrigatórios ausentes: ' . implode(', ', $missingFields);
                error_log("VALIDATION ERROR: " . $errorMsg);
                Response::error($errorMsg, 400);
                return;
            }
            
            // Verificar se painel existe
            error_log("Verificando se painel {$input['panel_id']} existe");
            $panelQuery = "SELECT id, name FROM panels WHERE id = ?";
            $panelStmt = $this->db->prepare($panelQuery);
            $panelStmt->execute([$input['panel_id']]);
            $panel = $panelStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$panel) {
                error_log("PANEL NOT FOUND: Painel {$input['panel_id']} não encontrado");
                Response::error('Painel não encontrado. Verifique se o ID do painel é válido.', 400);
                return;
            }
            error_log("PANEL OK: Painel {$input['panel_id']} encontrado: " . $panel['name']);
            
            // Verificar se slug já existe
            error_log("Verificando se slug '{$input['slug']}' já existe");
            $checkQuery = "SELECT id FROM modules WHERE slug = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$input['slug']]);
            
            if ($checkStmt->fetch()) {
                error_log("SLUG EXISTS: Slug '{$input['slug']}' já existe");
                Response::error('Slug já existe. Use um slug único.', 400);
                return;
            }
            error_log("SLUG OK: Slug '{$input['slug']}' está disponível");
            
            // Preparar dados para inserção com valores padrão
            $moduleData = [
                'panel_id' => (int)$input['panel_id'],
                'title' => trim($input['title']),
                'slug' => trim($input['slug']),
                'description' => isset($input['description']) ? trim($input['description']) : '',
                'icon' => isset($input['icon']) ? $input['icon'] : 'Package',
                'color' => isset($input['color']) ? $input['color'] : '#6366f1',
                'price' => isset($input['price']) ? (float)$input['price'] : 0.00,
                'cost_price' => isset($input['cost_price']) ? (float)$input['cost_price'] : 0.00,
                'path' => isset($input['path']) ? $input['path'] : '',
                'category' => isset($input['category']) ? $input['category'] : 'general',
                'operational_status' => isset($input['operational_status']) ? $input['operational_status'] : 'on',
                'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                'is_premium' => isset($input['is_premium']) ? (int)$input['is_premium'] : 0,
                'api_endpoint' => isset($input['api_endpoint']) ? $input['api_endpoint'] : '',
                'api_method' => isset($input['api_method']) ? $input['api_method'] : 'POST',
                'sort_order' => isset($input['sort_order']) ? (int)$input['sort_order'] : 0,
                'settings' => isset($input['settings']) ? json_encode($input['settings']) : '{}'
            ];
            
            error_log("FINAL MODULE DATA: " . json_encode($moduleData));
            
            // Query de inserção
            $query = "INSERT INTO modules (
                panel_id, title, slug, description, icon, color, price, cost_price, 
                path, category, operational_status, is_active, is_premium, 
                api_endpoint, api_method, sort_order, settings
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            error_log("QUERY: " . $query);
            
            $stmt = $this->db->prepare($query);
            
            $params = [
                $moduleData['panel_id'],
                $moduleData['title'],
                $moduleData['slug'],
                $moduleData['description'],
                $moduleData['icon'],
                $moduleData['color'],
                $moduleData['price'],
                $moduleData['cost_price'],
                $moduleData['path'],
                $moduleData['category'],
                $moduleData['operational_status'],
                $moduleData['is_active'],
                $moduleData['is_premium'],
                $moduleData['api_endpoint'],
                $moduleData['api_method'],
                $moduleData['sort_order'],
                $moduleData['settings']
            ];
            
            error_log("QUERY PARAMS: " . json_encode($params));
            
            $result = $stmt->execute($params);
            
            if ($result) {
                $newId = $this->db->lastInsertId();
                error_log("SUCCESS: Módulo criado com ID: $newId");
                
                // Buscar o módulo criado para retornar
                $selectQuery = "SELECT m.*, p.name as panel_name FROM modules m LEFT JOIN panels p ON m.panel_id = p.id WHERE m.id = ?";
                $selectStmt = $this->db->prepare($selectQuery);
                $selectStmt->execute([$newId]);
                $createdModule = $selectStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($createdModule) {
                    // Processar dados do módulo criado
                    $createdModule['id'] = (int)$createdModule['id'];
                    $createdModule['panel_id'] = (int)$createdModule['panel_id'];
                    $createdModule['price'] = (float)$createdModule['price'];
                    $createdModule['cost_price'] = (float)$createdModule['cost_price'];
                    $createdModule['is_active'] = (bool)$createdModule['is_active'];
                    $createdModule['is_premium'] = (bool)$createdModule['is_premium'];
                    $createdModule['sort_order'] = (int)$createdModule['sort_order'];
                    $createdModule['usage_count'] = (int)($createdModule['usage_count'] ?? 0);
                    $createdModule['success_rate'] = (float)($createdModule['success_rate'] ?? 100.00);
                    $createdModule['name'] = $createdModule['title'];
                    $createdModule['priceFormatted'] = 'R$ ' . number_format($createdModule['price'], 2, ',', '.');
                    
                    if ($createdModule['settings']) {
                        $createdModule['settings'] = json_decode($createdModule['settings'], true);
                    } else {
                        $createdModule['settings'] = [];
                    }
                }
                
                Response::success($createdModule, 'Módulo criado com sucesso');
            } else {
                error_log("EXECUTE FAILED");
                $errorInfo = $stmt->errorInfo();
                error_log("PDO ERROR INFO: " . json_encode($errorInfo));
                Response::error('Erro ao executar query: ' . $errorInfo[2], 500);
            }
            
        } catch (Exception $e) {
            error_log("EXCEPTION: " . $e->getMessage());
            error_log("EXCEPTION TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $query = "SELECT m.*, p.name as panel_name, p.slug as panel_slug 
                     FROM modules m 
                     LEFT JOIN panels p ON m.panel_id = p.id 
                     WHERE m.id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $module = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$module) {
                Response::error('Módulo não encontrado', 404);
                return;
            }
            
            // Processar dados do módulo
            $module['id'] = (int)$module['id'];
            $module['panel_id'] = (int)$module['panel_id'];
            $module['price'] = (float)$module['price'];
            $module['cost_price'] = (float)$module['cost_price'];
            $module['is_active'] = (bool)$module['is_active'];
            $module['is_premium'] = (bool)$module['is_premium'];
            $module['sort_order'] = (int)$module['sort_order'];
            $module['usage_count'] = (int)$module['usage_count'];
            $module['success_rate'] = (float)$module['success_rate'];
            
            $module['priceFormatted'] = 'R$ ' . number_format($module['price'], 2, ',', '.');
            $module['name'] = $module['title'];
            
            if ($module['settings']) {
                $module['settings'] = json_decode($module['settings'], true);
            } else {
                $module['settings'] = [];
            }
            
            Response::success($module, 'Módulo carregado com sucesso');
            
        } catch (Exception $e) {
            error_log("MODULE_CONTROLLER GET_BY_ID ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar módulo: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByPanel($panelId) {
        try {
            $query = "SELECT m.*, p.name as panel_name, p.slug as panel_slug 
                     FROM modules m 
                     LEFT JOIN panels p ON m.panel_id = p.id 
                     WHERE m.panel_id = ? 
                     ORDER BY m.sort_order ASC, m.title ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$panelId]);
            $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Processar dados dos módulos
            foreach ($modules as &$module) {
                $module['id'] = (int)$module['id'];
                $module['panel_id'] = (int)$module['panel_id'];
                $module['price'] = (float)$module['price'];
                $module['cost_price'] = (float)$module['cost_price'];
                $module['is_active'] = (bool)$module['is_active'];
                $module['is_premium'] = (bool)$module['is_premium'];
                $module['sort_order'] = (int)$module['sort_order'];
                $module['usage_count'] = (int)$module['usage_count'];
                $module['success_rate'] = (float)$module['success_rate'];
                
                $module['priceFormatted'] = 'R$ ' . number_format($module['price'], 2, ',', '.');
                $module['name'] = $module['title'];
                
                if ($module['settings']) {
                    $module['settings'] = json_decode($module['settings'], true);
                } else {
                    $module['settings'] = [];
                }
            }
            
            Response::success($modules, 'Módulos do painel carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("MODULE_CONTROLLER GET_BY_PANEL ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar módulos do painel: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados de entrada inválidos', 400);
                return;
            }
            
            // Verificar se módulo existe
            $checkQuery = "SELECT id FROM modules WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                Response::error('Módulo não encontrado', 404);
                return;
            }
            
            $setParts = [];
            $values = [];
            
            $allowedFields = ['panel_id', 'title', 'slug', 'description', 'icon', 'color', 'price', 'cost_price', 'path', 'category', 'operational_status', 'is_active', 'is_premium', 'api_endpoint', 'api_method', 'sort_order', 'settings'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $setParts[] = "$field = ?";
                    if ($field === 'settings') {
                        $values[] = json_encode($input[$field]);
                    } elseif (in_array($field, ['is_active', 'is_premium', 'panel_id', 'sort_order'])) {
                        $values[] = (int)$input[$field];
                    } elseif (in_array($field, ['price', 'cost_price'])) {
                        $values[] = (float)$input[$field];
                    } else {
                        $values[] = $input[$field];
                    }
                }
            }
            
            if (empty($setParts)) {
                Response::error('Nenhum campo para atualizar', 400);
                return;
            }
            
            $values[] = $id;
            $query = "UPDATE modules SET " . implode(', ', $setParts) . " WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($values);
            
            if ($result) {
                Response::success(['id' => $id], 'Módulo atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar módulo', 500);
            }
            
        } catch (Exception $e) {
            error_log("MODULE_CONTROLLER UPDATE ERROR: " . $e->getMessage());
            Response::error('Erro ao atualizar módulo: ' . $e->getMessage(), 500);
        }
    }
    
    public function toggleStatus($id) {
        try {
            // Buscar status atual
            $query = "SELECT operational_status FROM modules WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $module = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$module) {
                Response::error('Módulo não encontrado', 404);
                return;
            }
            
            // Alternar status
            $newStatus = $module['operational_status'] === 'on' ? 'off' : 'on';
            
            $updateQuery = "UPDATE modules SET operational_status = ? WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $result = $updateStmt->execute([$newStatus, $id]);
            
            if ($result) {
                Response::success([
                    'id' => $id,
                    'operational_status' => $newStatus
                ], 'Status do módulo alterado com sucesso');
            } else {
                Response::error('Erro ao alterar status do módulo', 500);
            }
            
        } catch (Exception $e) {
            error_log("MODULE_CONTROLLER TOGGLE_STATUS ERROR: " . $e->getMessage());
            Response::error('Erro ao alterar status: ' . $e->getMessage(), 500);
        }
    }
    
    public function delete($id) {
        try {
            // Verificar se módulo existe
            $checkQuery = "SELECT id FROM modules WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                Response::error('Módulo não encontrado', 404);
                return;
            }
            
            $query = "DELETE FROM modules WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$id]);
            
            if ($result) {
                Response::success(null, 'Módulo excluído com sucesso');
            } else {
                Response::error('Erro ao excluir módulo', 500);
            }
            
        } catch (Exception $e) {
            error_log("MODULE_CONTROLLER DELETE ERROR: " . $e->getMessage());
            Response::error('Erro ao excluir módulo: ' . $e->getMessage(), 500);
        }
    }
}
?>
