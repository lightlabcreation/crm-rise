const pool = require('./config/db');

async function debugUpdateNaN() {
    try {
        const companyId = 1;
        const id = 1;

        console.log('Testing update with NaN values...');

        const updates = [];
        const values = [];

        updates.push('sub_total = ?');
        values.push(NaN); // Inject NaN

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, companyId);

        console.log('Values:', values);

        const [result] = await pool.execute(
            `UPDATE invoices SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
            values
        );

        console.log('Update success! Affected rows:', result.affectedRows);

    } catch (err) {
        console.error('Update FAILED with error:', err.message);
        console.error('Code:', err.code);
    } finally {
        process.exit();
    }
}

debugUpdateNaN();
