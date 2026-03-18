<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/../services/NotificationService.php';

class SistemasHospedagemVps6 extends BaseModel {
    protected $table = 'sistemas_hospedagem_vps_6';

    public function __construct($db) {
        parent::__construct($db);
        $this->ensureStatusEnum();
        $this->ensurePlanDateColumns();
    }

    public function findByIdForUser(int $id, int $userId): ?array {
        $this->expireFinishedRecords();

        $stmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, nome_instancia, ip_vps, configuracao_linux, duracao_meses, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
             FROM {$this->table}
             WHERE id = ? AND user_id = ?
             LIMIT 1"
        );
        $stmt->execute([$id, $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function listByUser(int $userId, int $limit = 50, int $offset = 0): array {
        $this->expireFinishedRecords();

        $stmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, nome_instancia, ip_vps, configuracao_linux, duracao_meses, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
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

        if ($status && in_array($status, ['registrado', 'em_configuracao', 'finalizado', 'vencido', 'cancelado'], true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($search) {
            $where[] = '(nome_solicitante LIKE ? OR nome_instancia LIKE ? OR ip_vps LIKE ? OR configuracao_linux LIKE ?)';
            $like = '%' . trim($search) . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $whereSql = !empty($where) ? ('WHERE ' . implode(' AND ', $where)) : '';

        $stmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, nome_instancia, ip_vps, configuracao_linux, duracao_meses, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
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

        if ($status && in_array($status, ['registrado', 'em_configuracao', 'finalizado', 'vencido', 'cancelado'], true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($search) {
            $where[] = '(nome_solicitante LIKE ? OR nome_instancia LIKE ? OR ip_vps LIKE ? OR configuracao_linux LIKE ?)';
            $like = '%' . trim($search) . '%';
            $params[] = $like;
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

    public function updateAdminWorkflow(int $id, string $status, ?string $ipVps = null): array {
        $allowedStatuses = ['registrado', 'em_configuracao', 'finalizado'];
        if (!in_array($status, $allowedStatuses, true)) {
            throw new Exception('Status inválido para controle administrativo');
        }

        if ($status === 'finalizado') {
            $ipVps = trim((string)$ipVps);
            if ($ipVps === '') {
                throw new Exception('Informe o IP da VPS antes de finalizar o pedido');
            }

            if (strlen($ipVps) > 45) {
                throw new Exception('IP inválido');
            }
        }

        $currentStmt = $this->db->prepare("SELECT user_id, status FROM {$this->table} WHERE id = ? LIMIT 1");
        $currentStmt->execute([$id]);
        $currentRow = $currentStmt->fetch(PDO::FETCH_ASSOC);

        if (!$currentRow) {
            throw new Exception('Pedido não encontrado');
        }

        $fields = [
            'status = ?',
            'plan_start_at = COALESCE(plan_start_at, created_at)',
            'plan_end_at = COALESCE(plan_end_at, DATE_ADD(COALESCE(plan_start_at, created_at), INTERVAL duracao_meses MONTH))',
            'updated_at = NOW()'
        ];
        $params = [$status];

        if ($ipVps !== null) {
            $fields[] = 'ip_vps = ?';
            $params[] = trim($ipVps);
        }

        $params[] = $id;

        $stmt = $this->db->prepare(
            "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ? AND status NOT IN ('cancelado', 'vencido')"
        );
        $stmt->execute($params);

        $rowStmt = $this->db->prepare(
            "SELECT id, module_id, user_id, nome_solicitante, nome_instancia, ip_vps, configuracao_linux, duracao_meses, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at
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
                'em_configuracao' => 'Em Configuração',
                'finalizado' => 'Finalizado',
                'vencido' => 'Vencido',
            ];
            $statusLabel = $statusLabelMap[$row['status']] ?? $row['status'];

            $notificationService = new NotificationService($this->db);
            $notificationService->createNotification(
                (int)$row['user_id'],
                'pedido_status',
                "Pedido VPS #{$id} atualizado",
                "O status do seu pedido VPS foi alterado para: {$statusLabel}.",
                '/dashboard/meus-pedidos',
                'Ver pedidos',
                $row['status'] === 'finalizado' ? 'high' : 'medium'
            );
        }

        return $row;
    }

    public function registerOrder(array $data, int $userId): array {
        $nomeSolicitante = trim((string)($data['nome_solicitante'] ?? ''));
        if ($nomeSolicitante === '' || strlen($nomeSolicitante) > 150) {
            throw new Exception('Nome do solicitante é obrigatório e deve ter até 150 caracteres');
        }

        $nomeInstancia = trim((string)($data['nome_instancia'] ?? ''));
        if ($nomeInstancia === '') {
            $nomeInstancia = 'vps-' . $userId;
        }
        if (strlen($nomeInstancia) > 120) {
            throw new Exception('Nome da instância deve ter até 120 caracteres');
        }

        $moduleId = (int)($data['module_id'] ?? 177);
        $duracaoMeses = 6;
        $configuracaoPadrao = 'Ubuntu 22.04 LTS + Docker + UFW';

        $this->db->beginTransaction();

        try {
            $moduleStmt = $this->db->prepare("SELECT name, price FROM modules WHERE id = ? LIMIT 1");
            $moduleStmt->execute([$moduleId]);
            $moduleData = $moduleStmt->fetch(PDO::FETCH_ASSOC);
            $precoOriginal = (float)($moduleData['price'] ?? 0);
            if ($precoOriginal <= 0) {
                throw new Exception('Preço do módulo não configurado');
            }

            $duracaoMeses = $this->resolveDurationMonthsFromModule($moduleData['name'] ?? null, $duracaoMeses);

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

            $ipVps = '';

            $planStartAt = date('Y-m-d H:i:s');
            $planEndAt = date('Y-m-d H:i:s', strtotime("+{$duracaoMeses} months", strtotime($planStartAt)));

            $insertStmt = $this->db->prepare(
                "INSERT INTO {$this->table}
                (module_id, user_id, nome_solicitante, nome_instancia, ip_vps, configuracao_linux, duracao_meses, plan_start_at, plan_end_at, status, valor_cobrado, desconto_aplicado, saldo_usado, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'registrado', ?, ?, ?, NOW(), NOW())"
            );
            $insertStmt->execute([
                $moduleId,
                $userId,
                $nomeSolicitante,
                $nomeInstancia,
                $ipVps,
                $configuracaoPadrao,
                $duracaoMeses,
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

            $description = "Hospedagem VPS {$duracaoMeses} meses (IP pendente de configuração)";

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
                VALUES (?, 'sistemas_hospedagem_vps_6', ?, ?, NULL, 'completed', ?, ?, ?, NOW(), NOW())"
            );

            $metadata = json_encode([
                'source' => 'sistemas-hospedagem-vps-6',
                'module_id' => $moduleId,
                'registro_id' => $registroId,
                'ip_vps' => null,
                'configuracao_linux' => $configuracaoPadrao,
                'duracao_meses' => $duracaoMeses,
                'saldo_usado' => $saldoUsado,
                'desconto_aplicado' => $descontoValor,
                'preco_original' => $precoOriginal,
                'valor_final' => $valorFinal,
                'timestamp' => date('c'),
            ], JSON_UNESCAPED_UNICODE);

            $consultationStmt->execute([
                $userId,
                $nomeInstancia,
                $valorFinal,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $metadata,
            ]);

            $this->db->commit();

            return [
                'id' => $registroId,
                'nome_solicitante' => $nomeSolicitante,
                'nome_instancia' => $nomeInstancia,
                'ip_vps' => $ipVps,
                'configuracao_linux' => $configuracaoPadrao,
                'duracao_meses' => $duracaoMeses,
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

            $required = ['registrado', 'em_configuracao', 'finalizado', 'vencido', 'cancelado'];
            $missing = array_filter($required, static fn($value) => strpos($type, "'{$value}'") === false);

            if (!empty($missing)) {
                $this->db->exec(
                    "ALTER TABLE {$this->table} MODIFY COLUMN status ENUM('registrado','em_configuracao','finalizado','vencido','cancelado') NOT NULL DEFAULT 'registrado'"
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
                $this->db->exec("ALTER TABLE {$this->table} ADD COLUMN plan_start_at DATETIME NULL AFTER duracao_meses");
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

    private function resolveDurationMonthsFromModule(?string $moduleName, int $fallback): int {
        $normalizedName = strtolower(trim((string)$moduleName));
        if ($normalizedName === '') {
            return max(1, $fallback);
        }

        if (preg_match('/1\s*ano|12\s*mes/', $normalizedName)) {
            return 12;
        }

        if (preg_match('/1\s*m[eê]s/', $normalizedName)) {
            return 1;
        }

        if (preg_match('/6\s*mes/', $normalizedName)) {
            return 6;
        }

        return max(1, $fallback);
    }

    private function resolveDiscountPercent(int $userId, string $planName): float {
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

        if ($planName !== '') {
            $planByNameStmt = $this->db->prepare("SELECT discount_percentage FROM plans WHERE name = ? LIMIT 1");
            $planByNameStmt->execute([$planName]);
            $planByNameDiscount = $planByNameStmt->fetchColumn();
            if ($planByNameDiscount !== false && $planByNameDiscount !== null) {
                return max(0, (float)$planByNameDiscount);
            }
        }

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
            VALUES (?, ?, 'consulta', ?, ?, ?, ?, 'saldo', 'sistemas_hospedagem_vps_6', ?, 'completed', NOW(), NOW())"
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
