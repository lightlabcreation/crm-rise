const pool = require('./config/db');

async function debugUser() {
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE id = 12');
        console.log('User 12:', users[0]);

        if (users.length > 0) {
            const email = users[0].email;
            const [clients] = await pool.execute('SELECT * FROM clients WHERE email = ?', [email]);
            console.log('Client with email ' + email + ':', clients);

            if (clients.length > 0) {
                console.log('Client ID should be:', clients[0].id);
            }
        }

        // Check tables schema
        const [userCols] = await pool.execute("SHOW COLUMNS FROM users");
        console.log('Users columns:', userCols.map(c => c.Field));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debugUser();
