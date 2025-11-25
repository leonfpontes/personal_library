const { createUser, listUsers, query } = require('../../../auth/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.statusCode = 403;
    return res.json({ success: false, error: 'Acesso negado' });
  }

  if (req.method === 'GET') {
    try {
      const users = await listUsers();
      res.statusCode = 200;
      return res.json({ users });
    } catch (e) {
      console.error('users GET error', e);
      res.statusCode = 500;
      return res.json({ success: false, error: 'Erro interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome, cpf, email, password, consent } = req.body || {};
      if (!nome || !cpf || !email || !password || consent !== true) {
        res.statusCode = 400;
        return res.json({ success: false, error: 'Campos obrigatórios inválidos (inclua consentimento)' });
      }
      if (!/^\d{11}$/.test(cpf)) {
        res.statusCode = 400;
        return res.json({ success: false, error: 'CPF inválido (deve ter 11 dígitos)' });
      }
      const emailLower = String(email).toLowerCase();
      const existsEmail = await query('SELECT 1 FROM users WHERE email=?', [emailLower]);
      if (existsEmail.rows?.length) {
        res.statusCode = 400;
        return res.json({ success: false, error: 'Email já cadastrado' });
      }
      const existsCpf = await query('SELECT 1 FROM users WHERE cpf=?', [cpf]);
      if (existsCpf.rows?.length) {
        res.statusCode = 400;
        return res.json({ success: false, error: 'CPF já cadastrado' });
      }
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const now = Math.floor(Date.now() / 1000);
      await createUser({ id, nome, cpf, email: emailLower, hashedPassword: hash, status: 'active', createdAt: now, consentAt: now });
      res.statusCode = 201;
      return res.json({ success: true, user: { id, nome, cpfMasked: `${cpf.slice(0,3)}***${cpf.slice(-2)}`, email: emailLower, status: 'active' } });
    } catch (e) {
      console.error('users POST error', e);
      res.statusCode = 500;
      return res.json({ success: false, error: 'Erro interno' });
    }
  }

  res.statusCode = 405;
  return res.json({ success: false, error: 'Método não permitido' });
};
