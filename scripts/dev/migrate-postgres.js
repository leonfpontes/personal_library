const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('🔄 Aplicando migrations no PostgreSQL (Neon)...\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrado no ambiente');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    // Testar conexão
    console.log('🔌 Testando conexão...');
    await sql`SELECT 1 as test`;
    console.log('✅ Conexão OK\n');

    console.log('📋 Criando tabelas e índices...\n');

    // Users table
    console.log('   → users table...');
    await sql.query(`
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
      )
    `);

    console.log('   → users indexes...');
    await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`);

    // Grants table
    console.log('   → grants table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS grants (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_slug TEXT NOT NULL CHECK (book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')),
        status TEXT NOT NULL CHECK (status IN ('active','revoked')),
        granted_at BIGINT NOT NULL,
        revoked_at BIGINT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('   → grants indexes...');
    await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_grants_user_book ON grants(user_id, book_slug)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status)`);

    // Sessions table
    console.log('   → sessions table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        expires_at BIGINT NOT NULL,
        revoked_at BIGINT,
        ip_hash TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('   → sessions indexes...');
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at)`);

    // Audit Log table
    console.log('   → audit_log table...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL CHECK (action IN ('login_success','login_failure','access_granted','access_denied','copy_attempt','logout')),
        book_slug TEXT CHECK (book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')),
        timestamp BIGINT NOT NULL,
        ip_hash TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('   → audit_log indexes...');
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_audit_book ON audit_log(book_slug)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp)`);

    console.log('\n✅ Migrations aplicadas com sucesso!');
    console.log('\n📊 Verificando tabelas criadas...');

    const result = await sql.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    console.log('   Tabelas encontradas:');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(t => console.log(`   - ${t.tablename}`));
    }

    console.log('\n🎉 Pronto! Agora execute: node seed.js');

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migrations:');
    console.error(error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    process.exit(1);
  }
}

migrate();
