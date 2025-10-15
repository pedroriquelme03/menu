import { supabase } from '../lib/supabase';
import { WhatsAppOrder, WhatsAppOrderItem, WhatsAppWebhookPayload, MenuItem } from '../types';

export class WhatsAppService {
  // ===== WEBHOOK HANDLING =====
  static async processWebhookPayload(payload: WhatsAppWebhookPayload): Promise<WhatsAppOrder | null> {
    try {
      console.log('Processando webhook WhatsApp:', payload);

      // Buscar itens do menu para criar snapshots
      const menuItems = await this.getMenuItems();
      const menuItemsMap = new Map(menuItems.map(item => [item.id, item]));

      // Criar itens do pedido com snapshots
      const orderItems: WhatsAppOrderItem[] = payload.items.map(item => {
        const menuItem = menuItemsMap.get(item.menuItemId);
        if (!menuItem) {
          throw new Error(`Item do menu não encontrado: ${item.menuItemId}`);
        }

        return {
          id: `${payload.orderId}-${item.menuItemId}-${Date.now()}`,
          menuItemId: item.menuItemId,
          menuItemSnapshot: menuItem,
          quantity: item.quantity,
          notes: item.notes,
          customizations: item.customizations || []
        };
      });

      // Calcular subtotal
      const subtotal = orderItems.reduce((sum, item) => 
        sum + (item.menuItemSnapshot.price * item.quantity), 0
      );

      // Criar pedido WhatsApp
      const whatsappOrder: WhatsAppOrder = {
        id: payload.orderId,
        customerPhone: payload.customerPhone,
        customerName: payload.customerName,
        customerAddress: payload.customerAddress,
        items: orderItems,
        subtotal,
        deliveryFee: 0, // Configurável
        total: subtotal,
        status: 'pending',
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'pending',
        notes: payload.notes,
        createdAt: new Date(payload.timestamp),
        updatedAt: new Date(payload.timestamp)
      };

      // Salvar no banco de dados
      const savedOrder = await this.createWhatsAppOrder(whatsappOrder);
      
      if (savedOrder) {
        console.log('Pedido WhatsApp criado com sucesso:', savedOrder.id);
        return savedOrder;
      }

      return null;
    } catch (error) {
      console.error('Erro ao processar webhook WhatsApp:', error);
      return null;
    }
  }

  // ===== DATABASE OPERATIONS =====
  static async getWhatsAppOrders(): Promise<WhatsAppOrder[]> {
    const { data, error } = await supabase
      .from('whatsapp_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos WhatsApp:', error);
      return [];
    }

    return data?.map(order => ({
      id: order.id,
      customerPhone: order.customer_phone,
      customerName: order.customer_name,
      customerAddress: order.customer_address,
      items: order.items || [],
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      notes: order.notes,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      estimatedDeliveryTime: order.estimated_delivery_time ? new Date(order.estimated_delivery_time) : undefined
    })) || [];
  }

  static async createWhatsAppOrder(order: WhatsAppOrder): Promise<WhatsAppOrder | null> {
    const { data, error } = await supabase
      .from('whatsapp_orders')
      .insert({
        id: order.id,
        customer_phone: order.customerPhone,
        customer_name: order.customerName,
        customer_address: order.customerAddress,
        items: order.items,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        total: order.total,
        status: order.status,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        notes: order.notes,
        estimated_delivery_time: order.estimatedDeliveryTime?.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pedido WhatsApp:', error);
      return null;
    }

    return {
      id: data.id,
      customerPhone: data.customer_phone,
      customerName: data.customer_name,
      customerAddress: data.customer_address,
      items: data.items || [],
      subtotal: data.subtotal,
      deliveryFee: data.delivery_fee,
      total: data.total,
      status: data.status,
      paymentMethod: data.payment_method,
      paymentStatus: data.payment_status,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      estimatedDeliveryTime: data.estimated_delivery_time ? new Date(data.estimated_delivery_time) : undefined
    };
  }

  static async updateWhatsAppOrderStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do pedido WhatsApp:', error);
      return false;
    }

    return true;
  }

  static async updatePaymentStatus(id: string, paymentStatus: string): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      return false;
    }

    return true;
  }

  // ===== HELPER METHODS =====
  private static async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);

    if (error) {
      console.error('Erro ao buscar itens do menu:', error);
      return [];
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.image_url,
      isAvailable: item.is_available,
      modifiers: []
    })) || [];
  }

  // ===== WEBHOOK ENDPOINT SIMULATION =====
  static async simulateWebhook(payload: WhatsAppWebhookPayload): Promise<WhatsAppOrder | null> {
    // Este método simula o recebimento de um webhook
    // Em produção, isso seria chamado pelo endpoint do n8n
    return await this.processWebhookPayload(payload);
  }
}
