<?php
// src/controllers/SharedConsultaTempController.php

require_once __DIR__ . '/../services/SharedConsultaTempService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class SharedConsultaTempController {
    private $service;

    public function __construct($db) {
        $this->service = new SharedConsultaTempService($db);
    }

    public function create() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::unauthorized('Usuário não autenticado');
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !isset($input['payload'])) {
                Response::error('Dados inválidos', 400);
                return;
            }

            $share = $this->service->createShare((int)$userId, $input);
            Response::success($share, 'Link temporário criado com sucesso', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function getPublicByKey($key) {
        try {
            $share = $this->service->getPublicShareByKey($key);

            if (!$share) {
                Response::notFound('Link expirado ou inválido');
                return;
            }

            Response::success($share, 'Consulta compartilhada carregada com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
