-- PostgreSQL Migrations for Personal Library Auth
-- Adapted from SQLite schema for Neon/Vercel Postgres

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL CHECK (length(nome) BETWEEN 3 AND 100),
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  hashed_password TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','inactive')),
  created_at BIGINT NOT NULL,
  last_access_at BIGINT NOT NULL,
  consent_at BIGINT NOT NULL,
  CONSTRAINT cpf_format CHECK (cpf ~ '^[0-9]{11}$')
);

-- Users indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Grants table
CREATE TABLE IF NOT EXISTS grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL CHECK (book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')),
  status TEXT NOT NULL CHECK (status IN ('active','revoked')),
  granted_at BIGINT NOT NULL,
  revoked_at BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Grants indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_grants_user_book ON grants(user_id, book_slug);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  revoked_at BIGINT,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('login_success','login_failure','access_granted','access_denied','copy_attempt','logout')),
  book_slug TEXT CHECK (book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')),
  timestamp BIGINT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit Log indexes
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_book ON audit_log(book_slug);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
