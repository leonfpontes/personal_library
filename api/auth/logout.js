module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ success: false, error: 'Método não permitido' });
  }

  try {
    // Clear the session cookie
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
    res.statusCode = 200;
    return res.json({ success: true });
  } catch (err) {
    console.error('logout error', err);
    res.statusCode = 500;
    return res.json({ success: false, error: 'Erro interno' });
  }
};
