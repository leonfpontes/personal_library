const { createUser, listUsers, getUserById, deleteUser, updateUser, query } = require('../../auth/db');
const { isAdmin } = require('../helpers/auth');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // Validate admin access via session cookie or admin token
  const adminAccess = await isAdmin(req);
  if (!adminAccess) {
    res.status(403).json({ success: false, error: 'Acesso negado' });
    return;
  }

  // Parse URL to extract path parameters (for /api/users/:userId)
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathMatch = url.pathname.match(/^\/api\/users\/([^\/]+)$/);
  const userIdFromPath = pathMatch ? pathMatch[1] : null;

  // Handle /api/users?userId=xxx (legacy query param support)
  const userId = userIdFromPath || req.query?.userId;
  
  if (userId) {
    // Single user operations
    if (req.method === 'GET') {
      try {
        const u = await getUserById(userId);
        if (!u) {
          res.status(404).json({ success: false, error: 'Usuário não encontrado' });
          return;
        }
        res.status(200).json({ id: u.id, nome: u.nome, cpfMasked: u.cpfMasked, email: u.email, status: u.status });
      } catch (e) {
        console.error('users [id] GET error', e);
        res.status(500).json({ success: false, error: 'Erro interno' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      // T035-T036: Enhanced DELETE with self-deletion check
      try {
        // Get current admin user ID from session
        const currentUserId = req.session?.userId;
        
        // T036: Block self-deletion
        if (currentUserId && userId === currentUserId) {
          res.status(400).json({ success: false, error: 'Você não pode excluir sua própria conta' });
          return;
        }
        
        await deleteUser(userId);
        res.status(200).json({ success: true });
      } catch (e) {
        console.error('users [id] DELETE error', e);
        res.status(500).json({ success: false, error: 'Erro interno' });
      }
      return;
    }

    // T027: PATCH /api/users/:userId - Update user
    if (req.method === 'PATCH') {
      try {
        const { nome, cpf, email, password, isAdmin, status } = req.body || {};
        
        // Allow status-only updates (toggle active/inactive) without requiring other fields
        const onlyStatusProvided = (status !== undefined) && (nome === undefined && cpf === undefined && email === undefined && password === undefined && isAdmin === undefined);
        if (onlyStatusProvided) {
          await updateUser(userId, { status });
          res.status(200).json({ success: true, user: { id: userId, status } });
          return;
        }
        
        // Get current admin user ID from session
        const currentUserId = req.session?.userId;
        
        // T029: Block self-edit (prevent privilege escalation)
        if (currentUserId && userId === currentUserId) {
          res.status(400).json({ success: false, error: 'Você não pode editar sua própria conta por segurança' });
          return;
        }
        
        // Validate required fields
        if (!nome || !cpf || !email) {
          res.status(400).json({ success: false, error: 'Nome, CPF e email são obrigatórios' });
          return;
        }
        
        // Validate CPF format
        if (!/^\d{11}$/.test(cpf)) {
          res.status(400).json({ success: false, error: 'CPF inválido (deve ter 11 dígitos)' });
          return;
        }
        
        // Check email uniqueness (excluding current user)
        const emailLower = String(email).toLowerCase();
        const existsEmail = await query('SELECT id FROM users WHERE email=? AND id!=?', [emailLower, userId]);
        if (existsEmail.rows?.length) {
          res.status(400).json({ success: false, error: 'Email já cadastrado' });
          return;
        }
        
        // Check CPF uniqueness (excluding current user)
        const existsCpf = await query('SELECT id FROM users WHERE cpf=? AND id!=?', [cpf, userId]);
        if (existsCpf.rows?.length) {
          res.status(400).json({ success: false, error: 'CPF já cadastrado' });
          return;
        }
        
        // Build update data
        const updateData = {
          nome,
          cpf,
          email: emailLower,
        };
        
        // Update is_admin flag (T027)
        if (isAdmin !== undefined) {
          updateData.isAdmin = !!isAdmin;
        }
        
        // Hash password if provided (empty = keep current)
        if (password && password.trim()) {
          updateData.hashedPassword = await bcrypt.hash(password, 10);
        }
        
        // T030: Call database updateUser function
        try {
          await updateUser(userId, updateData);
        } catch (dbError) {
          console.error('[PATCH] Database update error:', dbError);
          console.error('[PATCH] Update data:', JSON.stringify(updateData, null, 2));
          throw dbError;
        }
        
        res.status(200).json({ 
          success: true, 
          user: { 
            id: userId, 
            nome, 
            cpfMasked: `${cpf.slice(0,3)}***${cpf.slice(-2)}`, 
            email: emailLower, 
            status: updateData.status 
          } 
        });
      } catch (e) {
        console.error('users [id] PATCH error', e);
        res.status(500).json({ success: false, error: 'Erro interno' });
      }
      return;
    }

    res.status(405).json({ success: false, error: 'Método não permitido' });
    return;
  }

  // List all users (GET /api/users)

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
      const { nome, cpf, email, password, isAdmin } = req.body || {};
      // T040: consent field removed (US6)
      if (!nome || !cpf || !email || !password) {
        res.status(400).json({ success: false, error: 'Nome, CPF, email e senha são obrigatórios' });
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
      // T004: Set is_admin flag (FR-009) - status is always 'active'
      const status = 'active';
      await createUser({ id, nome, cpf, email: emailLower, hashedPassword: hash, status, isAdmin: !!isAdmin, createdAt: now, consentAt: now });
      res.status(201).json({ success: true, user: { id, nome, cpfMasked: `${cpf.slice(0,3)}***${cpf.slice(-2)}`, email: emailLower, status } });
    } catch (e) {
      console.error('users POST error', e);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Método não permitido' });
};
