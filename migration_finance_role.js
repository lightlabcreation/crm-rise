const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const migrate = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Modify users table to add FINANCE role
        // Note: We list all existing roles + FINANCE
        await connection.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('ADMIN', 'EMPLOYEE', 'CLIENT', 'SUPERADMIN', 'FINANCE') 
            NOT NULL DEFAULT 'EMPLOYEE'
        `);
        console.log('Successfully updated users table role enum.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
};

migrate();
