<?php
/**
 * Blog Posts CRUD
 * Endpoints:
 *   GET    /blog/posts              - Listar posts (com filtros)
 *   GET    /blog/posts/published    - Posts publicados (público)
 *   GET    /blog/posts/:id          - Buscar post por ID
 *   GET    /blog/posts/slug/:slug   - Buscar post por slug (público)
 *   POST   /blog/posts              - Criar post
 *   PUT    /blog/posts/:id          - Atualizar post
 *   DELETE /blog/posts/:id          - Excluir post
 */

require_once __DIR__ . '/../conexao.php';

function handleBlogPosts($method, $id = null, $action = null) {
    global $pdo;

    switch ($method) {
        case 'GET':
            if ($action === 'published') {
                return getPublishedPosts($pdo);
            }
            if ($action === 'slug' && $id) {
                return getPostBySlug($pdo, $id);
            }
            if ($id) {
                return getPostById($pdo, $id);
            }
            return getAllPosts($pdo);

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            return createPost($pdo, $data);

        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID é obrigatório']);
            $data = json_decode(file_get_contents('php://input'), true);
            return updatePost($pdo, $id, $data);

        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID é obrigatório']);
            return deletePost($pdo, $id);

        default:
            return jsonResponse(405, ['error' => 'Método não permitido']);
    }
}

function getAllPosts($pdo) {
    $stmt = $pdo->query('
        SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
    ');
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($posts as &$post) {
        if ($post['tags']) $post['tags'] = json_decode($post['tags'], true);
    }

    return jsonResponse(200, [
        'success' => true,
        'data' => $posts,
        'message' => 'Posts carregados com sucesso'
    ]);
}

function getPublishedPosts($pdo) {
    $stmt = $pdo->query("
        SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        WHERE p.status = 'published'
        ORDER BY p.is_featured DESC, p.published_at DESC
    ");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($posts as &$post) {
        if ($post['tags']) $post['tags'] = json_decode($post['tags'], true);
    }

    return jsonResponse(200, [
        'success' => true,
        'data' => $posts,
        'message' => 'Posts publicados carregados'
    ]);
}

function getPostById($pdo, $id) {
    $stmt = $pdo->prepare('
        SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        WHERE p.id = ?
    ');
    $stmt->execute([$id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        return jsonResponse(404, ['success' => false, 'error' => 'Post não encontrado']);
    }

    if ($post['tags']) $post['tags'] = json_decode($post['tags'], true);

    return jsonResponse(200, ['success' => true, 'data' => $post]);
}

function getPostBySlug($pdo, $slug) {
    $stmt = $pdo->prepare("
        SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        WHERE p.slug = ? AND p.status = 'published'
    ");
    $stmt->execute([$slug]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        return jsonResponse(404, ['success' => false, 'error' => 'Post não encontrado']);
    }

    // Incrementar views
    $pdo->prepare('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?')->execute([$post['id']]);

    if ($post['tags']) $post['tags'] = json_decode($post['tags'], true);

    return jsonResponse(200, ['success' => true, 'data' => $post]);
}

function createPost($pdo, $data) {
    if (empty($data['title']) || empty($data['content'])) {
        return jsonResponse(400, ['success' => false, 'error' => 'Título e conteúdo são obrigatórios']);
    }

    $slug = $data['slug'] ?? slugify($data['title']);
    $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
    $publishedAt = ($data['status'] ?? 'draft') === 'published' ? date('Y-m-d H:i:s') : null;

    $stmt = $pdo->prepare('
        INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, category_id, author_id, author_name, status, is_featured, meta_title, meta_description, tags, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $data['title'],
        $slug,
        $data['excerpt'] ?? null,
        $data['content'],
        $data['cover_image'] ?? null,
        $data['category_id'] ?? null,
        $data['author_id'] ?? null,
        $data['author_name'] ?? null,
        $data['status'] ?? 'draft',
        $data['is_featured'] ?? 0,
        $data['meta_title'] ?? null,
        $data['meta_description'] ?? null,
        $tags,
        $publishedAt
    ]);

    $id = $pdo->lastInsertId();
    return getPostById($pdo, $id);
}

function updatePost($pdo, $id, $data) {
    // Verificar se post existe
    $check = $pdo->prepare('SELECT id, status FROM blog_posts WHERE id = ?');
    $check->execute([$id]);
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        return jsonResponse(404, ['success' => false, 'error' => 'Post não encontrado']);
    }

    $fields = [];
    $values = [];

    $allowedFields = ['title', 'slug', 'excerpt', 'content', 'cover_image', 'category_id', 'author_id', 'author_name', 'status', 'is_featured', 'meta_title', 'meta_description'];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }

    if (isset($data['tags'])) {
        $fields[] = 'tags = ?';
        $values[] = json_encode($data['tags']);
    }

    // Se mudou para published e não tinha published_at
    if (isset($data['status']) && $data['status'] === 'published' && $existing['status'] !== 'published') {
        $fields[] = 'published_at = ?';
        $values[] = date('Y-m-d H:i:s');
    }

    if (empty($fields)) {
        return jsonResponse(400, ['success' => false, 'error' => 'Nenhum campo para atualizar']);
    }

    $values[] = $id;
    $stmt = $pdo->prepare('UPDATE blog_posts SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($values);

    return getPostById($pdo, $id);
}

function deletePost($pdo, $id) {
    $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        return jsonResponse(404, ['success' => false, 'error' => 'Post não encontrado']);
    }

    return jsonResponse(200, ['success' => true, 'message' => 'Post excluído com sucesso']);
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
