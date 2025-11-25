const { query } = require('../../../../auth/db');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.statusCode = 403;
    return res.json({ success: false, error: 'Acesso negado' });
  }

  const { bookSlug } = req.query || {};
  if (!bookSlug) {
    res.statusCode = 400;
    return res.json({ success: false, error: 'Parâmetro bookSlug é obrigatório' });
  }

  try {
    const resq = await query('SELECT id, user_id AS userId, action, book_slug AS bookSlug, timestamp, ip_hash AS ipHash, user_agent AS userAgent FROM audit_log WHERE book_slug=? ORDER BY timestamp DESC LIMIT 100', [bookSlug]);
    res.statusCode = 200;
    return res.json({ logs: resq.rows || [] });
  } catch (e) {
    console.error('audit book GET error', e);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
