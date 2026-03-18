<?php
/**
 * Blog Routes
 * Adicione este require no index.php principal e registre as rotas
 * 
 * Rotas públicas (sem autenticação):
 *   GET /blog/posts/published
 *   GET /blog/posts/slug/:slug
 *   GET /blog/categories
 *   GET /blog/comments/:post_id
 * 
 * Rotas administrativas (com autenticação):
 *   GET/POST         /blog/posts
 *   GET/PUT/DELETE   /blog/posts/:id
 *   POST             /blog/categories
 *   PUT/DELETE       /blog/categories/:id
 *   POST/PUT/DELETE  /blog/comments[/:id]
 */

require_once __DIR__ . '/blog_posts.php';
require_once __DIR__ . '/blog_categories.php';
require_once __DIR__ . '/blog_comments.php';

/**
 * Processar rotas do blog
 * @param string $method HTTP method
 * @param array $pathSegments Array de segmentos da URL (ex: ['blog', 'posts', '1'])
 * @return bool true se a rota foi processada
 */
function handleBlogRoutes($method, $pathSegments) {
    // Verificar se é uma rota do blog
    if (empty($pathSegments[0]) || $pathSegments[0] !== 'blog') {
        return false;
    }

    $resource = $pathSegments[1] ?? '';
    $idOrAction = $pathSegments[2] ?? null;
    $extraParam = $pathSegments[3] ?? null;

    // Rotas públicas (sem autenticação necessária)
    $publicRoutes = [
        'GET:posts:published',
        'GET:posts:slug',
        'GET:categories:',
        'GET:comments:',
    ];

    $routeKey = "$method:$resource:" . ($idOrAction ?? '');
    $isPublic = false;

    foreach ($publicRoutes as $pub) {
        $parts = explode(':', $pub);
        if ($parts[0] === $method && $parts[1] === $resource) {
            if (empty($parts[2]) || $parts[2] === $idOrAction) {
                $isPublic = true;
                break;
            }
        }
    }

    // Se não é rota pública, verificar autenticação
    if (!$isPublic) {
        // Verificar bearer token (adaptar conforme seu sistema de auth)
        $token = getBearerToken();
        if (!$token) {
            jsonResponse(401, ['success' => false, 'error' => 'Token de autorização não fornecido']);
            return true;
        }
        // Aqui você pode validar o token e verificar se é admin
    }

    switch ($resource) {
        case 'posts':
            if ($idOrAction === 'published') {
                handleBlogPosts('GET', null, 'published');
            } elseif ($idOrAction === 'slug' && $extraParam) {
                handleBlogPosts('GET', $extraParam, 'slug');
            } else {
                handleBlogPosts($method, $idOrAction);
            }
            return true;

        case 'categories':
            handleBlogCategories($method, $idOrAction);
            return true;

        case 'comments':
            handleBlogComments($method, $idOrAction);
            return true;

        default:
            return false;
    }
}

function getBearerToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}

function jsonResponse($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
