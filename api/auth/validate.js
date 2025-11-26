const jwt = require('jsonwebtoken');
const { getGrantStatus, query } = require('../../auth/db');

// dev-server: ignore Vercel ESM export config
// export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  try {
    // Check required env vars
    if (!process.env.JWT_SECRET) {
      console.error('[VALIDATE] Missing JWT_SECRET');
      res.status(500).json({ valid: false, error: 'Server configuration error', detail: 'JWT_SECRET not set' });
      return;
    }
    if (!process.env.DATABASE_URL) {
      console.error('[VALIDATE] Missing DATABASE_URL');
      res.status(500).json({ valid: false, error: 'Server configuration error', detail: 'DATABASE_URL not set' });
      return;
    }
    
    const cookieHeader = req.headers['cookie'] || '';
    const match = cookieHeader.match(/(?:^|; )session=([^;]+)/);
    if (!match) {
      res.status(401).json({ valid: false, error: 'Token ausente' });
      return;
    }
    const token = decodeURIComponent(match[1]);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // Extract bookSlug from query params (Vercel uses url for serverless functions)
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const bookSlug = url.searchParams.get('bookSlug');

    let grants = [];
    
    // Admin has access to everything
    if (userId === 'admin') {
      res.status(200).json({ valid: true, user: { id: userId, nome: 'Administrador', cpfMasked: '000***00' }, grants: bookSlug ? [bookSlug] : [] });
      return;
    }
    
    // Fetch user details for watermark
    const ures = await query('SELECT nome, cpf FROM users WHERE id=?', [userId]);
    const urow = ures.rows?.[0];
    const nome = urow?.nome || '';
    const cpf = urow?.cpf || '';
    const cpfMasked = (cpf && cpf.length === 11) ? `${cpf.slice(0,3)}***${cpf.slice(-2)}` : cpf;
    
    // If bookSlug is provided, check grant (this is the middleware validation)
    if (bookSlug) {
      const status = await getGrantStatus(userId, bookSlug);
      if (status !== 'active') {
        console.log(`[VALIDATE] Access denied: userId=${userId}, bookSlug=${bookSlug}, status=${status}`);
        res.status(401).json({ valid: false, error: 'Acesso negado' });
        return;
      }
      grants = [bookSlug];
    }

    res.status(200).json({ valid: true, user: { id: userId, nome, cpfMasked }, grants });
  } catch (err) {
    console.error('validate error', err);
    res.status(401).json({ valid: false, error: 'Token inválido' });
  }
};
