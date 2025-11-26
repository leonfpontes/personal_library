// Migration script to add is_admin column
require('dotenv').config();
const { query } = require('../auth/db');

async function runMigration() {
  console.log('🚀 Running migration to add is_admin column...');
  
  try {
    // Add the column
    console.log('📦 Adding is_admin column...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE', []);
    console.log('✅ Added is_admin column');
    
    // Create index
    console.log('📦 Creating index...');
    await query('CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin)', []);
    console.log('✅ Created index on is_admin');
    
    console.log('✅ Migration completed successfully!');
    console.log('🔧 Now you can use is_admin column in your queries');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
