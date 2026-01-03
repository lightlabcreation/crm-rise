CREATE TABLE IF NOT EXISTS `zoho_books_integrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `client_secret` varchar(255) NOT NULL,
  `organization_id` varchar(255) DEFAULT NULL,
  `access_token` text,
  `refresh_token` text,
  `token_expiry` datetime DEFAULT NULL,
  `status` enum('Connected','Disconnected','Expired') DEFAULT 'Disconnected',
  `sync_invoices` tinyint(1) DEFAULT '1',
  `sync_payments` tinyint(1) DEFAULT '1',
  `sync_customers` tinyint(1) DEFAULT '0',
  `last_sync` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_company_zoho` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
