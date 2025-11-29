require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.error('❌ Uso: node scripts/reset-password.js EMAIL NOVA_SENHA');
    console.log('\nExemplo:');
    console.log('  node scripts/reset-password.js leonfpontes@gmail.com minhasenha456');
    process.exit(1);
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n=== Redefinindo Senha ===');
  console.log('Email:', email);
  console.log('Nova senha:', newPassword);
  console.log('\n');
  
  // Verificar se usuário existe
  const rows = await sql`SELECT id, email FROM users WHERE email=${email.toLowerCase()}`;
  
  if (rows.length === 0) {
    console.log('❌ Usuário não encontrado');
    process.exit(1);
  }
  
  const user = rows[0];
  console.log('✅ Usuário encontrado:', user.id);
  
  // Gerar novo hash
  console.log('🔒 Gerando novo hash...');
  const newHash = await bcrypt.hash(newPassword, 10);
  
  // Atualizar no banco
  await sql`UPDATE users SET hashed_password=${newHash} WHERE id=${user.id}`;
  
  console.log('✅ Senha atualizada com sucesso!\n');
  console.log('=== Novas Credenciais ===');
  console.log('Email:', email);
  console.log('Senha:', newPassword);
  console.log('\n💡 Use estas credenciais para fazer login.');
}

resetPassword().catch(e => {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
});
