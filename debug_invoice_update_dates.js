const pool = require('./config/db');

async function debugUpdateDates() {
    try {
        const companyId = 1;
        // Find ID 1
        const id = 1;

        const updateFields = {
            due_date: '', // Empty string
            invoice_date: '', // Empty string
        };

        console.log('Testing update with empty date strings...');

        const updates = [];
        const values = [];

        updates.push('due_date = ?');
        values.push(updateFields.due_date);

        updates.push('invoice_date = ?');
        values.push(updateFields.invoice_date);

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

debugUpdateDates();
