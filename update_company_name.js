const pool = require('./config/db');

async function updateCompanyName() {
    try {
        console.log('Updating company_name to "CRM"...');

        // Update or Insert company_name setting
        await pool.execute(
            `INSERT INTO system_settings (company_id, setting_key, setting_value)
       VALUES (1, 'company_name', 'CRM')
       ON DUPLICATE KEY UPDATE setting_value = 'CRM'`
        );

        // Also update system_name if it exists
        await pool.execute(
            `INSERT INTO system_settings (company_id, setting_key, setting_value)
       VALUES (1, 'system_name', 'CRM')
       ON DUPLICATE KEY UPDATE setting_value = 'CRM'`
        );

        console.log('Successfully updated company_name to CRM');
        process.exit(0);
    } catch (error) {
        console.error('Error updating company name:', error);
        process.exit(1);
    }
}

updateCompanyName();
