module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      return res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    }
    const started = Date.now();
    const envOk = !!process.env.DATABASE_URL && !!process.env.JWT_SECRET;
    let db = 'skip';
    try {
      if (process.env.DATABASE_URL) {
        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        await sql`SELECT 1`;
        db = 'ok';
      } else {
        db = 'no-env';
      }
    } catch (e) {
      db = 'error';
    }
    const payload = {
      ok: envOk && db === 'ok',
      env: envOk,
      db,
      ms: Date.now() - started
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};
