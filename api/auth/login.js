const { getUserByEmail, insertSession } = require('../../auth/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// dev-server: ignore Vercel ESM export config
// export const config = { runtime: 'nodejs' };

function maskCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0,3)}***${cpf.slice(-2)}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body || {};
    console.log('[LOGIN] Tentativa de login:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      res.statusCode = 400;
      return res.json({ success: false, error: 'Email e senha são obrigatórios' });
    }

    const user = await getUserByEmail(email);
    console.log('[LOGIN] Usuário encontrado:', user ? { id: user.id, email: user.email, status: user.status } : null);
    
    if (!user) {
      console.log('[LOGIN] Usuário não encontrado');
      res.statusCode = 401;
      return res.json({ success: false, error: 'Email ou senha incorretos' });
    }
    if (user.status !== 'active') {
      console.log('[LOGIN] Usuário inativo');
      res.statusCode = 401;
      return res.json({ success: false, error: 'Usuário inativo' });
    }

    const ok = await bcrypt.compare(password, user.hashed_password);
    console.log('[LOGIN] Senha válida:', ok);
    
    if (!ok) {
      console.log('[LOGIN] Senha incorreta');
      res.statusCode = 401;
      return res.json({ success: false, error: 'Email ou senha incorretos' });
    }

    const sessionId = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    const ttl = parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10);
    await insertSession({ id: sessionId, userId: user.id, createdAt: now, expiresAt: now + ttl, ipHash: null, userAgent: req.headers['user-agent'] || null });

    const token = jwt.sign({ sessionId, userId: user.id }, process.env.JWT_SECRET, { expiresIn: ttl });

    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${ttl}; Path=/`);
    res.statusCode = 200;
    return res.json({ 
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
    console.error('login error', err);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
