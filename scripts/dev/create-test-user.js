require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Dados do usuário de teste
    const userId = uuidv4();
    const nome = 'João Silva';
    const email = 'joao@test.com';
    const cpf = '12345678901';
    const password = 'teste123';
    const status = 'active';
    
    console.log('=== Criando Usuário de Teste ===\n');
    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('CPF:', cpf);
    console.log('Senha:', password);
    console.log('Status:', status);
    console.log('\n---\n');
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = Math.floor(Date.now() / 1000); // Unix timestamp
    
    // Inserir usuário
    await sql`
      INSERT INTO users (id, nome, cpf, email, hashed_password, status, created_at, last_access_at, consent_at)
      VALUES (
        ${userId},
        ${nome},
        ${cpf},
        ${email.toLowerCase()},
        ${hashedPassword},
        ${status},
        ${createdAt},
        ${createdAt},
        ${createdAt}
      )
    `;
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('ID:', userId);
    
    console.log('\n=== Resumo ===\n');
    console.log('Use estas credenciais para testar:');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    console.log('\nObs: Para dar acesso aos livros, use o painel de administração.');
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

createTestUser();
