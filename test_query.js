const pool = require('./config/db');

const testQuery = async () => {
    try {
        const companyId = 1;
        const folder_id = 'null';

        let whereClause = 'WHERE d.is_deleted = 0';
        const params = [];

        // Filter by company
        whereClause += ' AND d.company_id = ?';
        params.push(companyId);

        // Filter by folder
        if (folder_id === 'null') {
            whereClause += ' AND d.folder_id IS NULL';
        }

        const query = `SELECT d.*, u.name as user_name
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       ${whereClause}
       ORDER BY d.created_at DESC`;

        console.log('Query:', query);
        console.log('Params:', params);

        const [documents] = await pool.execute(query, params);
        console.log('Success! Found docs:', documents.length);
        process.exit(0);
    } catch (error) {
        console.error('SQL Execution Error:', error);
        process.exit(1);
    }
};

testQuery();
