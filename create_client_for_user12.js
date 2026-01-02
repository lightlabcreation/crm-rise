const pool = require('./config/db');

async function createClientForUser12() {
    try {
        // Get user details
        const [users] = await pool.execute('SELECT * FROM users WHERE id = 12');
        const user = users[0];

        console.log('Creating client record for:', user.name, user.email);

        // Create client record
        const [result] = await pool.execute(
            `INSERT INTO clients (
        company_id, company_name, owner_id, status, created_at, updated_at, is_deleted
      ) VALUES (?, ?, ?, ?, NOW(), NOW(), 0)`,
            [user.company_id, user.name || 'Default Company', user.id, 'Active']
        );

        console.log('Client created with ID:', result.insertId);

        // Verify
        const [clients] = await pool.execute('SELECT * FROM clients WHERE id = ?', [result.insertId]);
        console.log('Created client:', clients[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

createClientForUser12();
