const pool = require('./config/db');

async function debugUpdate() {
    try {
        const companyId = 1;

        // 1. Find ANY invoice
        const [existingInvoices] = await pool.execute('SELECT id FROM invoices LIMIT 1');
        if (existingInvoices.length === 0) {
            console.log('No invoices found in DB.');
            return;
        }
        const id = existingInvoices[0].id;
        console.log('Found existing invoice ID:', id);

        const updateFields = {
            status: 'Unpaid',
            items: [
                {
                    item_name: 'Debug Item',
                    description: 'Debug Description',
                    quantity: 1,
                    unit_price: 150,
                    amount: 150
                }
            ]
        };

        console.log('Testing update logic...');

        // 2. Simulate Controller Update Logic
        const updates = [];
        const values = [];

        // Add status
        updates.push('status = ?');
        values.push(updateFields.status);

        // Calc totals (Inline simulation of calculateTotals)
        const totals = {
            sub_total: 150,
            discount_amount: 0,
            tax_amount: 0,
            total: 150,
            unpaid: 150
        };
        updates.push('sub_total = ?', 'discount_amount = ?', 'tax_amount = ?', 'total = ?', 'unpaid = ?');
        values.push(totals.sub_total, totals.discount_amount, totals.tax_amount, totals.total, totals.unpaid);

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id, companyId);

            console.log('Executing SQL:', `UPDATE invoices SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`);
            console.log('Parameters:', values);

            const [result] = await pool.execute(
                `UPDATE invoices SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
                values
            );

            console.log('Update success! Affected rows:', result.affectedRows);
        }

    } catch (err) {
        console.error('Update FAILED with error:', err);
        console.error('Stack:', err.stack);
    } finally {
        process.exit();
    }
}

debugUpdate();
