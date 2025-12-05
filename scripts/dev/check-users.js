require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkUsers() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const users = await sql`SELECT id, email, status, nome FROM users`;
    console.log('Usuários no banco:');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Erro:', err);
  }
}

checkUsers();
