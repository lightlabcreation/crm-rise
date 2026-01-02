-- Create document_folders table
CREATE TABLE IF NOT EXISTS `document_folders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `parent_id` INT UNSIGNED NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `document_folders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_folder_company` (`company_id`),
  INDEX `idx_folder_parent` (`parent_id`),
  INDEX `idx_folder_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add folder_id to documents table
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'folder_id' AND table_schema = DATABASE());
SET @sql := IF(@exist = 0, 'ALTER TABLE `documents` ADD COLUMN `folder_id` INT UNSIGNED NULL AFTER `company_id`, ADD FOREIGN KEY (`folder_id`) REFERENCES `document_folders`(`id`) ON DELETE SET NULL, ADD INDEX `idx_document_folder` (`folder_id`)', 'SELECT "Column folder_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
