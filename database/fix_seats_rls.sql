-- Corrigir políticas RLS para assentos (seats)
-- Execute este script no SQL Editor do Supabase

-- Adicionar política para permitir leitura de assentos
DROP POLICY IF EXISTS "Allow public read access to seats" ON seats;
CREATE POLICY "Allow public read access to seats" ON seats
  FOR SELECT USING (true);

-- Adicionar política para permitir atualização de assentos (se necessário)
DROP POLICY IF EXISTS "Allow public update seats" ON seats;
CREATE POLICY "Allow public update seats" ON seats
  FOR UPDATE USING (true);

-- Adicionar política para permitir exclusão de assentos (se necessário)
DROP POLICY IF EXISTS "Allow public delete seats" ON seats;
CREATE POLICY "Allow public delete seats" ON seats
  FOR DELETE USING (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'seats'
ORDER BY cmd;

