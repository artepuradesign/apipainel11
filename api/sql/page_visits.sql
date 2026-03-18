-- Tabela de contadores de visitas por página
CREATE TABLE IF NOT EXISTS page_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(255) DEFAULT NULL,
    user_id INT DEFAULT NULL,
    visitor_type ENUM('usuario', 'visitante') NOT NULL DEFAULT 'visitante',
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    referrer VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_page_path (page_path),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_visitor_type (visitor_type),
    
    CONSTRAINT fk_page_visits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View para resumo de visitas por página
CREATE OR REPLACE VIEW page_visits_summary AS
SELECT 
    page_path,
    COUNT(*) as total_visits,
    COUNT(DISTINCT CASE WHEN visitor_type = 'usuario' THEN user_id END) as unique_users,
    SUM(CASE WHEN visitor_type = 'visitante' THEN 1 ELSE 0 END) as visitor_count,
    SUM(CASE WHEN visitor_type = 'usuario' THEN 1 ELSE 0 END) as user_count,
    MAX(created_at) as last_visit,
    MIN(created_at) as first_visit
FROM page_visits
GROUP BY page_path;
