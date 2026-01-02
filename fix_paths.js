const pool = require('./config/db');

const fixImagePaths = async () => {
    try {
        console.log('Fixing item image paths...');

        // Select items with 'items/' in image_path
        const [items] = await pool.execute(
            `SELECT id, image_path FROM items WHERE image_path LIKE 'items/%'`
        );

        console.log(`Found ${items.length} items to fix.`);

        for (const item of items) {
            const newPath = item.image_path.replace('items/', '');
            await pool.execute(
                `UPDATE items SET image_path = ? WHERE id = ?`,
                [newPath, item.id]
            );
            console.log(`Fixed item ${item.id}: ${item.image_path} -> ${newPath}`);
        }

        console.log('All done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixImagePaths();
