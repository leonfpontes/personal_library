const { createUser, listUsers, query } = require('../../auth/db');
const { isAdmin } = require('../helpers/auth');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  // Validate admin access via session cookie or admin token
  const adminAccess = await isAdmin(req);
  if (!adminAccess) {
    res.status(403).json({ success: false, error: 'Acesso negado' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const users = await listUsers();
      res.status(200).json({ users });
    } catch (e) {
      console.error('users GET error', e);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { nome, cpf, email, password, consent } = req.body || {};
      if (!nome || !cpf || !email || !password || consent !== true) {
        res.status(400).json({ success: false, error: 'Campos obrigatórios inválidos (inclua consentimento)' });
        return;
      }
      if (!/^\d{11}$/.test(cpf)) {
        res.status(400).json({ success: false, error: 'CPF inválido (deve ter 11 dígitos)' });
        return;
      }
      const emailLower = String(email).toLowerCase();
      const existsEmail = await query('SELECT 1 FROM users WHERE email=?', [emailLower]);
      if (existsEmail.rows?.length) {
        res.status(400).json({ success: false, error: 'Email já cadastrado' });
        return;
      }
      const existsCpf = await query('SELECT 1 FROM users WHERE cpf=?', [cpf]);
      if (existsCpf.rows?.length) {
        res.status(400).json({ success: false, error: 'CPF já cadastrado' });
        return;
      }
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const now = Math.floor(Date.now() / 1000);
      await createUser({ id, nome, cpf, email: emailLower, hashedPassword: hash, status: 'active', createdAt: now, consentAt: now });
      res.status(201).json({ success: true, user: { id, nome, cpfMasked: `${cpf.slice(0,3)}***${cpf.slice(-2)}`, email: emailLower, status: 'active' } });
    } catch (e) {
      console.error('users POST error', e);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Método não permitido' });
};
