const mysql = require('mysql2/promise');

async function fixClient() {
    // Explicitly connect to 'crm_db_new' as identified from the error logs
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'crm_db_new', // TARGET DATABASE
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Connected to crm_db_new.');
        const ownerId = 12;

        // 1. Check if client exists
        const [existing] = await pool.execute(
            'SELECT * FROM clients WHERE owner_id = ?',
            [ownerId]
        );

        console.log('Existing clients for owner 12:', existing);

        const activeClient = existing.find(c => c.is_deleted === 0);

        if (activeClient) {
            console.log('Active client already exists:', activeClient);
        } else {
            console.log('No active client found. Creating one...');

            const clientData = {
                company_id: 1,
                company_name: 'tech panda',
                owner_id: ownerId,
                country: 'United States',
                currency: 'USD',
                currency_symbol: '$',
                status: 'Active',
                is_deleted: 0,
                disable_online_payment: 0
            };

            const [result] = await pool.execute(
                `INSERT INTO clients 
        (company_id, company_name, owner_id, country, currency, currency_symbol, status, is_deleted, disable_online_payment, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                    clientData.company_id,
                    clientData.company_name,
                    clientData.owner_id,
                    clientData.country,
                    clientData.currency,
                    clientData.currency_symbol,
                    clientData.status,
                    clientData.is_deleted,
                    clientData.disable_online_payment
                ]
            );

            console.log('Client created successfully with ID:', result.insertId);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixClient();
