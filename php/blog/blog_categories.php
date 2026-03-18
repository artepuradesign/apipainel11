<?php
/**
 * Blog Categories CRUD
 * Endpoints:
 *   GET    /blog/categories         - Listar todas categorias
 *   GET    /blog/categories/:id     - Buscar categoria por ID
 *   POST   /blog/categories         - Criar categoria
 *   PUT    /blog/categories/:id     - Atualizar categoria
 *   DELETE /blog/categories/:id     - Excluir categoria
 */

require_once __DIR__ . '/../conexao.php';

function handleBlogCategories($method, $id = null) {
    global $pdo;

    switch ($method) {
        case 'GET':
            if ($id) {
                return getCategoryById($pdo, $id);
            }
            return getAllCategories($pdo);

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            return createCategory($pdo, $data);

        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID é obrigatório']);
            $data = json_decode(file_get_contents('php://input'), true);
            return updateCategory($pdo, $id, $data);

        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID é obrigatório']);
            return deleteCategory($pdo, $id);

        default:
            return jsonResponse(405, ['error' => 'Método não permitido']);
    }
}

function getAllCategories($pdo) {
    $stmt = $pdo->query('SELECT * FROM blog_categories ORDER BY sort_order ASC, name ASC');
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return jsonResponse(200, [
        'success' => true,
        'data' => $categories,
        'message' => 'Categorias carregadas com sucesso'
    ]);
}

function getCategoryById($pdo, $id) {
    $stmt = $pdo->prepare('SELECT * FROM blog_categories WHERE id = ?');
    $stmt->execute([$id]);
    $category = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$category) {
        return jsonResponse(404, ['success' => false, 'error' => 'Categoria não encontrada']);
    }

    return jsonResponse(200, ['success' => true, 'data' => $category]);
}

function createCategory($pdo, $data) {
    if (empty($data['name'])) {
        return jsonResponse(400, ['success' => false, 'error' => 'Nome é obrigatório']);
    }

    $slug = $data['slug'] ?? slugify($data['name']);

    $stmt = $pdo->prepare('INSERT INTO blog_categories (name, slug, description, color, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $data['name'],
        $slug,
        $data['description'] ?? null,
        $data['color'] ?? '#6366f1',
        $data['is_active'] ?? 1,
        $data['sort_order'] ?? 0
    ]);

    $id = $pdo->lastInsertId();
    return getCategoryById($pdo, $id);
}

function updateCategory($pdo, $id, $data) {
    $fields = [];
    $values = [];

    foreach (['name', 'slug', 'description', 'color', 'is_active', 'sort_order'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }

    if (empty($fields)) {
        return jsonResponse(400, ['success' => false, 'error' => 'Nenhum campo para atualizar']);
    }

    $values[] = $id;
    $stmt = $pdo->prepare('UPDATE blog_categories SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($values);

    return getCategoryById($pdo, $id);
}

function deleteCategory($pdo, $id) {
    $stmt = $pdo->prepare('DELETE FROM blog_categories WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        return jsonResponse(404, ['success' => false, 'error' => 'Categoria não encontrada']);
    }

    return jsonResponse(200, ['success' => true, 'message' => 'Categoria excluída com sucesso']);
}

function slugify($text) {
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
    $text = preg_replace('/[^a-zA-Z0-9\s-]/', '', $text);
    $text = strtolower(trim($text));
    $text = preg_replace('/[\s-]+/', '-', $text);
    return $text;
}

function jsonResponse($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
