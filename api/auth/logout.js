module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido' });
    return;
  }

  try {
    // Clear the session cookie
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('logout error', err);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
};
