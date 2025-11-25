const { upsertGrant } = require('../../../auth/db');
const { v4: uuidv4 } = require('uuid');

export const config = {
  runtime: 'nodejs',
};

const VALID_BOOKS = new Set(['vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna']);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ success: false, error: 'Método não permitido' });
  }

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.statusCode = 403;
    return res.json({ success: false, error: 'Acesso negado' });
  }

  try {
    const { userId, bookSlug, action } = req.body || {};
    if (!userId || !bookSlug || !action) {
      res.statusCode = 400;
      return res.json({ success: false, error: 'Parâmetros obrigatórios ausentes' });
    }
    if (!VALID_BOOKS.has(bookSlug)) {
      res.statusCode = 400;
      return res.json({ success: false, error: 'Livro não existe' });
    }
    if (!['grant','revoke'].includes(action)) {
      res.statusCode = 400;
      return res.json({ success: false, error: 'Ação inválida' });
    }

    const id = uuidv4();
    const ts = Math.floor(Date.now() / 1000);
    const grantId = await upsertGrant({ id, userId, bookSlug, action, timestamp: ts });

    res.statusCode = 200;
    return res.json({ success: true, grant: { id: grantId, userId, bookSlug, status: action === 'grant' ? 'active' : 'revoked', grantedAt: ts, revokedAt: action === 'revoke' ? ts : null } });
  } catch (err) {
    console.error('grants error', err);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
