-- Client Table Updates
-- Drop columns if they exist (handling recursively might be hard in pure SQL without stored procedure, but assuming they exist per schema)
-- We will use a safe approach or just try. run-migration.js catches errors but we want to be precise.
-- Clients
ALTER TABLE `clients` DROP COLUMN `vat_number`;
ALTER TABLE `clients` DROP COLUMN `gst_number`;
ALTER TABLE `clients` ADD COLUMN `ein_number` VARCHAR(100) NULL AFTER `website`;

-- Tasks
ALTER TABLE `tasks` MODIFY COLUMN `status` VARCHAR(50);
UPDATE `tasks` SET `status` = 'In-Progress' WHERE `status` IN ('Doing', 'doing', 'in progress');
UPDATE `tasks` SET `status` = 'Backlog' WHERE `status` IN ('Incomplete', 'incomplete', 'To Do', 'to do');
ALTER TABLE `tasks` MODIFY COLUMN `status` ENUM('Backlog', 'In-Progress', 'Done') DEFAULT 'Backlog';

-- Departments
DELETE FROM `departments` WHERE `name` IN ('Public Relations', 'Research');
INSERT INTO `departments` (`company_id`, `name`, `head_id`) SELECT 1, 'Marketing', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `departments` WHERE `name` = 'Marketing');
INSERT INTO `departments` (`company_id`, `name`, `head_id`) SELECT 1, 'Information Technology', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `departments` WHERE `name` = 'Information Technology');
