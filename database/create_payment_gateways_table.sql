CREATE TABLE IF NOT EXISTS payment_gateways (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  gateway_name ENUM('Stripe', 'PayPal', 'Razorpay') NOT NULL,
  credential_1 TEXT NULL COMMENT 'Encrypted: Publishable Key / Client ID / Key ID',
  credential_2 TEXT NULL COMMENT 'Encrypted: Secret Key / Client Secret / Key Secret',
  credential_3 TEXT NULL COMMENT 'Encrypted: Webhook Secret / Extra',
  is_enabled TINYINT(1) DEFAULT 0,
  mode ENUM('Sandbox', 'Live') DEFAULT 'Sandbox',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_gateway (company_id, gateway_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
