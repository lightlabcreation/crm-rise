const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

(async () => {
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        // Add phone column if not exists
        await conn.query(`
            ALTER TABLE users
            ADD COLUMN phone VARCHAR(20) NULL AFTER email
        `);
        console.log("Added phone column.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column phone already exists.");
        } else {
            console.error(e);
        }
    } finally {
        if (conn) await conn.end();
        process.exit();
    }
})();
