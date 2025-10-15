import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const payload = req.body;
    
    // Validar payload básico
    if (!payload || !payload.customer_phone || !payload.items) {
      return res.status(400).json({
        success: false,
        error: 'Payload inválido: customer_phone e items são obrigatórios'
      });
    }

    // Buscar itens do menu para calcular preços
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price');

    if (menuError) {
      console.error('Erro ao buscar menu:', menuError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar menu'
      });
    }

    // Calcular subtotal
    let subtotal = 0;
    const processedItems = payload.items.map((item: any) => {
      const menuItem = menuItems.find(m => m.id === item.id);
      const price = menuItem?.price || 0;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        id: item.id,
        name: menuItem?.name || 'Item não encontrado',
        quantity: item.quantity,
        price: price,
        total: itemTotal
      };
    });

    const deliveryFee = payload.delivery_fee || 0;
    const total = subtotal + deliveryFee;

    // Inserir pedido no banco
    const { data: order, error: orderError } = await supabase
      .from('whatsapp_orders')
      .insert({
        customer_phone: payload.customer_phone,
        customer_name: payload.customer_name || 'Cliente WhatsApp',
        customer_address: payload.customer_address || '',
        items: processedItems,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        status: 'pending',
        payment_method: payload.payment_method || 'cash',
        payment_status: 'pending',
        notes: payload.notes || '',
        estimated_delivery_time: payload.estimated_delivery_time || null
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar pedido no banco'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pedido criado com sucesso',
      order_id: order.id,
      total: total
    });

  } catch (error) {
    console.error('Erro no webhook handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}
