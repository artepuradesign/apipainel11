
<?php
// src/utils/Excel.php

class Excel {
    private $data;
    private $headers;
    private $filename;
    
    public function __construct() {
        $this->data = [];
        $this->headers = [];
        $this->filename = 'export.xlsx';
    }
    
    public function setHeaders($headers) {
        $this->headers = $headers;
        return $this;
    }
    
    public function setData($data) {
        $this->data = $data;
        return $this;
    }
    
    public function setFilename($filename) {
        $this->filename = $filename;
        return $this;
    }
    
    public function exportCSV() {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $this->filename . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // BOM para UTF-8
        fputs($output, "\xEF\xBB\xBF");
        
        // Headers
        if (!empty($this->headers)) {
            fputcsv($output, $this->headers, ';');
        }
        
        // Data
        foreach ($this->data as $row) {
            fputcsv($output, $row, ';');
        }
        
        fclose($output);
    }
    
    public function exportUsersToCSV($users) {
        $this->setHeaders(['ID', 'Nome', 'Email', 'CPF', 'Telefone', 'Plano', 'Saldo', 'Cadastro']);
        
        $data = [];
        foreach ($users as $user) {
            $data[] = [
                $user['id'],
                $user['name'],
                $user['email'],
                $user['cpf'] ?? '',
                $user['phone'] ?? '',
                $user['plan'] ?? 'Grátis',
                'R$ ' . number_format($user['balance'] ?? 0, 2, ',', '.'),
                date('d/m/Y', strtotime($user['created_at']))
            ];
        }
        
        $this->setData($data);
        $this->setFilename('usuarios_' . date('Y-m-d'));
        $this->exportCSV();
    }
    
    public function exportTransactionsToCSV($transactions) {
        $this->setHeaders(['ID', 'Usuário', 'Tipo', 'Valor', 'Status', 'Data']);
        
        $data = [];
        foreach ($transactions as $transaction) {
            $data[] = [
                $transaction['id'],
                $transaction['user_name'] ?? $transaction['user_id'],
                $this->getTransactionTypeLabel($transaction['type']),
                'R$ ' . number_format($transaction['amount'], 2, ',', '.'),
                $this->getStatusLabel($transaction['status']),
                date('d/m/Y H:i', strtotime($transaction['created_at']))
            ];
        }
        
        $this->setData($data);
        $this->setFilename('transacoes_' . date('Y-m-d'));
        $this->exportCSV();
    }
    
    public function exportConsultationsToCSV($consultations) {
        $this->setHeaders(['ID', 'Usuário', 'Tipo', 'Documento', 'Valor', 'Status', 'Data']);
        
        $data = [];
        foreach ($consultations as $consultation) {
            $data[] = [
                $consultation['id'],
                $consultation['user_name'] ?? $consultation['user_id'],
                $consultation['type'],
                $consultation['document'],
                'R$ ' . number_format($consultation['price'], 2, ',', '.'),
                $this->getStatusLabel($consultation['status']),
                date('d/m/Y H:i', strtotime($consultation['created_at']))
            ];
        }
        
        $this->setData($data);
        $this->setFilename('consultas_' . date('Y-m-d'));
        $this->exportCSV();
    }
    
    public function generateRevenueReport($startDate, $endDate, $data) {
        $this->setHeaders(['Data', 'Receita', 'Transações', 'Consultas', 'Novos Usuários']);
        
        $reportData = [];
        foreach ($data as $row) {
            $reportData[] = [
                date('d/m/Y', strtotime($row['date'])),
                'R$ ' . number_format($row['revenue'], 2, ',', '.'),
                $row['transactions_count'],
                $row['consultations_count'],
                $row['new_users_count']
            ];
        }
        
        $this->setData($reportData);
        $this->setFilename('relatorio_receita_' . date('Y-m-d', strtotime($startDate)) . '_' . date('Y-m-d', strtotime($endDate)));
        $this->exportCSV();
    }
    
    private function getTransactionTypeLabel($type) {
        $types = [
            'deposit' => 'Depósito',
            'withdrawal' => 'Saque',
            'payment' => 'Pagamento',
            'refund' => 'Reembolso',
            'bonus' => 'Bônus',
            'consultation' => 'Consulta'
        ];
        
        return $types[$type] ?? $type;
    }
    
    private function getStatusLabel($status) {
        $statuses = [
            'pending' => 'Pendente',
            'completed' => 'Concluído',
            'failed' => 'Falhou',
            'cancelled' => 'Cancelado',
            'processing' => 'Processando'
        ];
        
        return $statuses[$status] ?? $status;
    }
    
    public function createXLSX($data, $filename = null) {
        // Implementação básica para XLSX seria necessária biblioteca externa
        // Como PhpSpreadsheet
        throw new Exception('Exportação XLSX não implementada - use CSV como alternativa');
    }
    
    public function readCSV($filePath) {
        if (!file_exists($filePath)) {
            throw new Exception('Arquivo não encontrado');
        }
        
        $data = [];
        $handle = fopen($filePath, 'r');
        
        if ($handle !== false) {
            while (($row = fgetcsv($handle, 1000, ';')) !== false) {
                $data[] = $row;
            }
            fclose($handle);
        }
        
        return $data;
    }
}
