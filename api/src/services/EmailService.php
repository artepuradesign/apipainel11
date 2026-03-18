
<?php
// src/services/EmailService.php

class EmailService {
    private $config;
    
    public function __construct() {
        $this->config = [
            'host' => $_ENV['SMTP_HOST'] ?? 'localhost',
            'port' => $_ENV['SMTP_PORT'] ?? 587,
            'username' => $_ENV['SMTP_USERNAME'] ?? '',
            'password' => $_ENV['SMTP_PASSWORD'] ?? '',
            'from_email' => $_ENV['FROM_EMAIL'] ?? 'noreply@localhost',
            'from_name' => $_ENV['FROM_NAME'] ?? 'Sistema'
        ];
    }
    
    public function sendWelcomeEmail($userEmail, $userName) {
        $subject = 'Bem-vindo ao nosso sistema!';
        $body = $this->getWelcomeTemplate($userName);
        
        return $this->sendEmail($userEmail, $subject, $body);
    }
    
    public function sendPasswordResetEmail($userEmail, $resetToken) {
        $subject = 'Redefinição de senha';
        $body = $this->getPasswordResetTemplate($resetToken);
        
        return $this->sendEmail($userEmail, $subject, $body);
    }
    
    public function sendPaymentConfirmationEmail($userEmail, $userName, $amount) {
        $subject = 'Confirmação de pagamento';
        $body = $this->getPaymentConfirmationTemplate($userName, $amount);
        
        return $this->sendEmail($userEmail, $subject, $body);
    }
    
    public function sendSupportTicketEmail($userEmail, $ticketId, $subject) {
        $emailSubject = 'Ticket de suporte criado - #' . $ticketId;
        $body = $this->getSupportTicketTemplate($ticketId, $subject);
        
        return $this->sendEmail($userEmail, $emailSubject, $body);
    }
    
    private function sendEmail($to, $subject, $body) {
        // Implementação básica com mail() do PHP
        // Em produção, usar PHPMailer ou similar
        $headers = [
            'From: ' . $this->config['from_name'] . ' <' . $this->config['from_email'] . '>',
            'Reply-To: ' . $this->config['from_email'],
            'Content-Type: text/html; charset=UTF-8',
            'MIME-Version: 1.0'
        ];
        
        return mail($to, $subject, $body, implode("\r\n", $headers));
    }
    
    private function getWelcomeTemplate($userName) {
        return "
        <html>
        <body>
            <h1>Bem-vindo, {$userName}!</h1>
            <p>Sua conta foi criada com sucesso.</p>
            <p>Agora você já pode acessar todos os nossos serviços.</p>
        </body>
        </html>
        ";
    }
    
    private function getPasswordResetTemplate($resetToken) {
        $resetUrl = $_ENV['FRONTEND_URL'] . '/reset-password?token=' . $resetToken;

        return "
        <html>
        <body>
            <h1>Recuperação de senha</h1>
            <p>Para continuar, confirme a leitura clicando no botão abaixo:</p>
            <p><a href='{$resetUrl}' style='display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;'>Confirmar leitura e atualizar senha</a></p>
            <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
        </body>
        </html>
        ";
    }
    
    private function getPaymentConfirmationTemplate($userName, $amount) {
        return "
        <html>
        <body>
            <h1>Pagamento confirmado</h1>
            <p>Olá {$userName},</p>
            <p>Seu pagamento de R$ {$amount} foi confirmado com sucesso.</p>
            <p>O saldo já foi adicionado à sua conta.</p>
        </body>
        </html>
        ";
    }
    
    private function getSupportTicketTemplate($ticketId, $subject) {
        return "
        <html>
        <body>
            <h1>Ticket de suporte criado</h1>
            <p>Seu ticket #{$ticketId} foi criado com sucesso.</p>
            <p>Assunto: {$subject}</p>
            <p>Nossa equipe entrará em contato em breve.</p>
        </body>
        </html>
        ";
    }
}
