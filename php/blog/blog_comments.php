<?php
/**
 * Blog Comments CRUD
 * Endpoints:
 *   GET    /blog/comments/:post_id    - Listar comentários de um post
 *   POST   /blog/comments             - Criar comentário
 *   PUT    /blog/comments/:id         - Atualizar status do comentário
 *   DELETE /blog/comments/:id         - Excluir comentário
 */

require_once __DIR__ . '/../conexao.php';

function handleBlogComments($method, $id = null) {
    global $pdo;

    switch ($method) {
        case 'GET':
            if (!$id) return jsonResponse(400, ['error' => 'post_id é obrigatório']);
            return getCommentsByPost($pdo, $id);

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            return createComment($pdo, $data);

        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID é obrigatório']);
            $data = json_decode(file_get_contents('php://input'), true);
            return updateComment($pdo, $id, $data);

        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID é obrigatório']);
            return deleteComment($pdo, $id);

        default:
            return jsonResponse(405, ['error' => 'Método não permitido']);
    }
}

function getCommentsByPost($pdo, $postId) {
    $stmt = $pdo->prepare("
        SELECT * FROM blog_comments 
        WHERE post_id = ? AND status = 'approved'
        ORDER BY created_at ASC
    ");
    $stmt->execute([$postId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return jsonResponse(200, [
        'success' => true,
        'data' => $comments,
        'message' => 'Comentários carregados'
    ]);
}

function createComment($pdo, $data) {
    if (empty($data['post_id']) || empty($data['content'])) {
        return jsonResponse(400, ['success' => false, 'error' => 'post_id e content são obrigatórios']);
    }

    $stmt = $pdo->prepare('
        INSERT INTO blog_comments (post_id, user_id, author_name, author_email, content, parent_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $data['post_id'],
        $data['user_id'] ?? null,
        $data['author_name'] ?? null,
        $data['author_email'] ?? null,
        $data['content'],
        $data['parent_id'] ?? null
    ]);

    $id = $pdo->lastInsertId();
    $stmt2 = $pdo->prepare('SELECT * FROM blog_comments WHERE id = ?');
    $stmt2->execute([$id]);

    return jsonResponse(201, [
        'success' => true,
        'data' => $stmt2->fetch(PDO::FETCH_ASSOC),
        'message' => 'Comentário enviado para moderação'
    ]);
}

function updateComment($pdo, $id, $data) {
    $fields = [];
    $values = [];

    foreach (['status', 'content'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }

    if (empty($fields)) {
        return jsonResponse(400, ['success' => false, 'error' => 'Nenhum campo para atualizar']);
    }

    $values[] = $id;
    $stmt = $pdo->prepare('UPDATE blog_comments SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($values);

    $stmt2 = $pdo->prepare('SELECT * FROM blog_comments WHERE id = ?');
    $stmt2->execute([$id]);

    return jsonResponse(200, ['success' => true, 'data' => $stmt2->fetch(PDO::FETCH_ASSOC)]);
}

function deleteComment($pdo, $id) {
    $stmt = $pdo->prepare('DELETE FROM blog_comments WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        return jsonResponse(404, ['success' => false, 'error' => 'Comentário não encontrado']);
    }

    return jsonResponse(200, ['success' => true, 'message' => 'Comentário excluído']);
}

function jsonResponse($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
