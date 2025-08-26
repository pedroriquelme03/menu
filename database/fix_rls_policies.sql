-- Corrigir políticas RLS para permitir inserção de mesas
-- Execute este script no SQL Editor do Supabase

-- Adicionar política para permitir inserção de mesas
CREATE POLICY "Allow public insert to tables" ON tables
  FOR INSERT WITH CHECK (true);

-- Verificar se a política foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tables';
