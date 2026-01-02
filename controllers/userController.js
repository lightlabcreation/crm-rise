const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAll = async (req, res) => {
  try {
    const companyId = req.query.company_id || req.body.company_id || 1;
    const role = req.query.role;

    let whereClause = 'WHERE company_id = ? AND is_deleted = 0';
    const params = [companyId];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    // Get all users without pagination
    const [users] = await pool.execute(
      `SELECT id, company_id, name, email, role, status, phone FROM users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

const create = async (req, res) => {
  try {
    const { name, email, password, role, status, phone } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'name, email, password, and role are required'
      });
    }

    const companyId = req.companyId || req.body.company_id || 1;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      `SELECT id FROM users WHERE email = ? AND company_id = ?`,
      [email, companyId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (company_id, name, email, password, role, status, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [companyId, name, email, hashedPassword, role, status || 'Active', phone || null]
    );

    // Get created user (without password)
    const [users] = await pool.execute(
      `SELECT id, company_id, name, email, role, status, created_at 
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: users[0],
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: error.message, details: error.sqlMessage });
  }
};

/**
 * Reset user password
 * POST /api/v1/users/:id/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.execute(
      `SELECT id FROM users WHERE id = ? AND company_id = ? AND is_deleted = 0`,
      [id, req.companyId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new random password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [hashedPassword, id]
    );

    res.json({
      success: true,
      data: {
        newPassword: newPassword
      },
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, phone } = req.body;
    const companyId = req.companyId || req.body.company_id || 1;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'name, email, and role are required'
      });
    }

    // Check if user exists
    const [existingUser] = await pool.execute(
      `SELECT id FROM users WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update user
    await pool.execute(
      `UPDATE users 
       SET name = ?, email = ?, role = ?, status = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND company_id = ?`,
      [name, email, role, status || 'Active', phone || null, id, companyId]
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      `SELECT id, company_id, name, email, role, status, phone, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedUser[0],
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId || req.body.company_id || 1;

    // Soft delete
    const [result] = await pool.execute(
      `UPDATE users SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAll, create, resetPassword, update, remove };

