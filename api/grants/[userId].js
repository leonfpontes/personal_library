const { listGrantsByUser } = require('../../../auth/db');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.statusCode = 403;
    return res.json({ success: false, error: 'Acesso negado' });
  }

  const { userId } = req.query || {};
  if (!userId) {
    res.statusCode = 400;
    return res.json({ success: false, error: 'Parâmetro userId é obrigatório' });
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.json({ success: false, error: 'Método não permitido' });
  }

  try {
    const grants = await listGrantsByUser(userId);
    res.statusCode = 200;
    return res.json({ grants });
  } catch (e) {
    console.error('grants [user] GET error', e);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
