const { upsertGrant, listGrantsByUser } = require('../../auth/db');
const { isAdmin } = require('../helpers/auth');
const { v4: uuidv4 } = require('uuid');

export const config = {
  runtime: 'nodejs',
};

const VALID_BOOKS = new Set(['vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna']);

module.exports = async (req, res) => {
  // Validate admin access via session cookie or admin token
  const adminAccess = await isAdmin(req);
  if (!adminAccess) {
    res.status(403).json({ success: false, error: 'Acesso negado' });
    return;
  }

  // Handle GET /api/grants?userId=xxx (list grants for user)
  const userId = req.query?.userId;
  
  if (req.method === 'GET' && userId) {
    try {
      const grants = await listGrantsByUser(userId);
      res.status(200).json({ grants });
    } catch (e) {
      console.error('grants [user] GET error', e);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
    return;
  }

  // Handle POST /api/grants (grant or revoke access)
  if (req.method === 'POST') {

  try {
    const { userId, bookSlug, action } = req.body || {};
    if (!userId || !bookSlug || !action) {
      res.status(400).json({ success: false, error: 'Parâmetros obrigatórios ausentes' });
      return;
    }
    if (!VALID_BOOKS.has(bookSlug)) {
      res.status(400).json({ success: false, error: 'Livro não existe' });
      return;
    }
    if (!['grant','revoke'].includes(action)) {
      res.status(400).json({ success: false, error: 'Ação inválida' });
      return;
    }

    const id = uuidv4();
    const ts = Math.floor(Date.now() / 1000);
    const grantId = await upsertGrant({ id, userId, bookSlug, action, timestamp: ts });

    res.status(200).json({ success: true, grant: { id: grantId, userId, bookSlug, status: action === 'grant' ? 'active' : 'revoked', grantedAt: ts, revokedAt: action === 'revoke' ? ts : null } });
  } catch (err) {
    console.error('grants error', err);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }

  res.status(405).json({ success: false, error: 'Método não permitido' });
};
