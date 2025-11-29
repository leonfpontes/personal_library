const { getUserByEmail, insertSession } = require('../../auth/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function maskCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0,3)}***${cpf.slice(-2)}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido' });
    return;
  }

  try {
    if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
      console.error('[LOGIN] Missing envs', { hasDB: !!process.env.DATABASE_URL, hasJWT: !!process.env.JWT_SECRET });
      res.status(500).json({ success: false, error: 'Configuração inválida' });
      return;
    }

    // Parse body (dev-server pode entregar string)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { email, password } = body || {};
    console.log('[LOGIN] Tentativa', { email, hasPassword: !!password });

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
      return;
    }

    let user;
    try {
      user = await getUserByEmail(email);
    } catch (e) {
      console.error('[LOGIN] Erro getUserByEmail', e);
      res.status(500).json({ success: false, error: 'Falha ao consultar usuário' });
      return;
    }

    console.log('[LOGIN] Usuário', user ? { id: user.id, status: user.status } : 'não encontrado');

    if (!user || user.status !== 'active') {
      res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
      return;
    }

    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.hashed_password);
    } catch (e) {
      console.error('[LOGIN] Erro bcrypt.compare', e);
      res.status(500).json({ success: false, error: 'Falha na validação de senha' });
      return;
    }

    if (!ok) {
      res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
      return;
    }

    const sessionId = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    const ttl = parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10);

    try {
      await insertSession({ id: sessionId, userId: user.id, createdAt: now, expiresAt: now + ttl, ipHash: null, userAgent: req.headers['user-agent'] || null });
    } catch (e) {
      console.error('[LOGIN] Erro insertSession', e);
      res.status(500).json({ success: false, error: 'Falha ao criar sessão' });
      return;
    }

    let token;
    try {
      token = jwt.sign({ sessionId, userId: user.id }, process.env.JWT_SECRET, { expiresIn: ttl });
    } catch (e) {
      console.error('[LOGIN] Erro jwt.sign', e);
      res.status(500).json({ success: false, error: 'Falha ao gerar token' });
      return;
    }

    try {
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${ttl}; Path=/`);
    } catch (e) {
      console.error('[LOGIN] Erro set cookie', e);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        cpfMasked: maskCpf(user.cpf),
        email: user.email,
        status: user.status,
        isAdmin: user.id === 'admin'
      },
      token
    });
  } catch (err) {
    console.error('[LOGIN] Erro inesperado', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Erro interno', message: err.message });
    }
  }
};
