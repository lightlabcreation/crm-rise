const pool = require('./config/db');

const runMigration = async () => {
    try {
        // 1. Create document_folders table
        console.log('Creating document_folders table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS document_folders (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        company_id INT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        parent_id INT UNSIGNED NULL,
        created_by INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted TINYINT(1) DEFAULT 0,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES document_folders(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_folder_company (company_id),
        INDEX idx_folder_parent (parent_id),
        INDEX idx_folder_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        console.log('document_folders table created/verified.');

        // 2. Add folder_id to documents table
        console.log('Adding folder_id to documents table...');
        try {
            await pool.query(`
        ALTER TABLE documents 
        ADD COLUMN folder_id INT UNSIGNED NULL AFTER company_id,
        ADD FOREIGN KEY (folder_id) REFERENCES document_folders(id) ON DELETE SET NULL,
        ADD INDEX idx_document_folder (folder_id)
      `);
            console.log('folder_id column added to documents.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column folder_id already exists.');
            } else {
                throw err;
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
