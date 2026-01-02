const pool = require('./config/db');

const showCreate = async () => {
    try {
        const [rows] = await pool.execute(`SHOW CREATE TABLE documents`);
        console.log(rows[0]['Create Table']);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

showCreate();
