const pool = require('../config/db');

/**
 * Get all document folders
 * GET /api/v1/document-folders
 */
const getAll = async (req, res) => {
    try {
        const companyId = req.query.company_id || req.body.company_id || 1;
        const parentId = req.query.parent_id || null; // For nested folders if needed later

        let query = 'SELECT * FROM document_folders WHERE company_id = ? AND is_deleted = 0';
        const params = [companyId];

        if (parentId) {
            query += ' AND parent_id = ?';
            params.push(parentId);
        } else {
            // By default show root folders (optional, currently flat structure in UI plan but DB supports nesting)
            // query += ' AND parent_id IS NULL'; 
        }

        query += ' ORDER BY created_at DESC';

        const [folders] = await pool.execute(query, params);

        res.json({
            success: true,
            data: folders
        });
    } catch (error) {
        console.error('Get folders error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Create a new folder
 * POST /api/v1/document-folders
 */
const create = async (req, res) => {
    try {
        const { name, parent_id, company_id, created_by } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Folder name is required'
            });
        }

        const companyId = company_id || 1;
        const createdBy = created_by || 1; // Default to admin/system if not provided

        const [result] = await pool.execute(
            'INSERT INTO document_folders (company_id, name, parent_id, created_by) VALUES (?, ?, ?, ?)',
            [companyId, name, parent_id || null, createdBy]
        );

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                name,
                parent_id: parent_id || null,
                company_id: companyId
            },
            message: 'Folder created successfully'
        });
    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create folder'
        });
    }
};

/**
 * Delete a folder
 * DELETE /api/v1/document-folders/:id
 */
const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.query.company_id || req.body.company_id || 1;

        // Check if folder exists
        const [folders] = await pool.execute(
            'SELECT * FROM document_folders WHERE id = ? AND company_id = ? AND is_deleted = 0',
            [id, companyId]
        );

        if (folders.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Folder not found'
            });
        }

        // Soft delete
        await pool.execute(
            'UPDATE document_folders SET is_deleted = 1 WHERE id = ?',
            [id]
        );

        // Also soft delete or move documents? 
        // Plan: Just delete the folder, documents might become orphaned or show in root. 
        // Better practice: Move documents to root or cascade delete.
        // For now, let's just make documents have null folder_id
        await pool.execute(
            'UPDATE documents SET folder_id = NULL WHERE folder_id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Folder deleted successfully'
        });
    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete folder'
        });
    }
};

module.exports = {
    getAll,
    create,
    deleteFolder
};
