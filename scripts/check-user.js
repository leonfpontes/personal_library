require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function checkUser() {
  const email = process.argv[2] || 'leonfpontes@gmail.com';
  const password = process.argv[3] || 'changeme123';
  
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n=== Verificando usuário ===');
  console.log('Email:', email);
  console.log('Senha fornecida:', password);
  console.log('\n');
  
  const rows = await sql`SELECT id, email, status, hashed_password FROM users WHERE email=${email.toLowerCase()}`;
  
  if (rows.length === 0) {
    console.log('❌ USUÁRIO NÃO ENCONTRADO NO BANCO');
    console.log('\nTodos os emails cadastrados:');
    const all = await sql`SELECT email FROM users`;
    all.forEach(u => console.log(' -', u.email));
    return;
  }
  
  const user = rows[0];
  console.log('✅ Usuário encontrado:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Status:', user.status);
  console.log('   Hash (primeiros 20):', user.hashed_password.substring(0, 20));
  
  console.log('\n=== Testando senha ===');
  const match = await bcrypt.compare(password, user.hashed_password);
  console.log(match ? '✅ SENHA CORRETA' : '❌ SENHA INCORRETA');
  
  if (!match) {
    console.log('\n💡 A senha fornecida não corresponde ao hash armazenado.');
    console.log('   Verifique se a senha foi alterada no banco de produção.');
  }
}

checkUser().catch(e => {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
});
