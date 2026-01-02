const pool = require('./config/db');

async function showClientsSchema() {
    try {
        const [cols] = await pool.execute("SHOW COLUMNS FROM clients");
        console.log('Clients columns:', cols.map(c => c.Field));

        // Check if there is a client linked to user 12
        const [clients] = await pool.execute('SELECT * FROM clients WHERE owner_id = 12 OR user_id = 12'); // Guessing column names
        console.log('Clients linked to User 12:', clients);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

showClientsSchema();
