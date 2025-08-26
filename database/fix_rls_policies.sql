-- Corrigir políticas RLS para permitir inserção de mesas e itens do menu
-- Execute este script no SQL Editor do Supabase

-- Adicionar política para permitir inserção de mesas
CREATE POLICY "Allow public insert to tables" ON tables
  FOR INSERT WITH CHECK (true);

-- Adicionar política para permitir inserção de itens do menu
CREATE POLICY "Allow public insert to menu items" ON menu_items
  FOR INSERT WITH CHECK (true);

-- Adicionar política para permitir atualização de itens do menu
CREATE POLICY "Allow public update menu items" ON menu_items
  FOR UPDATE USING (true);

-- Adicionar política para permitir exclusão de itens do menu
CREATE POLICY "Allow public delete menu items" ON menu_items
  FOR DELETE USING (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('tables', 'menu_items')
ORDER BY tablename, cmd;
