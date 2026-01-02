const pool = require('./config/db');

async function debugSettings() {
    try {
        console.log('Checking system_settings table...');

        // 1. Check table structure
        const [columns] = await pool.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'system_settings'`
        );
        console.log('Columns:', columns.map(c => c.COLUMN_NAME));

        // 2. Check content
        const [rows] = await pool.execute('SELECT * FROM system_settings');
        console.log('Row count:', rows.length);
        console.log('First 5 rows:', rows.slice(0, 5));

        // 3. Test Insert
        console.log('Testing Insert...');
        const testKey = 'debug_test_key';
        const testVal = 'debug_test_value_' + Date.now();

        await pool.execute(
            `INSERT INTO system_settings (company_id, setting_key, setting_value)
       VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
            [testKey, testVal, testVal]
        );
        console.log('Insert/Update successful.');

        // 4. Verify Insert
        const [check] = await pool.execute(
            'SELECT * FROM system_settings WHERE setting_key = ?',
            [testKey]
        );
        console.log('Verification:', check);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

debugSettings();
