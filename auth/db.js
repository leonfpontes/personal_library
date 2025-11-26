const { neon } = require('@neondatabase/serverless');

function getEnv(name) {
  let val = process.env[name];
  if (!val) throw new Error(`Missing env var ${name}`);
  // Remove quotes if present
  val = val.replace(/^["']|["']$/g, '');
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
  // sql.query() returns an array directly, not { rows: [...] }
  const result = await client.query(convertedSql, params);
  return { rows: result };  // Wrap array in { rows } for consistency
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
    // PostgreSQL upsert: insert or update if exists
    const exists = await query('SELECT id FROM grants WHERE user_id=? AND book_slug=?', [userId, bookSlug]);
    if (exists.rows?.length) {
      // Update existing grant
      await query('UPDATE grants SET status=?, granted_at=?, revoked_at=NULL WHERE user_id=? AND book_slug=?', ['active', timestamp, userId, bookSlug]);
      return exists.rows[0].id;
    } else {
      // Insert new grant
      await query('INSERT INTO grants (id,user_id,book_slug,status,granted_at,revoked_at) VALUES (?,?,?,?,?,NULL)', [id, userId, bookSlug, 'active', timestamp]);
      return id;
    }
  }
  if (action === 'revoke') {
    await query('UPDATE grants SET status=?, revoked_at=? WHERE user_id=? AND book_slug=?', ['revoked', timestamp, userId, bookSlug]);
    return id;
  }
  throw new Error('Invalid action');
}

async function createUser({ id, nome, cpf, email, hashedPassword, status, isAdmin, createdAt, consentAt }) {
  // T040: consentAt is now optional (US6 - removed LGPD checkbox)
  await query(
    'INSERT INTO users (id,nome,cpf,email,hashed_password,status,is_admin,created_at,last_access_at,consent_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, nome, cpf, email.toLowerCase(), hashedPassword, status, !!isAdmin, createdAt, createdAt, consentAt || createdAt]
  );
}

async function listUsers() {
  const res = await query('SELECT id, nome, cpf, email, status, is_admin FROM users ORDER BY created_at DESC');
  const rows = res.rows || [];
  // Return full CPF for admin context (needed for editing)
  // CPF is only exposed through admin-protected endpoints
  return rows.map(row => ({
    ...row,
    isAdmin: row.is_admin,
    cpfMasked: row.cpf ? `${row.cpf.slice(0,3)}***${row.cpf.slice(-2)}` : null
    // Keep cpf for admin editing purposes
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
  // T037: Grants cascade automatically if foreign key has ON DELETE CASCADE
  // Otherwise, manually delete grants first
  await query('DELETE FROM grants WHERE user_id=?', [id]);
  await query('DELETE FROM users WHERE id=?', [id]);
}

// T030: Update user function with partial updates
async function updateUser(id, data) {
  const fields = [];
  const values = [];
  
  if (data.nome !== undefined) {
    fields.push('nome = ?');
    values.push(data.nome);
  }
  if (data.cpf !== undefined) {
    fields.push('cpf = ?');
    values.push(data.cpf);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }
  if (data.isAdmin !== undefined) {
    fields.push('is_admin = ?');
    values.push(!!data.isAdmin);
  }
  if (data.hashedPassword !== undefined) {
    fields.push('hashed_password = ?');
    values.push(data.hashedPassword);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(id); // WHERE id = ?
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

async function listGrantsByUser(userId) {
  const res = await query('SELECT id, book_slug, status, granted_at, revoked_at FROM grants WHERE user_id=?', [userId]);
  const rows = res.rows || [];
  // Map to camelCase for JavaScript
  return rows.map(row => ({
    id: row.id,
    bookSlug: row.book_slug,
    status: row.status,
    grantedAt: row.granted_at,
    revokedAt: row.revoked_at
  }));
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
  updateUser,
  listGrantsByUser,
  insertAudit,
};
