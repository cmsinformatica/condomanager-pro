-- Script SQL para configurar o banco de dados no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrador', 'Morador')),
  apartment_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de moradores
CREATE TABLE IF NOT EXISTS residents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_name TEXT NOT NULL,
  tenant_name TEXT,
  apartment_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_number INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir leitura/escrita pública
-- ⚠️ ATENÇÃO: Para produção, ajuste essas políticas conforme sua necessidade de segurança
CREATE POLICY "Allow all operations for users" ON users 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for residents" ON residents 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for payments" ON payments 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for expenses" ON expenses 
  FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados iniciais (opcional)
INSERT INTO users (name, email, role, apartment_number) VALUES 
  ('Usuário Administrador', 'admin@condo.com', 'Administrador', NULL),
  ('Alice Silva', 'alice@email.com', 'Morador', 1)
ON CONFLICT (email) DO NOTHING;

INSERT INTO residents (owner_name, apartment_number, tenant_name) VALUES 
  ('Alice Silva', 1, 'João da Silva'),
  ('Roberto Souza', 2, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO payments (apartment_number, amount, date, month, year) VALUES 
  (1, 500.00, NOW() - INTERVAL '1 month', EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER),
  (2, 500.00, NOW() - INTERVAL '1 month', EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER),
  (1, 500.00, NOW(), (EXTRACT(MONTH FROM NOW())::INTEGER + 1), EXTRACT(YEAR FROM NOW())::INTEGER)
ON CONFLICT DO NOTHING;

INSERT INTO expenses (description, amount, category, date) VALUES 
  ('Manutenção do Jardim', 350.00, 'Jardinagem', NOW()),
  ('Eletricidade do Hall', 600.00, 'Eletricidade', NOW())
ON CONFLICT DO NOTHING;

