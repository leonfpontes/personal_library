// Endpoint para verificar variáveis de ambiente (USE APENAS EM DEV/DEBUG)
// REMOVA ESTE ARQUIVO ANTES DE PRODUÇÃO FINAL

module.exports = async (req, res) => {
  // Basic auth check
  const authHeader = req.headers['authorization'];
  const expectedToken = process.env.ADMIN_TOKEN || 'changeme';
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Check env vars
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    ADMIN_TOKEN: !!process.env.ADMIN_TOKEN,
    SESSION_TTL_SECONDS: !!process.env.SESSION_TTL_SECONDS,
    NODE_VERSION: process.version,
    VERCEL_ENV: process.env.VERCEL_ENV || 'not-vercel',
  };

  // Show partial values for debugging (first 10 chars)
  if (process.env.DATABASE_URL) {
    envCheck.DATABASE_URL_PREFIX = process.env.DATABASE_URL.substring(0, 20) + '...';
  }
  if (process.env.JWT_SECRET) {
    envCheck.JWT_SECRET_LENGTH = process.env.JWT_SECRET.length;
  }

  res.status(200).json(envCheck);
};
