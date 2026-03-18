
<?php
// src/controllers/PanelController.php

require_once __DIR__ . '/../models/Panel.php';
require_once __DIR__ . '/../utils/Response.php';

class PanelController {
    private $db;
    private $panel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->panel = new Panel($db);
    }
    
    public function getAll() {
        try {
            error_log("PANEL_CONTROLLER GET_ALL: Iniciando busca de painéis");
            
            $query = "SELECT p.*, 
                     COUNT(m.id) as modules_count,
                     SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) as active_modules_count
                     FROM panels p 
                     LEFT JOIN modules m ON p.id = m.panel_id 
                     GROUP BY p.id 
                     ORDER BY p.sort_order ASC, p.created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $panels = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("PANEL_CONTROLLER GET_ALL: Encontrados " . count($panels) . " painéis");
            
            // Processar dados dos painéis
            foreach ($panels as &$panel) {
                $panel['id'] = (int)$panel['id'];
                $panel['is_active'] = (bool)$panel['is_active'];
                $panel['is_premium'] = (bool)$panel['is_premium'];
                $panel['sort_order'] = (int)$panel['sort_order'];
                $panel['modules_count'] = (int)$panel['modules_count'];
                $panel['active_modules_count'] = (int)$panel['active_modules_count'];
                
                // Decodificar settings se existir
                if ($panel['settings']) {
                    $panel['settings'] = json_decode($panel['settings'], true);
                } else {
                    $panel['settings'] = [];
                }
            }
            
            Response::success($panels, 'Painéis carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("PANEL_CONTROLLER GET_ALL ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar painéis: ' . $e->getMessage(), 500);
        }
    }
    
    public function getActive() {
        try {
            error_log("PANEL_CONTROLLER GET_ACTIVE: Iniciando busca de painéis ativos");
            
            $query = "SELECT p.*, 
                     COUNT(m.id) as modules_count,
                     SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) as active_modules_count
                     FROM panels p 
                     LEFT JOIN modules m ON p.id = m.panel_id 
                     WHERE p.is_active = 1
                     GROUP BY p.id 
                     ORDER BY p.sort_order ASC, p.created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $panels = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("PANEL_CONTROLLER GET_ACTIVE: Encontrados " . count($panels) . " painéis ativos");
            
            // Processar dados dos painéis
            foreach ($panels as &$panel) {
                $panel['id'] = (int)$panel['id'];
                $panel['is_active'] = (bool)$panel['is_active'];
                $panel['is_premium'] = (bool)$panel['is_premium'];
                $panel['sort_order'] = (int)$panel['sort_order'];
                $panel['modules_count'] = (int)$panel['modules_count'];
                $panel['active_modules_count'] = (int)$panel['active_modules_count'];
                
                if ($panel['settings']) {
                    $panel['settings'] = json_decode($panel['settings'], true);
                } else {
                    $panel['settings'] = [];
                }
            }
            
            Response::success($panels, 'Painéis ativos carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("PANEL_CONTROLLER GET_ACTIVE ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar painéis ativos: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            error_log("PANEL_CONTROLLER GET_BY_ID: Buscando painel ID: $id");
            
            $query = "SELECT p.*, 
                     COUNT(m.id) as modules_count,
                     SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) as active_modules_count
                     FROM panels p 
                     LEFT JOIN modules m ON p.id = m.panel_id 
                     WHERE p.id = ?
                     GROUP BY p.id";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $panel = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$panel) {
                error_log("PANEL_CONTROLLER GET_BY_ID: Painel não encontrado ID: $id");
                Response::error('Painel não encontrado', 404);
                return;
            }
            
            // Processar dados do painel
            $panel['id'] = (int)$panel['id'];
            $panel['is_active'] = (bool)$panel['is_active'];
            $panel['is_premium'] = (bool)$panel['is_premium'];
            $panel['sort_order'] = (int)$panel['sort_order'];
            $panel['modules_count'] = (int)$panel['modules_count'];
            $panel['active_modules_count'] = (int)$panel['active_modules_count'];
            
            if ($panel['settings']) {
                $panel['settings'] = json_decode($panel['settings'], true);
            } else {
                $panel['settings'] = [];
            }
            
            error_log("PANEL_CONTROLLER GET_BY_ID: Painel encontrado: " . $panel['name']);
            Response::success($panel, 'Painel carregado com sucesso');
            
        } catch (Exception $e) {
            error_log("PANEL_CONTROLLER GET_BY_ID ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar painel: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("PANEL_CONTROLLER CREATE: Iniciando criação de painel");
            
            $input = json_decode(file_get_contents('php://input'), true);
            error_log("PANEL_CONTROLLER CREATE INPUT: " . json_encode($input));
            
            if (!$input) {
                Response::error('Dados de entrada inválidos', 400);
                return;
            }
            
            // Validações obrigatórias
            if (!isset($input['name']) || empty(trim($input['name']))) {
                Response::error('Nome do painel é obrigatório', 400);
                return;
            }
            
            if (!isset($input['slug']) || empty(trim($input['slug']))) {
                Response::error('Slug do painel é obrigatório', 400);
                return;
            }
            
            // Verificar se slug já existe
            $checkQuery = "SELECT id FROM panels WHERE slug = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$input['slug']]);
            
            if ($checkStmt->fetch()) {
                Response::error('Slug já existe. Use um slug único.', 400);
                return;
            }
            
            // Preparar dados para inserção
            $panelData = [
                'name' => trim($input['name']),
                'slug' => trim($input['slug']),
                'description' => isset($input['description']) ? trim($input['description']) : null,
                'icon' => isset($input['icon']) ? $input['icon'] : 'Package',
                'color' => isset($input['color']) ? $input['color'] : '#6366f1',
                'background_color' => isset($input['background_color']) ? $input['background_color'] : '#f8fafc',
                'category' => isset($input['category']) ? $input['category'] : 'general',
                'template' => isset($input['template']) ? $input['template'] : 'modern',
                'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                'is_premium' => isset($input['is_premium']) ? (int)$input['is_premium'] : 0,
                'sort_order' => isset($input['sort_order']) ? (int)$input['sort_order'] : 0,
                'settings' => isset($input['settings']) ? json_encode($input['settings']) : null
            ];
            
            // Query de inserção
            $query = "INSERT INTO panels (
                name, slug, description, icon, color, background_color, 
                category, template, is_active, is_premium, sort_order, settings
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $panelData['name'],
                $panelData['slug'],
                $panelData['description'],
                $panelData['icon'],
                $panelData['color'],
                $panelData['background_color'],
                $panelData['category'],
                $panelData['template'],
                $panelData['is_active'],
                $panelData['is_premium'],
                $panelData['sort_order'],
                $panelData['settings']
            ]);
            
            if ($result) {
                $newId = $this->db->lastInsertId();
                error_log("PANEL_CONTROLLER CREATE SUCCESS: Painel criado com ID: $newId");
                
                // Buscar o painel criado
                $selectQuery = "SELECT * FROM panels WHERE id = ?";
                $selectStmt = $this->db->prepare($selectQuery);
                $selectStmt->execute([$newId]);
                $createdPanel = $selectStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($createdPanel) {
                    $createdPanel['id'] = (int)$createdPanel['id'];
                    $createdPanel['is_active'] = (bool)$createdPanel['is_active'];
                    $createdPanel['is_premium'] = (bool)$createdPanel['is_premium'];
                    $createdPanel['sort_order'] = (int)$createdPanel['sort_order'];
                    
                    if ($createdPanel['settings']) {
                        $createdPanel['settings'] = json_decode($createdPanel['settings'], true);
                    } else {
                        $createdPanel['settings'] = [];
                    }
                }
                
                Response::success($createdPanel, 'Painel criado com sucesso');
            } else {
                error_log("PANEL_CONTROLLER CREATE FAILED");
                Response::error('Erro ao criar painel', 500);
            }
            
        } catch (Exception $e) {
            error_log("PANEL_CONTROLLER CREATE ERROR: " . $e->getMessage());
            Response::error('Erro interno: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id) {
        try {
            error_log("PANEL_CONTROLLER UPDATE: Atualizando painel ID: $id");
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados de entrada inválidos', 400);
                return;
            }
            
            // Verificar se painel existe
            $checkQuery = "SELECT id FROM panels WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                Response::error('Painel não encontrado', 404);
                return;
            }
            
            $setParts = [];
            $values = [];
            
            $allowedFields = ['name', 'slug', 'description', 'icon', 'color', 'background_color', 'category', 'template', 'is_active', 'is_premium', 'sort_order', 'settings'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $setParts[] = "$field = ?";
                    if ($field === 'settings') {
                        $values[] = json_encode($input[$field]);
                    } elseif (in_array($field, ['is_active', 'is_premium', 'sort_order'])) {
                        $values[] = (int)$input[$field];
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
            $query = "UPDATE panels SET " . implode(', ', $setParts) . " WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($values);
            
            if ($result) {
                error_log("PANEL_CONTROLLER UPDATE SUCCESS: Painel atualizado ID: $id");
                Response::success(['id' => $id], 'Painel atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar painel', 500);
            }
            
        } catch (Exception $e) {
            error_log("PANEL_CONTROLLER UPDATE ERROR: " . $e->getMessage());
            Response::error('Erro ao atualizar painel: ' . $e->getMessage(), 500);
        }
    }
    
    public function delete($id) {
        try {
            error_log("PANEL_CONTROLLER DELETE: Excluindo painel ID: $id");
            
            // Verificar se painel existe
            $checkQuery = "SELECT id FROM panels WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                Response::error('Painel não encontrado', 404);
                return;
            }
            
            // Verificar se há módulos vinculados
            $moduleQuery = "SELECT COUNT(*) as count FROM modules WHERE panel_id = ?";
            $moduleStmt = $this->db->prepare($moduleQuery);
            $moduleStmt->execute([$id]);
            $moduleCount = $moduleStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            if ($moduleCount > 0) {
                Response::error('Não é possível excluir o painel. Existem módulos vinculados a ele.', 400);
                return;
            }
            
            $query = "DELETE FROM panels WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$id]);
            
            if ($result) {
                error_log("PANEL_CONTROLLER DELETE SUCCESS: Painel excluído ID: $id");
                Response::success(null, 'Painel excluído com sucesso');
            } else {
                Response::error('Erro ao excluir painel', 500);
            }
            
        } catch (Exception $e) {
            error_log("PANEL_CONTROLLER DELETE ERROR: " . $e->getMessage());
            Response::error('Erro ao excluir painel: ' . $e->getMessage(), 500);
        }
    }
}
?>
