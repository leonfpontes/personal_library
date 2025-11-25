const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL not set');
  
  const sql = neon(databaseUrl);

  const adminId = 'admin';
  const adminEmail = 'admin@library.local';
  const adminPassword = 'changeme123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const now = Math.floor(Date.now() / 1000);

  await sql`
    INSERT INTO users (id,nome,cpf,email,hashed_password,status,created_at,last_access_at,consent_at) 
    VALUES (${adminId}, ${'Administrador'}, ${'00000000000'}, ${adminEmail.toLowerCase()}, ${hashedPassword}, ${'active'}, ${now}, ${now}, ${now})
    ON CONFLICT (email) DO UPDATE SET hashed_password = ${hashedPassword}
  `;

  console.log('✅ Admin criado:', adminEmail, '/', adminPassword);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
