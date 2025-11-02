-- Corrigir políticas RLS para pedidos (orders)
-- Execute este script no SQL Editor do Supabase

-- Adicionar política para permitir leitura de pedidos
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
CREATE POLICY "Allow public read access to orders" ON orders
  FOR SELECT USING (true);

-- Verificar se a política de inserção existe (já deve existir)
-- Se não existir, criaremos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Allow public insert to orders'
  ) THEN
    CREATE POLICY "Allow public insert to orders" ON orders
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Verificar se a política de atualização existe (já deve existir)
-- Se não existir, criaremos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Allow public update orders'
  ) THEN
    CREATE POLICY "Allow public update orders" ON orders
      FOR UPDATE USING (true);
  END IF;
END $$;

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY cmd;

