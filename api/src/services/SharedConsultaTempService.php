<?php
// src/services/SharedConsultaTempService.php

require_once __DIR__ . '/../models/SharedConsultaTemp.php';

class SharedConsultaTempService {
    private $model;

    public function __construct($db) {
        $this->model = new SharedConsultaTemp($db);
        $this->model->ensureTable();
    }

    public function createShare($userId, $data) {
        if (empty($data['payload'])) {
            throw new Exception('payload é obrigatório');
        }

        $this->model->deactivateExpired();

        $key = $this->generateKey();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+20 minutes'));
        $payloadJson = json_encode($data['payload'], JSON_UNESCAPED_UNICODE);

        if ($payloadJson === false) {
            throw new Exception('Falha ao serializar payload');
        }

        $consultationCpf = isset($data['cpf']) ? preg_replace('/\D/', '', (string)$data['cpf']) : null;
        $id = $this->model->create($key, $payloadJson, $expiresAt, $userId, $consultationCpf);

        return [
            'id' => (int)$id,
            'key' => $key,
            'expires_at' => $expiresAt,
            'expires_in_minutes' => 20,
        ];
    }

    public function getPublicShareByKey($key) {
        if (empty($key)) {
            throw new Exception('chave é obrigatória');
        }

        $this->model->deactivateExpired();
        $record = $this->model->getActiveByKey($key);

        if (!$record) {
            return null;
        }

        $payload = json_decode($record['payload'], true);

        return [
            'key' => $record['share_key'],
            'cpf' => $record['consultation_cpf'],
            'payload' => $payload,
            'expires_at' => $record['expires_at'],
            'created_at' => $record['created_at'],
        ];
    }

    private function generateKey() {
        return rtrim(strtr(base64_encode(random_bytes(18)), '+/', '-_'), '=');
    }
}
