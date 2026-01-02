const pool = require('./config/db');

async function checkClient() {
    try {
        console.log('Checking client for owner_id 12...');
        const [clients] = await pool.execute(
            'SELECT * FROM clients WHERE owner_id = 12'
        );
        console.log('Clients found:', clients);

        const [allClients] = await pool.execute('SELECT id, owner_id, company_name FROM clients');
        console.log('All Clients:', allClients);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkClient();
