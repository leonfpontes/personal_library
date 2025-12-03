/**
 * Script de diagnóstico para falhas de login.
 * Executa verificações em cascata:
 * 1. Carregamento de variáveis de ambiente.
 * 2. Conectividade com banco Neon.
 * 3. Presença das tabelas mínimas.
 * 4. Existência do usuário informado.
 * 5. Validação da senha fornecida.
 * 6. Teste de criação de sessão (opcional) e geração de JWT.
 *
 * Uso:
 *   node scripts/diagnose-login.js --email leonfpontes@gmail.com --password changeme123
 *
 * Saída: relatório estruturado com status PASS/FAIL por etapa.
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      out[key] = val;
    }
  }
  return out;
}

function requiredEnv(name) {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : null;
}

async function main() {
  const args = parseArgs();
  const email = args.email || process.env.DIAG_EMAIL;
  const password = args.password || process.env.DIAG_PASSWORD;
  const report = [];

  // 1. Variáveis de ambiente
  const dbUrl = requiredEnv('DATABASE_URL');
  const jwtSecret = requiredEnv('JWT_SECRET');
  const ttl = parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10);
  report.push({ step: 'env.DATABASE_URL', pass: !!dbUrl, detail: dbUrl ? 'OK' : 'Ausente' });
  report.push({ step: 'env.JWT_SECRET', pass: !!jwtSecret, detail: jwtSecret ? 'OK' : 'Ausente' });
  report.push({ step: 'env.SESSION_TTL_SECONDS', pass: ttl > 0, detail: `TTL=${ttl}` });

  if (!dbUrl || !jwtSecret) {
    printReport(report);
    console.error('\n❌ Falha crítica: variáveis de ambiente faltando. Crie .env.local.');
    process.exit(1);
  }

  // 2. Conexão com banco
  let sql;
  try {
    sql = neon(dbUrl);
    await sql`SELECT 1`;
    report.push({ step: 'db.connection', pass: true, detail: 'Conexão OK' });
  } catch (e) {
    report.push({ step: 'db.connection', pass: false, detail: e.message });
    printReport(report);
    console.error('\n❌ Não foi possível conectar no banco.');
    process.exit(1);
  }

  // 3. Verificar tabelas mínimas
  const requiredTables = ['users', 'grants', 'sessions', 'audit_log'];
  try {
    const tablesRes = await sql`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'`;
    const existing = tablesRes.map(r => r.tablename);
    requiredTables.forEach(t => {
      report.push({ step: `db.table.${t}`, pass: existing.includes(t), detail: existing.includes(t) ? 'OK' : 'Inexistente' });
    });
  } catch (e) {
    report.push({ step: 'db.tables', pass: false, detail: e.message });
  }

  // 4. Usuário
  if (!email) {
    report.push({ step: 'user.lookup', pass: false, detail: 'Email não informado (--email)' });
    printReport(report);
    process.exit(1);
  }
  let user;
  try {
    const rows = await sql`SELECT id, email, hashed_password, status FROM users WHERE email=${email.toLowerCase()}`;
    user = rows[0];
    report.push({ step: 'user.exists', pass: !!user, detail: user ? `id=${user.id}` : 'Não encontrado' });
  } catch (e) {
    report.push({ step: 'user.exists', pass: false, detail: e.message });
  }

  // 5. Senha
  if (user && password) {
    try {
      const ok = await bcrypt.compare(password, user.hashed_password);
      report.push({ step: 'user.password', pass: ok, detail: ok ? 'Correta' : 'Incorreta' });
    } catch (e) {
      report.push({ step: 'user.password', pass: false, detail: e.message });
    }
  } else if (user && !password) {
    report.push({ step: 'user.password', pass: false, detail: 'Senha não fornecida (--password)' });
  }

  // 6. Sessão/JWT (opcional se usuário válido e senha válida)
  if (user && report.find(r => r.step === 'user.password')?.pass) {
    try {
      const sessionId = uuidv4();
      const now = Math.floor(Date.now() / 1000);
      await sql`INSERT INTO sessions (id, user_id, created_at, expires_at, ip_hash, user_agent) VALUES (${sessionId}, ${user.id}, ${now}, ${now + ttl}, ${null}, ${'diagnose-script'})`;
      const token = jwt.sign({ sessionId, userId: user.id }, jwtSecret, { expiresIn: ttl });
      report.push({ step: 'session.insert', pass: true, detail: `sessionId=${sessionId}` });
      report.push({ step: 'jwt.generate', pass: !!token, detail: 'OK' });
    } catch (e) {
      report.push({ step: 'session.insert', pass: false, detail: e.message });
    }
  }

  printReport(report);

  const failed = report.filter(r => !r.pass);
  if (failed.length) {
    console.error(`\n❌ Diagnóstico encontrou ${failed.length} falha(s).`);
    suggestFixes(failed);
    process.exit(1);
  } else {
    console.log('\n✅ Todas as etapas passaram. Se ainda há ERR_CONNECTION_REFUSED, o servidor não está ativo ou porta em conflito.');
  }
}

function printReport(items) {
  console.log('\n=== Diagnóstico Login ===');
  for (const r of items) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.step}  → ${r.detail}`);
  }
}

function suggestFixes(failed) {
  console.log('\n=== Sugestões ===');
  for (const f of failed) {
    switch (f.step) {
      case 'env.DATABASE_URL':
        console.log('- Criar .env.local com DATABASE_URL (string Neon com -pooler).');
        break;
      case 'env.JWT_SECRET':
        console.log('- Adicionar JWT_SECRET (openssl rand -base64 32).');
        break;
      case 'db.connection':
        console.log('- Verificar conexão Neon (projeto não pausado / firewall).');
        break;
      default:
        if (f.step.startsWith('db.table.')) {
          console.log('- Rodar: node migrate-postgres.js (tabelas ausentes).');
        } else if (f.step === 'user.exists') {
          console.log('- Criar usuário: usar script seed ou painel admin para criar email informado.');
        } else if (f.step === 'user.password') {
          console.log('- Verificar senha digitada ou redefinir a senha via dashboard admin.');
        } else if (f.step === 'session.insert') {
          console.log('- Checar estrutura da tabela sessions (colunas e permissões).');
        }
        break;
    }
  }
}

main().catch(e => {
  console.error('Erro inesperado:', e);
  process.exit(1);
});
