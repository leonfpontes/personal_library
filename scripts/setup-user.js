/**
 * Script para criar usuário e conceder acesso a livros de forma automatizada.
 * 
 * Uso:
 *   node scripts/setup-user.js --email SEU_EMAIL --password SUA_SENHA --nome "Seu Nome" --cpf 12345678901 --book vivencia_pombogira
 * 
 * Opções:
 *   --email      Email do usuário (obrigatório)
 *   --password   Senha do usuário (obrigatório)
 *   --nome       Nome completo (opcional, padrão: email sem domínio)
 *   --cpf        CPF (opcional, padrão: 00000000000)
 *   --book       Slug do livro para conceder acesso (opcional, pode repetir)
 *   --admin      Flag para tornar usuário admin (opcional)
 * 
 * Exemplo completo:
 *   node scripts/setup-user.js --email leonfpontes@gmail.com --password changeme123 --nome "Leon Pontes" --book vivencia_pombogira --book guia_de_ervas
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { books: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--book') {
      out.books.push(args[i + 1]);
      i++;
    } else if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      out[key] = val;
      if (val !== true) i++;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  
  if (!args.email || !args.password) {
    console.error('❌ Parâmetros obrigatórios: --email e --password');
    console.log('\nUso:');
    console.log('  node scripts/setup-user.js --email usuario@example.com --password senha123 [opções]');
    console.log('\nOpções:');
    console.log('  --nome "Nome Completo"    Nome do usuário');
    console.log('  --cpf 12345678901         CPF (11 dígitos)');
    console.log('  --book slug-do-livro      Conceder acesso ao livro (pode repetir)');
    console.log('  --admin                   Tornar usuário administrador');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const email = args.email.toLowerCase();
  const password = args.password;
  const nome = args.nome || email.split('@')[0];
  const cpf = args.cpf || '00000000000';
  const isAdmin = !!args.admin;
  const books = args.books || [];

  console.log('\n=== Configuração do Usuário ===\n');
  console.log('Email:', email);
  console.log('Nome:', nome);
  console.log('CPF:', cpf);
  console.log('Admin:', isAdmin ? 'Sim' : 'Não');
  console.log('Livros:', books.length ? books.join(', ') : 'Nenhum');
  console.log('\n---\n');

  // 1. Verificar se usuário já existe
  try {
    const existing = await sql`SELECT id, email FROM users WHERE email=${email}`;
    if (existing.length > 0) {
      console.log('⚠️  Usuário já existe:', existing[0].id);
      console.log('    Pulando criação de usuário...\n');
      
      // Se há livros, ainda concede grants
      if (books.length > 0) {
        const userId = existing[0].id;
        console.log('📚 Concedendo acessos aos livros...\n');
        for (const book of books) {
          try {
            const grantExists = await sql`SELECT id FROM grants WHERE user_id=${userId} AND book_slug=${book}`;
            if (grantExists.length > 0) {
              console.log(`   ✓ ${book} (já existia)`);
            } else {
              const grantId = uuidv4();
              const now = Math.floor(Date.now() / 1000);
              await sql`INSERT INTO grants (id, user_id, book_slug, status, granted_at, revoked_at) VALUES (${grantId}, ${userId}, ${book}, ${'active'}, ${now}, ${null})`;
              console.log(`   ✅ ${book} (concedido)`);
            }
          } catch (e) {
            console.log(`   ❌ ${book} (erro: ${e.message})`);
          }
        }
      }
      
      console.log('\n✅ Configuração concluída!\n');
      return;
    }
  } catch (e) {
    console.error('❌ Erro ao verificar usuário existente:', e.message);
    process.exit(1);
  }

  // 2. Criar usuário
  console.log('👤 Criando usuário...');
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = Math.floor(Date.now() / 1000);

  try {
    await sql`
      INSERT INTO users (id, nome, cpf, email, hashed_password, status, is_admin, created_at, last_access_at, consent_at)
      VALUES (${userId}, ${nome}, ${cpf}, ${email}, ${hashedPassword}, ${'active'}, ${isAdmin}, ${now}, ${now}, ${now})
    `;
    console.log('   ✅ Usuário criado:', userId);
  } catch (e) {
    console.error('   ❌ Erro ao criar usuário:', e.message);
    process.exit(1);
  }

  // 3. Conceder acessos aos livros
  if (books.length > 0) {
    console.log('\n📚 Concedendo acessos aos livros...\n');
    for (const book of books) {
      try {
        const grantId = uuidv4();
        await sql`
          INSERT INTO grants (id, user_id, book_slug, status, granted_at, revoked_at)
          VALUES (${grantId}, ${userId}, ${book}, ${'active'}, ${now}, ${null})
        `;
        console.log(`   ✅ ${book}`);
      } catch (e) {
        console.log(`   ❌ ${book} (erro: ${e.message})`);
      }
    }
  }

  console.log('\n✅ Usuário configurado com sucesso!\n');
  console.log('=== Credenciais ===\n');
  console.log(`Email:    ${email}`);
  console.log(`Senha:    ${password}`);
  console.log(`ID:       ${userId}`);
  console.log('\n🌐 Acesse: http://localhost:3000/auth/login.html\n');
}

main().catch(e => {
  console.error('\n❌ Erro inesperado:', e);
  process.exit(1);
});
