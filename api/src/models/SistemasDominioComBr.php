<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/../services/NotificationService.php';

class SistemasDominioCom extends BaseModel {
    protected $table = 'sistemas_dominio_com';

    public function __construct($db) {
        parent::__construct($db);
        $this->ensureStatusEnum();
        $this->ensurePlanDateColumns();
    }

    public function normalizeDomainName(string $input): string {
        $domain = strtolower(trim($input));
        $domain = preg_replace('/\.com$/', '', $domain);
        $domain = preg_replace('/[^a-z0-9-]/', '', $domain);

        if (strlen($domain) < 2 || strlen($domain) > 63) {
            throw new Exception('Nome de domínio deve ter entre 2 e 63 caracteres');
        }

        if (!preg_match('/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/', $domain)) {
            throw new Exception('Nome de domínio inválido. Use letras, números e hífen (sem iniciar/finalizar com hífen)');
        }

        return $domain;
    }

    public function buildFullDomain(string $domainName): string {
        return $domainName . '.com';
    }

    public function findByDomain(string $fullDomain): ?array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE dominio_completo = ? LIMIT 1");
        $stmt->execute([$fullDomain]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function findByIdForUser(int $id, int $userId): ?array {
        $this->expireFinishedRecords();

        $stmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, dominio_nome, dominio_completo, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
             FROM {$this->table}
             WHERE id = ? AND user_id = ?
             LIMIT 1"
        );
        $stmt->execute([$id, $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function checkAvailability(string $domainInput): array {
        $domainName = $this->normalizeDomainName($domainInput);
        $fullDomain = $this->buildFullDomain($domainName);
        $existing = $this->findByDomain($fullDomain);

        return [
            'dominio_nome' => $domainName,
            'dominio_completo' => $fullDomain,
            'disponivel' => !$existing,
            'registro' => $existing,
        ];
    }

    public function listByUser(int $userId, int $limit = 50, int $offset = 0): array {
        $this->expireFinishedRecords();

        $stmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, dominio_nome, dominio_completo, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
             FROM {$this->table}
             WHERE user_id = ?
             ORDER BY id DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countByUser(int $userId): int {
        $this->expireFinishedRecords();

        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} WHERE user_id = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['count'] ?? 0);
    }

    public function listForAdmin(?string $status, ?string $search, int $limit = 50, int $offset = 0): array {
        $this->expireFinishedRecords();

        $where = [];
        $params = [];

        if ($status && in_array($status, ['registrado', 'em_propagacao', 'finalizado', 'vencido', 'cancelado'], true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($search) {
            $where[] = '(nome_solicitante LIKE ? OR dominio_nome LIKE ? OR dominio_completo LIKE ?)';
            $like = '%' . trim($search) . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $whereSql = !empty($where) ? ('WHERE ' . implode(' AND ', $where)) : '';

        $stmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, dominio_nome, dominio_completo, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
             FROM {$this->table}
             {$whereSql}
             ORDER BY id DESC
             LIMIT ? OFFSET ?"
        );

        $params[] = $limit;
        $params[] = $offset;
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countForAdmin(?string $status, ?string $search): int {
        $this->expireFinishedRecords();

        $where = [];
        $params = [];

        if ($status && in_array($status, ['registrado', 'em_propagacao', 'finalizado', 'vencido', 'cancelado'], true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($search) {
            $where[] = '(nome_solicitante LIKE ? OR dominio_nome LIKE ? OR dominio_completo LIKE ?)';
            $like = '%' . trim($search) . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $whereSql = !empty($where) ? ('WHERE ' . implode(' AND ', $where)) : '';
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM {$this->table} {$whereSql}");
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int)($row['count'] ?? 0);
    }

    public function cancelById(int $id): bool {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET status = 'cancelado', updated_at = NOW() WHERE id = ? AND status <> 'cancelado'");
        return $stmt->execute([$id]);
    }

    public function deleteById(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function updateAdminWorkflow(int $id, string $status): array {
        $allowedStatuses = ['registrado', 'em_propagacao', 'finalizado'];
        if (!in_array($status, $allowedStatuses, true)) {
            throw new Exception('Status inválido para controle administrativo');
        }

        $currentStmt = $this->db->prepare("SELECT user_id, status FROM {$this->table} WHERE id = ? LIMIT 1");
        $currentStmt->execute([$id]);
        $currentRow = $currentStmt->fetch(PDO::FETCH_ASSOC);

        if (!$currentRow) {
            throw new Exception('Pedido não encontrado');
        }

        $stmt = $this->db->prepare(
            "UPDATE {$this->table}
             SET status = ?,
                 plan_start_at = COALESCE(plan_start_at, created_at),
                 plan_end_at = COALESCE(plan_end_at, DATE_ADD(COALESCE(plan_start_at, created_at), INTERVAL 12 MONTH)),
                 updated_at = NOW()
             WHERE id = ? AND status NOT IN ('cancelado', 'vencido')"
        );
        $stmt->execute([$status, $id]);

        $rowStmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, dominio_nome, dominio_completo, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
             FROM {$this->table}
             WHERE id = ?
             LIMIT 1"
        );
        $rowStmt->execute([$id]);
        $row = $rowStmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            throw new Exception('Pedido não encontrado');
        }

        if ((int)($row['user_id'] ?? 0) > 0 && ($currentRow['status'] ?? '') !== ($row['status'] ?? '')) {
            $statusLabelMap = [
                'registrado' => 'Registrado',
                'em_propagacao' => 'Em Propagação',
                'finalizado' => 'Finalizado',
                'vencido' => 'Vencido',
            ];
            $statusLabel = $statusLabelMap[$row['status']] ?? $row['status'];

            $notificationService = new NotificationService($this->db);
            $notificationService->createNotification(
                (int)$row['user_id'],
                'pedido_status',
                "Pedido Domínio .COM #{$id} atualizado",
                "O status do seu pedido de domínio foi alterado para: {$statusLabel}.",
                '/dashboard/meus-pedidos',
                'Ver pedidos',
                $row['status'] === 'finalizado' ? 'high' : 'medium'
            );
        }

        return $row;
    }

    public function registerDomain(array $data, int $userId): array {
        $nomeSolicitante = trim((string)($data['nome_solicitante'] ?? ''));
        if ($nomeSolicitante === '' || strlen($nomeSolicitante) > 150) {
            throw new Exception('Nome do solicitante é obrigatório e deve ter até 150 caracteres');
        }

        $moduleId = (int)($data['module_id'] ?? 176);
        $availability = $this->checkAvailability((string)($data['dominio_nome'] ?? ''));

        if (!$availability['disponivel']) {
            throw new Exception('Este domínio já está registrado');
        }

        $this->db->beginTransaction();

        try {
            $lockStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE dominio_completo = ? FOR UPDATE");
            $lockStmt->execute([$availability['dominio_completo']]);
            if ($lockStmt->fetch(PDO::FETCH_ASSOC)) {
                throw new Exception('Este domínio acabou de ser registrado por outro usuário');
            }

            $moduleStmt = $this->db->prepare("SELECT price FROM modules WHERE id = ? LIMIT 1");
            $moduleStmt->execute([$moduleId]);
            $moduleData = $moduleStmt->fetch(PDO::FETCH_ASSOC);
            $precoOriginal = (float)($moduleData['price'] ?? 0);
            if ($precoOriginal <= 0) {
                throw new Exception('Preço do módulo não configurado');
            }

            $userStmt = $this->db->prepare("SELECT saldo, saldo_plano, tipoplano FROM users WHERE id = ? LIMIT 1 FOR UPDATE");
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            if (!$userData) {
                throw new Exception('Usuário não encontrado');
            }

            $planName = trim((string)($userData['tipoplano'] ?? 'Pré-Pago'));
            $discountPercent = $this->resolveDiscountPercent($userId, $planName);
            $descontoValor = round(($precoOriginal * $discountPercent) / 100, 2);
            $valorFinal = round(max($precoOriginal - $descontoValor, 0.01), 2);

            $saldoPlano = (float)($userData['saldo_plano'] ?? 0);
            $saldoCarteira = (float)($userData['saldo'] ?? 0);
            $saldoTotal = $saldoPlano + $saldoCarteira;

            if ($saldoTotal < $valorFinal) {
                throw new Exception('Saldo insuficiente. Necessário: R$ ' . number_format($valorFinal, 2, ',', '.'));
            }

            $debitoPlano = min($saldoPlano, $valorFinal);
            $debitoCarteira = round($valorFinal - $debitoPlano, 2);

            $novoSaldoPlano = round($saldoPlano - $debitoPlano, 2);
            $novoSaldoCarteira = round($saldoCarteira - $debitoCarteira, 2);

            $saldoUsado = 'carteira';
            if ($debitoPlano > 0 && $debitoCarteira > 0) {
                $saldoUsado = 'misto';
            } elseif ($debitoPlano > 0) {
                $saldoUsado = 'plano';
            }

            $planStartAt = date('Y-m-d H:i:s');
            $planEndAt = date('Y-m-d H:i:s', strtotime('+12 months', strtotime($planStartAt)));

            $insertStmt = $this->db->prepare(
                "INSERT INTO {$this->table}
                (module_id, user_id, nome_solicitante, dominio_nome, dominio_completo, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'registrado', ?, ?, ?, NOW(), NOW())"
            );
            $insertStmt->execute([
                $moduleId,
                $userId,
                $nomeSolicitante,
                $availability['dominio_nome'],
                $availability['dominio_completo'],
                $planStartAt,
                $planEndAt,
                $valorFinal,
                $descontoValor,
                $saldoUsado,
            ]);

            $registroId = (int)$this->db->lastInsertId();

            $updateUserStmt = $this->db->prepare("UPDATE users SET saldo = ?, saldo_plano = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?");
            $updateUserStmt->execute([$novoSaldoCarteira, $novoSaldoPlano, $userId]);

            $this->syncUserWalletBalance($userId, 'main', $novoSaldoCarteira);
            $this->syncUserWalletBalance($userId, 'plan', $novoSaldoPlano);

            $description = "Registro domínio .COM: {$availability['dominio_completo']}";

            if ($debitoPlano > 0) {
                $this->insertWalletTransaction(
                    $userId,
                    'plan',
                    -$debitoPlano,
                    $saldoPlano,
                    $novoSaldoPlano,
                    $description,
                    $registroId
                );
            }

            if ($debitoCarteira > 0) {
                $this->insertWalletTransaction(
                    $userId,
                    'main',
                    -$debitoCarteira,
                    $saldoCarteira,
                    $novoSaldoCarteira,
                    $description,
                    $registroId
                );
            }

            $consultationStmt = $this->db->prepare(
                "INSERT INTO consultations
                (user_id, module_type, document, cost, result_data, status, ip_address, user_agent, metadata, created_at, updated_at)
                VALUES (?, 'sistemas_dominio_com', ?, ?, NULL, 'completed', ?, ?, ?, NOW(), NOW())"
            );

            $metadata = json_encode([
                'source' => 'sistemas-dominio-com',
                'module_id' => $moduleId,
                'registro_id' => $registroId,
                'dominio' => $availability['dominio_completo'],
                'plan_start_at' => $planStartAt,
                'plan_end_at' => $planEndAt,
                'saldo_usado' => $saldoUsado,
                'desconto_aplicado' => $descontoValor,
                'preco_original' => $precoOriginal,
                'valor_final' => $valorFinal,
                'timestamp' => date('c'),
            ], JSON_UNESCAPED_UNICODE);

            $consultationStmt->execute([
                $userId,
                $availability['dominio_completo'],
                $valorFinal,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $metadata,
            ]);

            $this->db->commit();

            return [
                'id' => $registroId,
                'dominio_nome' => $availability['dominio_nome'],
                'dominio_completo' => $availability['dominio_completo'],
                'plan_start_at' => $planStartAt,
                'plan_end_at' => $planEndAt,
                'valor_cobrado' => $valorFinal,
                'desconto_aplicado' => $descontoValor,
                'saldo_usado' => $saldoUsado,
                'saldo_restante' => [
                    'saldo' => $novoSaldoCarteira,
                    'saldo_plano' => $novoSaldoPlano,
                    'total' => round($novoSaldoCarteira + $novoSaldoPlano, 2),
                ],
            ];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    private function ensureStatusEnum(): void {
        try {
            $stmt = $this->db->query("SHOW COLUMNS FROM {$this->table} LIKE 'status'");
            $row = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
            $type = strtolower((string)($row['Type'] ?? ''));

            $required = ['registrado', 'em_propagacao', 'finalizado', 'vencido', 'cancelado'];
            $missing = array_filter($required, static fn($value) => strpos($type, "'{$value}'") === false);

            if (!empty($missing)) {
                $this->db->exec(
                    "ALTER TABLE {$this->table} MODIFY COLUMN status ENUM('registrado','em_propagacao','finalizado','vencido','cancelado') NOT NULL DEFAULT 'registrado'"
                );
            }
        } catch (Exception $e) {
            // fallback silencioso para não bloquear a aplicação
        }
    }

    private function ensurePlanDateColumns(): void {
        try {
            $columnsStmt = $this->db->query("SHOW COLUMNS FROM {$this->table} LIKE 'plan_start_at'");
            if (!$columnsStmt || !$columnsStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->db->exec("ALTER TABLE {$this->table} ADD COLUMN plan_start_at DATETIME NULL AFTER dominio_completo");
            }

            $columnsStmt = $this->db->query("SHOW COLUMNS FROM {$this->table} LIKE 'plan_end_at'");
            if (!$columnsStmt || !$columnsStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->db->exec("ALTER TABLE {$this->table} ADD COLUMN plan_end_at DATETIME NULL AFTER plan_start_at");
            }
        } catch (Exception $e) {
            // fallback silencioso para não bloquear a aplicação
        }
    }

    private function expireFinishedRecords(): void {
        try {
            $stmt = $this->db->prepare(
                "UPDATE {$this->table}
                 SET status = 'vencido', updated_at = NOW()
                 WHERE status = 'finalizado'
                   AND plan_end_at IS NOT NULL
                   AND plan_end_at <= NOW()"
            );
            $stmt->execute();
        } catch (Exception $e) {
            // fallback silencioso para não bloquear a aplicação
        }
    }

    private function resolveDiscountPercent(int $userId, string $planName): float {
        // 1) Plano ativo do usuário (fonte prioritária)
        $activePlanStmt = $this->db->prepare(
            "SELECT p.discount_percentage
             FROM user_subscriptions us
             INNER JOIN plans p ON p.id = us.plan_id
             WHERE us.user_id = ? AND us.status = 'active'
             ORDER BY us.id DESC
             LIMIT 1"
        );
        $activePlanStmt->execute([$userId]);
        $activePlanDiscount = $activePlanStmt->fetchColumn();
        if ($activePlanDiscount !== false && $activePlanDiscount !== null) {
            return max(0, (float)$activePlanDiscount);
        }

        // 2) Fallback por nome do plano na tabela plans
        if ($planName !== '') {
            $planByNameStmt = $this->db->prepare("SELECT discount_percentage FROM plans WHERE name = ? LIMIT 1");
            $planByNameStmt->execute([$planName]);
            $planByNameDiscount = $planByNameStmt->fetchColumn();
            if ($planByNameDiscount !== false && $planByNameDiscount !== null) {
                return max(0, (float)$planByNameDiscount);
            }
        }

        // 3) Legado: planos antigos
        $legacyDiscountMap = [
            'Pré-Pago' => 0,
            'Rainha de Ouros' => 5,
            'Rainha de Paus' => 10,
            'Rainha de Copas' => 15,
            'Rainha de Espadas' => 20,
            'Rei de Ouros' => 20,
            'Rei de Paus' => 30,
            'Rei de Copas' => 40,
            'Rei de Espadas' => 50,
            'CONSULTA VIP' => 5,
            'CONSULTA PRO' => 10,
            'CONSULTA PLUS' => 15,
            'CONSULTA PRIME' => 25,
        ];

        return max(0, (float)($legacyDiscountMap[$planName] ?? 0));
    }

    private function syncUserWalletBalance(int $userId, string $walletType, float $newBalance): void {
        $stmt = $this->db->prepare(
            "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, status, total_deposited, total_spent, last_transaction_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'active', 0, 0, NOW(), NOW(), NOW())
             ON DUPLICATE KEY UPDATE
                current_balance = VALUES(current_balance),
                available_balance = VALUES(available_balance),
                last_transaction_at = NOW(),
                updated_at = NOW()"
        );

        $stmt->execute([$userId, $walletType, $newBalance, $newBalance]);
    }

    private function insertWalletTransaction(
        int $userId,
        string $walletType,
        float $amount,
        float $balanceBefore,
        float $balanceAfter,
        string $description,
        int $referenceId
    ): void {
        $stmt = $this->db->prepare(
            "INSERT INTO wallet_transactions
            (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, reference_type, reference_id, status, created_at, updated_at)
            VALUES (?, ?, 'consulta', ?, ?, ?, ?, 'saldo', 'sistemas_dominio_com', ?, 'completed', NOW(), NOW())"
        );

        $stmt->execute([
            $userId,
            $walletType,
            $amount,
            $balanceBefore,
            $balanceAfter,
            $description,
            $referenceId,
        ]);
    }
}
