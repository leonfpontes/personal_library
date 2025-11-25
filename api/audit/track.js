const { insertAudit } = require('../../../auth/db');
const { v4: uuidv4 } = require('uuid');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ success: false, error: 'Método não permitido' });
  }
  try {
    const { action, bookSlug } = req.body || {};
    if (!action) {
      res.statusCode = 400;
      return res.json({ success: false, error: 'Ação é obrigatória' });
    }
    const id = uuidv4();
    const ts = Math.floor(Date.now() / 1000);
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const hash = require('crypto').createHash('sha256').update(String(ip)).digest('hex');
    const ua = req.headers['user-agent'] || '';
    await insertAudit({ id, userId: null, action, bookSlug: bookSlug || null, timestamp: ts, ipHash: hash, userAgent: ua });
    res.statusCode = 200;
    return res.json({ success: true });
  } catch (e) {
    console.error('audit track POST error', e);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
