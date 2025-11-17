-- Script SQL para adicionar coluna de senha na tabela users
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna password (hash bcrypt será armazenado como texto)
-- ⚠️ IMPORTANTE: As senhas são automaticamente hasheadas pelo sistema
-- Nunca armazene senhas em texto plano!
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Criar índice para melhorar performance de busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- NOTA: Não atualize senhas diretamente aqui!
-- Use a interface do sistema que faz hash automaticamente com bcrypt
-- O sistema migra automaticamente senhas em texto plano para hash

