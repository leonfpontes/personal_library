const { query } = require('../../../auth/db');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.statusCode = 403;
    return res.json({ success: false, error: 'Acesso negado' });
  }

  const limit = parseInt(req.query?.limit || '50', 10);
  const offset = parseInt(req.query?.offset || '0', 10);
  const action = req.query?.action || null;
  const bookSlug = req.query?.bookSlug || null;
  const userId = req.query?.userId || null;

  try {
    let sql = 'SELECT id, user_id AS userId, action, book_slug AS bookSlug, timestamp, ip_hash AS ipHash, user_agent AS userAgent FROM audit_log';
    const args = [];
    const where = [];
    if (action) { where.push('action=?'); args.push(action); }
    if (bookSlug) { where.push('book_slug=?'); args.push(bookSlug); }
    if (userId) { where.push('user_id=?'); args.push(userId); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);
    const resq = await query(sql, args);
    res.statusCode = 200;
    return res.json({ logs: resq.rows || [] });
  } catch (e) {
    console.error('audit logs GET error', e);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
