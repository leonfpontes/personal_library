-- SQLite Migrations for Personal Library Auth
-- Run these in order on the edge/serverless SQLite instance (e.g., Turso)

PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- UUID v4
  nome TEXT NOT NULL CHECK (length(nome) BETWEEN 3 AND 100),
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  hashed_password TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','inactive')),
  created_at INTEGER NOT NULL,
  last_access_at INTEGER NOT NULL,
  consent_at INTEGER NOT NULL,
  CONSTRAINT cpf_format CHECK (cpf GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Grants
CREATE TABLE IF NOT EXISTS grants (
  id TEXT PRIMARY KEY, -- UUID v4
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL CHECK (book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')),
  status TEXT NOT NULL CHECK (status IN ('active','revoked')),
  granted_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_grants_user_book ON grants(user_id, book_slug);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- UUID v4
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('login_success','login_failure','access_granted','access_denied','copy_attempt','logout')),
  book_slug TEXT CHECK (book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')),
  timestamp INTEGER NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_book ON audit_log(book_slug);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);

-- Seed Admin (example; replace values before running in prod)
-- INSERT INTO users (id,nome,cpf,email,hashed_password,status,created_at,last_access_at,consent_at)
-- VALUES ('admin-uuid','Administrador','00000000000','admin@library.local','$2a$10$hash','active',strftime('%s','now'),strftime('%s','now'),strftime('%s','now'));

-- Example grant
-- INSERT INTO grants (id,user_id,book_slug,status,granted_at)
-- VALUES ('g1','admin-uuid','vivencia_pombogira','active',strftime('%s','now'));
