const pool = require('./config/db');

async function debugClientId() {
    try {
        // Check user 12
        const [users] = await pool.execute('SELECT * FROM users WHERE id = 12');
        console.log('User 12:', users[0]);

        // Check if there's a client record for this user
        const [clients] = await pool.execute('SELECT * FROM clients WHERE owner_id = 12 AND is_deleted = 0');
        console.log('Client records for owner_id 12:', clients);

        // Check all clients
        const [allClients] = await pool.execute('SELECT id, owner_id, company_name FROM clients WHERE is_deleted = 0');
        console.log('All clients:', allClients);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debugClientId();
