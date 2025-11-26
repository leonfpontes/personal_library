-- Add is_admin column to users table
-- Migration: add_is_admin_column
-- Date: 2025-11-26

-- Add the column with default value FALSE
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Update existing 'admin' user if needed
-- UPDATE users SET is_admin = TRUE WHERE id = 'admin';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
