const { neon } = require('@neondatabase/serverless');

function getEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var ${name}`);
  return val;
}

let sql;
function getClient() {
  if (sql) return sql;
  const databaseUrl = getEnv('DATABASE_URL');
  sql = neon(databaseUrl);
  return sql;
}

async function query(sqlText, params = []) {
  const client = getClient();
  // Neon usa $1, $2, $3... ao invés de ?
  // Converter ? para $1, $2...
  let paramIndex = 1;
  const convertedSql = sqlText.replace(/\?/g, () => `$${paramIndex++}`);
  const result = await client(convertedSql, params);
  return { rows: result };
}

async function getUserByEmail(email) {
  const res = await query('SELECT id, nome, cpf, email, hashed_password, status FROM users WHERE email = ?', [email.toLowerCase()]);
  return res.rows?.[0] || null;
}

async function insertSession({ id, userId, createdAt, expiresAt, ipHash, userAgent }) {
  await query('INSERT INTO sessions (id, user_id, created_at, expires_at, ip_hash, user_agent) VALUES (?,?,?,?,?,?)', [id, userId, createdAt, expiresAt, ipHash || null, userAgent || null]);
}

async function getGrantStatus(userId, bookSlug) {
  const res = await query('SELECT status FROM grants WHERE user_id=? AND book_slug=?', [userId, bookSlug]);
  const row = res.rows?.[0];
  return row ? row.status : null;
}

async function upsertGrant({ id, userId, bookSlug, action, timestamp }) {
  if (action === 'grant') {
    // PostgreSQL upsert com ON CONFLICT
    await query(
      'INSERT INTO grants (id,user_id,book_slug,status,granted_at,revoked_at) VALUES (?,?,?,?,?,NULL) ON CONFLICT (user_id,book_slug) DO UPDATE SET status=?, granted_at=?, revoked_at=NULL',
      [id, userId, bookSlug, 'active', timestamp, 'active', timestamp]
    );
    return id;
  }
  if (action === 'revoke') {
    await query('UPDATE grants SET status=?, revoked_at=? WHERE user_id=? AND book_slug=?', ['revoked', timestamp, userId, bookSlug]);
    return id;
  }
  throw new Error('Invalid action');
}

async function createUser({ id, nome, cpf, email, hashedPassword, status, createdAt, consentAt }) {
  await query(
    'INSERT INTO users (id,nome,cpf,email,hashed_password,status,created_at,last_access_at,consent_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, nome, cpf, email.toLowerCase(), hashedPassword, status, createdAt, createdAt, consentAt]
  );
}

async function listUsers() {
  const res = await query('SELECT id, nome, cpf, email, status FROM users ORDER BY created_at DESC');
  const rows = res.rows || [];
  // Mask CPF before returning
  return rows.map(row => ({
    ...row,
    cpfMasked: row.cpf ? `${row.cpf.slice(0,3)}***${row.cpf.slice(-2)}` : null,
    cpf: undefined // Remove raw CPF
  }));
}

async function getUserById(id) {
  const res = await query('SELECT id, nome, cpf, email, status FROM users WHERE id=?', [id]);
  const user = res.rows?.[0] || null;
  if (!user) return null;
  // Mask CPF before returning
  return {
    ...user,
    cpfMasked: user.cpf ? `${user.cpf.slice(0,3)}***${user.cpf.slice(-2)}` : null,
    cpf: undefined // Remove raw CPF
  };
}

async function deleteUser(id) {
  await query('DELETE FROM users WHERE id=?', [id]);
}

async function listGrantsByUser(userId) {
  const res = await query('SELECT id, book_slug AS bookSlug, status, granted_at AS grantedAt, revoked_at AS revokedAt FROM grants WHERE user_id=?', [userId]);
  return res.rows || [];
}

async function insertAudit({ id, userId, action, bookSlug, timestamp, ipHash, userAgent }) {
  await query('INSERT INTO audit_log (id,user_id,action,book_slug,timestamp,ip_hash,user_agent) VALUES (?,?,?,?,?,?,?)', [id, userId || null, action, bookSlug || null, timestamp, ipHash || null, userAgent || null]);
}

module.exports = {
  getClient,
  query,
  getUserByEmail,
  insertSession,
  getGrantStatus,
  upsertGrant,
  createUser,
  listUsers,
  getUserById,
  deleteUser,
  listGrantsByUser,
  insertAudit,
};
