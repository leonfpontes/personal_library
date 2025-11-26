const { listGrantsByUser } = require('../../auth/db');
const { isAdmin } = require('../helpers/auth');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  // Validate admin access via session cookie or admin token
  const adminAccess = await isAdmin(req);
  if (!adminAccess) {
    res.status(403).json({ success: false, error: 'Acesso negado' });
    return;
  }

  const { userId } = req.query || {};
  if (!userId) {
    res.status(400).json({ success: false, error: 'Parâmetro userId é obrigatório' });
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Método não permitido' });
    return;
  }

  try {
    const grants = await listGrantsByUser(userId);
    res.status(200).json({ grants });
  } catch (e) {
    console.error('grants [user] GET error', e);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};
