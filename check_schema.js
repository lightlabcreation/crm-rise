const pool = require('./config/db');

const checkSchema = async () => {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM users");
        console.log('Columns in users table:', rows.map(r => r.Field));
        const [roles] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
        console.log('Role column type:', roles[0].Type);
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
};

checkSchema();
