
<?php
// src/config/constants.php

// Application Constants
define('APP_NAME', 'API Painel');
define('APP_VERSION', '1.0.0');

// Database Constants
define('DB_TABLE_PREFIX', '');

// User Roles
define('USER_ROLE_ASSINANTE', 'assinante');
define('USER_ROLE_SUPORTE', 'suporte');
define('USER_ROLE_ADMIN', 'admin');

// User Status
define('USER_STATUS_ATIVO', 'ativo');
define('USER_STATUS_INATIVO', 'inativo');
define('USER_STATUS_SUSPENSO', 'suspenso');
define('USER_STATUS_PENDENTE', 'pendente');

// Plan Types
define('PLAN_TYPE_QUEEN', 'queen');
define('PLAN_TYPE_KING', 'king');

// Transaction Types
define('TRANSACTION_TYPE_CREDITO', 'credito');
define('TRANSACTION_TYPE_DEBITO', 'debito');

// Transaction Status
define('TRANSACTION_STATUS_PENDENTE', 'pendente');
define('TRANSACTION_STATUS_CONCLUIDA', 'concluida');
define('TRANSACTION_STATUS_CANCELADA', 'cancelada');

// Consultation Status
define('CONSULTATION_STATUS_PENDENTE', 'pendente');
define('CONSULTATION_STATUS_PROCESSANDO', 'processando');
define('CONSULTATION_STATUS_CONCLUIDA', 'concluida');
define('CONSULTATION_STATUS_ERRO', 'erro');

// Payment Methods
define('PAYMENT_METHOD_PIX', 'pix');
define('PAYMENT_METHOD_CREDIT_CARD', 'credit_card');
define('PAYMENT_METHOD_BANK_TRANSFER', 'bank_transfer');
define('PAYMENT_METHOD_CRYPTO', 'crypto');

// API Response Codes
define('HTTP_OK', 200);
define('HTTP_CREATED', 201);
define('HTTP_BAD_REQUEST', 400);
define('HTTP_UNAUTHORIZED', 401);
define('HTTP_FORBIDDEN', 403);
define('HTTP_NOT_FOUND', 404);
define('HTTP_METHOD_NOT_ALLOWED', 405);
define('HTTP_UNPROCESSABLE_ENTITY', 422);
define('HTTP_TOO_MANY_REQUESTS', 429);
define('HTTP_INTERNAL_SERVER_ERROR', 500);

// Rate Limiting
define('RATE_LIMIT_REQUESTS_PER_MINUTE', 60);
define('RATE_LIMIT_REQUESTS_PER_HOUR', 1000);

// File Upload
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']);

// Session
define('SESSION_LIFETIME', 86400); // 24 hours

// Encryption
define('ENCRYPTION_METHOD', 'AES-256-CBC');

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Log Levels
define('LOG_LEVEL_DEBUG', 'debug');
define('LOG_LEVEL_INFO', 'info');
define('LOG_LEVEL_WARNING', 'warning');
define('LOG_LEVEL_ERROR', 'error');
define('LOG_LEVEL_CRITICAL', 'critical');
