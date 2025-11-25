const { getUserById, deleteUser } = require('../../../auth/db');

export const config = { runtime: 'nodejs' };

module.exports = async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.statusCode = 403;
    return res.json({ success: false, error: 'Acesso negado' });
  }

  const { userId } = req.query || {};
  if (!userId) {
    res.statusCode = 400;
    return res.json({ success: false, error: 'Parâmetro userId é obrigatório' });
  }

  if (req.method === 'GET') {
    try {
      const u = await getUserById(userId);
      if (!u) {
        res.statusCode = 404;
        return res.json({ success: false, error: 'Usuário não encontrado' });
      }
      res.statusCode = 200;
      return res.json({ id: u.id, nome: u.nome, cpfMasked: u.cpfMasked, email: u.email, status: u.status });
    } catch (e) {
      console.error('users [id] GET error', e);
      res.statusCode = 500;
      return res.json({ success: false, error: 'Erro interno' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteUser(userId);
      res.statusCode = 200;
      return res.json({ success: true });
    } catch (e) {
      console.error('users [id] DELETE error', e);
      res.statusCode = 500;
      return res.json({ success: false, error: 'Erro interno' });
    }
  }

  res.statusCode = 405;
  return res.json({ success: false, error: 'Método não permitido' });
};
