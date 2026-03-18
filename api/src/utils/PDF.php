
<?php
// src/utils/PDF.php

class PDF {
    private $title;
    private $author;
    private $subject;
    private $keywords;
    
    public function __construct() {
        $this->title = 'Documento PDF';
        $this->author = 'Sistema';
        $this->subject = '';
        $this->keywords = '';
    }
    
    public function setMetadata($title, $author = '', $subject = '', $keywords = '') {
        $this->title = $title;
        $this->author = $author;
        $this->subject = $subject;
        $this->keywords = $keywords;
    }
    
    public function generateReport($data, $template = 'default') {
        $html = $this->buildReportHTML($data, $template);
        return $this->htmlToPdf($html);
    }
    
    public function generateInvoice($invoiceData) {
        $html = $this->buildInvoiceHTML($invoiceData);
        return $this->htmlToPdf($html);
    }
    
    public function generateUserReport($userData) {
        $html = $this->buildUserReportHTML($userData);
        return $this->htmlToPdf($html);
    }
    
    private function buildReportHTML($data, $template) {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>' . htmlspecialchars($this->title) . '</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: bold; color: #333; }
                .subtitle { font-size: 16px; color: #666; margin-top: 10px; }
                .content { margin: 20px 0; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f2f2f2; font-weight: bold; }
                .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">' . htmlspecialchars($this->title) . '</div>
                <div class="subtitle">Gerado em: ' . date('d/m/Y H:i') . '</div>
            </div>
            
            <div class="content">';
        
        if (isset($data['summary'])) {
            $html .= '<h3>Resumo</h3><p>' . htmlspecialchars($data['summary']) . '</p>';
        }
        
        if (isset($data['table']) && is_array($data['table'])) {
            $html .= '<table class="table">';
            
            if (isset($data['table']['headers'])) {
                $html .= '<tr>';
                foreach ($data['table']['headers'] as $header) {
                    $html .= '<th>' . htmlspecialchars($header) . '</th>';
                }
                $html .= '</tr>';
            }
            
            if (isset($data['table']['rows'])) {
                foreach ($data['table']['rows'] as $row) {
                    $html .= '<tr>';
                    foreach ($row as $cell) {
                        $html .= '<td>' . htmlspecialchars($cell) . '</td>';
                    }
                    $html .= '</tr>';
                }
            }
            
            $html .= '</table>';
        }
        
        $html .= '
            </div>
            
            <div class="footer">
                <p>Documento gerado automaticamente pelo sistema</p>
            </div>
        </body>
        </html>';
        
        return $html;
    }
    
    private function buildInvoiceHTML($invoiceData) {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Fatura - ' . htmlspecialchars($invoiceData['number']) . '</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-title { font-size: 28px; font-weight: bold; color: #333; }
                .invoice-number { font-size: 18px; color: #666; }
                .company-info, .customer-info { margin: 20px 0; }
                .info-title { font-weight: bold; margin-bottom: 10px; }
                .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; }
                .items-table th { background-color: #f8f9fa; }
                .total-section { text-align: right; margin-top: 30px; }
                .total-line { margin: 5px 0; }
                .total-final { font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="invoice-title">FATURA</div>
                    <div class="invoice-number">#' . htmlspecialchars($invoiceData['number']) . '</div>
                </div>
                <div>
                    <div>Data: ' . date('d/m/Y', strtotime($invoiceData['date'])) . '</div>
                    <div>Vencimento: ' . date('d/m/Y', strtotime($invoiceData['due_date'])) . '</div>
                </div>
            </div>
            
            <div class="customer-info">
                <div class="info-title">Cliente:</div>
                <div>' . htmlspecialchars($invoiceData['customer']['name']) . '</div>
                <div>' . htmlspecialchars($invoiceData['customer']['email']) . '</div>
            </div>';
        
        if (isset($invoiceData['items'])) {
            $html .= '
            <table class="items-table">
                <tr>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Total</th>
                </tr>';
            
            foreach ($invoiceData['items'] as $item) {
                $html .= '
                <tr>
                    <td>' . htmlspecialchars($item['description']) . '</td>
                    <td>' . number_format($item['quantity'], 0, ',', '.') . '</td>
                    <td>R$ ' . number_format($item['unit_price'], 2, ',', '.') . '</td>
                    <td>R$ ' . number_format($item['total'], 2, ',', '.') . '</td>
                </tr>';
            }
            
            $html .= '</table>';
        }
        
        $html .= '
            <div class="total-section">
                <div class="total-line">Subtotal: R$ ' . number_format($invoiceData['subtotal'], 2, ',', '.') . '</div>';
        
        if (isset($invoiceData['tax'])) {
            $html .= '<div class="total-line">Impostos: R$ ' . number_format($invoiceData['tax'], 2, ',', '.') . '</div>';
        }
        
        $html .= '
                <div class="total-line total-final">Total: R$ ' . number_format($invoiceData['total'], 2, ',', '.') . '</div>
            </div>
        </body>
        </html>';
        
        return $html;
    }
    
    private function buildUserReportHTML($userData) {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Usuário</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .user-info { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; display: inline-block; width: 150px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
                .stat-label { font-size: 14px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Relatório de Usuário</h1>
                <p>Gerado em: ' . date('d/m/Y H:i') . '</p>
            </div>
            
            <div class="user-info">
                <h3>Informações do Usuário</h3>
                <div class="info-row">
                    <span class="label">Nome:</span>
                    <span>' . htmlspecialchars($userData['name']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span>' . htmlspecialchars($userData['email']) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">Cadastro:</span>
                    <span>' . date('d/m/Y', strtotime($userData['created_at'])) . '</span>
                </div>
            </div>';
        
        if (isset($userData['stats'])) {
            $html .= '
            <div class="stats-grid">';
            
            foreach ($userData['stats'] as $stat) {
                $html .= '
                <div class="stat-card">
                    <div class="stat-value">' . htmlspecialchars($stat['value']) . '</div>
                    <div class="stat-label">' . htmlspecialchars($stat['label']) . '</div>
                </div>';
            }
            
            $html .= '</div>';
        }
        
        $html .= '
        </body>
        </html>';
        
        return $html;
    }
    
    private function htmlToPdf($html) {
        // Implementação básica usando DomPDF ou similar seria necessária
        // Por enquanto, retornamos o HTML
        return $html;
    }
    
    public function outputPdf($content, $filename = 'document.pdf') {
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo $content;
    }
}
