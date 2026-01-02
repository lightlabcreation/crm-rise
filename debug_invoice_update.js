const pool = require('./config/db');

async function debugUpdate() {
    try {
        const id = 50;
        const companyId = 1;
        const updateFields = {
            status: 'Unpaid',
            items: [
                {
                    item_name: 'Test Item',
                    description: 'Test Description',
                    quantity: 1,
                    unit_price: 100,
                    amount: 100
                }
            ]
        };

        console.log('Testing update for Invoice:', id);

        // 1. Check if invoice exists
        const [invoices] = await pool.execute(
            `SELECT id FROM invoices WHERE id = ? AND company_id = ? AND is_deleted = 0`,
            [id, companyId]
        );
        console.log('Invoice found:', invoices.length > 0);

        if (invoices.length === 0) {
            console.log('Invoice not found, skipping update.');
            return;
        }

        // 2. Simulate logic
        const updates = [];
        const values = [];

        // Add status
        updates.push('status = ?');
        values.push(updateFields.status);

        // Calc totals
        const totals = {
            sub_total: 100,
            discount_amount: 0,
            tax_amount: 0,
            total: 100,
            unpaid: 100
        };
        updates.push('sub_total = ?', 'discount_amount = ?', 'tax_amount = ?', 'total = ?', 'unpaid = ?');
        values.push(totals.sub_total, totals.discount_amount, totals.tax_amount, totals.total, totals.unpaid);

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, companyId);

        console.log('SQL:', `UPDATE invoices SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`);
        console.log('Values:', values);

        const [result] = await pool.execute(
            `UPDATE invoices SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
            values
        );

        console.log('Update result:', result);

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        process.exit();
    }
}

debugUpdate();
