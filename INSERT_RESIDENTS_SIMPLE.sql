-- Script SQL SIMPLES para inserir dados dos apartamentos no Supabase
-- Execute este script no SQL Editor do Supabase
-- 
-- Este script insere os dados dos moradores baseado na planilha fornecida
-- Apartamento 204 foi alterado para LIANE conforme solicitado

-- Limpar dados existentes (opcional - descomente se necessário)
-- DELETE FROM residents WHERE apartment_number IN (1, 2, 3, 4, 101, 102, 103, 104, 201, 202, 203, 204, 301, 302, 303, 304);

-- Inserir dados dos apartamentos
INSERT INTO residents (owner_name, apartment_number, tenant_name) VALUES 
  ('BENEDITO DA S. SANTOS', 1, NULL),
  ('NAYARA S. DOS SANTOS', 2, NULL),
  ('SÉRGIO VINÍCIUS', 3, NULL),
  ('GERMANA C. DE ALMEIDA', 4, NULL),
  ('ANTONIO DE JESUS SANTOS', 101, NULL),
  ('GARDÊNIA MARQUES', 102, NULL),
  ('JOSETE PIRES', 103, NULL),
  ('CRISTIANO MARTINS', 104, NULL),
  ('ANDRÉ RAMOS', 201, NULL),
  ('ELIEL SANTOS', 202, NULL),
  ('ADÃO FERNANDEZ', 203, NULL),
  ('LIANE', 204, NULL),
  ('LISANDRA R. DE ARAÚJO', 301, NULL),
  ('CELIDALVA COSTA LIMA', 302, NULL),
  ('ANA MARIA ILVA', 303, NULL),
  ('JOSÉ BENIGNO DOS SANTOS', 304, NULL);

-- Verificar os dados inseridos
SELECT apartment_number, owner_name, tenant_name, created_at 
FROM residents 
ORDER BY apartment_number;

