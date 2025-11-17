-- Script SQL para inserir dados dos apartamentos no Supabase
-- Execute este script no SQL Editor do Supabase
-- 
-- Este script insere os dados dos moradores baseado na planilha fornecida
-- Apartamento 204 foi alterado para LIANE conforme solicitado

-- Opcional: Limpar dados existentes (descomente se quiser limpar antes de inserir)
-- DELETE FROM residents;

-- Inserir dados dos apartamentos
-- Usando INSERT com verificação para evitar duplicatas
INSERT INTO residents (owner_name, apartment_number, tenant_name) 
SELECT * FROM (VALUES 
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
  ('JOSÉ BENIGNO DOS SANTOS', 304, NULL)
) AS v(owner_name, apartment_number, tenant_name)
WHERE NOT EXISTS (
  SELECT 1 FROM residents r 
  WHERE r.apartment_number = v.apartment_number
);

-- Verificar os dados inseridos
SELECT apartment_number, owner_name, tenant_name, created_at 
FROM residents 
ORDER BY apartment_number;

