-- Script para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de mesas
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  praca TEXT NOT NULL DEFAULT 'Salão',
  pos_x NUMERIC(6,2),
  pos_y NUMERIC(6,2),
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
  station TEXT NOT NULL DEFAULT 'kitchen' CHECK (station IN ('kitchen', 'cambuza')),
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

ALTER TABLE orders ADD COLUMN IF NOT EXISTS chase_alert BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS chased_at TIMESTAMP WITH TIME ZONE;

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
CREATE INDEX IF NOT EXISTS idx_tables_praca ON tables(praca);
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
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_whatsapp_orders_updated_at ON whatsapp_orders;
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

-- tables
DROP POLICY IF EXISTS "Allow public read access to tables" ON tables;
CREATE POLICY "Allow public read access to tables" ON tables FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert to tables" ON tables;
CREATE POLICY "Allow public insert to tables" ON tables FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update tables" ON tables;
CREATE POLICY "Allow public update tables" ON tables FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete tables" ON tables;
CREATE POLICY "Allow public delete tables" ON tables FOR DELETE USING (true);

-- seats
DROP POLICY IF EXISTS "Allow public read access to seats" ON seats;
CREATE POLICY "Allow public read access to seats" ON seats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert to seats" ON seats;
CREATE POLICY "Allow public insert to seats" ON seats FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update seats" ON seats;
CREATE POLICY "Allow public update seats" ON seats FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete seats" ON seats;
CREATE POLICY "Allow public delete seats" ON seats FOR DELETE USING (true);

-- menu_items
DROP POLICY IF EXISTS "Allow public read access to menu items" ON menu_items;
CREATE POLICY "Allow public read access to menu items" ON menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert to menu items" ON menu_items;
CREATE POLICY "Allow public insert to menu items" ON menu_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update menu items" ON menu_items;
CREATE POLICY "Allow public update menu items" ON menu_items FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete menu items" ON menu_items;
CREATE POLICY "Allow public delete menu items" ON menu_items FOR DELETE USING (true);

-- orders
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert to orders" ON orders;
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update orders" ON orders;
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);

-- payments
DROP POLICY IF EXISTS "Allow public read access to payments" ON payments;
CREATE POLICY "Allow public read access to payments" ON payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert to payments" ON payments;
CREATE POLICY "Allow public insert to payments" ON payments FOR INSERT WITH CHECK (true);

-- whatsapp_orders
DROP POLICY IF EXISTS "Allow public read access to whatsapp orders" ON whatsapp_orders;
CREATE POLICY "Allow public read access to whatsapp orders" ON whatsapp_orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert to whatsapp orders" ON whatsapp_orders;
CREATE POLICY "Allow public insert to whatsapp orders" ON whatsapp_orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update whatsapp orders" ON whatsapp_orders;
CREATE POLICY "Allow public update whatsapp orders" ON whatsapp_orders FOR UPDATE USING (true);

-- Chamados de garçom
CREATE TABLE IF NOT EXISTS waiter_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  seat_id UUID REFERENCES seats(id) ON DELETE SET NULL,
  reason TEXT DEFAULT 'assistencia',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_table_id ON waiter_calls(table_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_created_at ON waiter_calls(created_at DESC);

ALTER TABLE waiter_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read waiter calls" ON waiter_calls;
CREATE POLICY "Allow public read waiter calls" ON waiter_calls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert waiter calls" ON waiter_calls;
CREATE POLICY "Allow public insert waiter calls" ON waiter_calls FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update waiter calls" ON waiter_calls;
CREATE POLICY "Allow public update waiter calls" ON waiter_calls FOR UPDATE USING (true);

-- Reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  reserved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'refused', 'waiting_client', 'occupied', 'completed', 'cancelled')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_reserved_at ON reservations(reserved_at);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read reservations" ON reservations;
CREATE POLICY "Allow public read reservations" ON reservations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert reservations" ON reservations;
CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update reservations" ON reservations;
CREATE POLICY "Allow public update reservations" ON reservations FOR UPDATE USING (true);

-- Contas SaaS / trial
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('essencial', 'profissional', 'completo')),
  trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
  subscription_status TEXT NOT NULL DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_plan_id ON accounts(plan_id);
CREATE INDEX IF NOT EXISTS idx_accounts_trial_ends_at ON accounts(trial_ends_at);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own account" ON accounts;
CREATE POLICY "Users can read own account"
  ON accounts FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own account" ON accounts;
CREATE POLICY "Users can insert own account"
  ON accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own account" ON accounts;
CREATE POLICY "Users can update own account"
  ON accounts FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

