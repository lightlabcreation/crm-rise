const pool = require('./config/db');

const checkSchema = async () => {
    try {
        const [columns] = await pool.execute(`SHOW COLUMNS FROM documents`);
        console.log('Columns in documents table:');
        columns.forEach(col => console.log(col.Field));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSchema();
