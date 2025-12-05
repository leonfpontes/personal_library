require('dotenv').config({ path: '.env.local' });
const { getUserByEmail } = require('./auth/db');

async function debug() {
  try {
    console.log('=== DEBUG LOGIN ===\n');
    
    console.log('Testando getUserByEmail:');
    const email = 'leonfpontes@gmail.com';
    console.log(`Buscando: ${email}`);
    const user = await getUserByEmail(email);
    console.log('Usuário encontrado:', user ? 'SIM' : 'NÃO');
    if (user) {
      console.log('Dados:', JSON.stringify({
        id: user.id,
        email: user.email,
        status: user.status,
        nome: user.nome
      }, null, 2));
    }
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

debug();
