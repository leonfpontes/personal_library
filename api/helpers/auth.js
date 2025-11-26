const jwt = require('jsonwebtoken');
const { query } = require('../auth/db');

/**
 * Validates if the current session belongs to an admin user
 * Checks both X-Admin-Token header and session cookie
 */
async function isAdmin(req) {
  // Check X-Admin-Token first (for backward compatibility)
  const adminToken = req.headers['x-admin-token'];
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
    return true;
  }

  // Check session cookie
  try {
    const cookieHeader = req.headers['cookie'] || '';
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/);
    if (!match) return false;

    const token = decodeURIComponent(match[1]);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Check if user is admin (id === 'admin')
    if (userId === 'admin') {
      return true;
    }

    // Alternatively, check if user has admin role in database
    const result = await query('SELECT id FROM users WHERE id = ? AND status = ?', [userId, 'active']);
    if (result.rows?.length && result.rows[0].id === 'admin') {
      return true;
    }

    return false;
  } catch (err) {
    console.error('Error validating admin session:', err);
    return false;
  }
}

module.exports = { isAdmin };
