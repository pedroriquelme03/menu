-- Script para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de mesas
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assentos
CREATE TABLE IF NOT EXISTS seats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  seat_number INTEGER,
  guest_name TEXT,
  device_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do menu
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  seat_id UUID REFERENCES seats(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'pix')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_orders (
  id TEXT PRIMARY KEY, -- ID do pedido vindo do n8n
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'pix')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(number);
CREATE INDEX IF NOT EXISTS idx_tables_token ON tables(token);
CREATE INDEX IF NOT EXISTS idx_seats_table_id ON seats(table_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_table_id ON payments(table_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_status ON whatsapp_orders(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_customer_phone ON whatsapp_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_created_at ON whatsapp_orders(created_at);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_orders_updated_at 
  BEFORE UPDATE ON whatsapp_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_orders ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de mesas e menu
CREATE POLICY "Allow public read access to tables" ON tables
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to tables" ON tables
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to menu items" ON menu_items
  FOR SELECT USING (true);

-- Política para permitir inserção de assentos
CREATE POLICY "Allow public insert to seats" ON seats
  FOR INSERT WITH CHECK (true);

-- Política para permitir inserção de pedidos
CREATE POLICY "Allow public insert to orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Política para permitir inserção de pagamentos
CREATE POLICY "Allow public insert to payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização de pedidos
CREATE POLICY "Allow public update orders" ON orders
  FOR UPDATE USING (true);

-- Política para permitir atualização de mesas
CREATE POLICY "Allow public update tables" ON tables
  FOR UPDATE USING (true);

-- Políticas para pedidos WhatsApp
CREATE POLICY "Allow public read access to whatsapp orders" ON whatsapp_orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to whatsapp orders" ON whatsapp_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update whatsapp orders" ON whatsapp_orders
  FOR UPDATE USING (true);
