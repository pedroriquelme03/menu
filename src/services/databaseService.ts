import { supabase } from '../lib/supabase';
import { Table, Seat, MenuItem, Order, Payment } from '../types';

export class DatabaseService {
  // ===== TABLES =====
  static async getTables(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('number');

    if (error) {
      console.error('Erro ao buscar mesas:', error);
      return [];
    }

    return data?.map(table => ({
      id: table.id,
      number: table.number,
      token: table.token,
      capacity: table.capacity,
      isOccupied: table.is_occupied,
      sessionId: table.session_id,
      createdAt: new Date(table.created_at)
    })) || [];
  }

  static async createTable(table: Omit<Table, 'id' | 'createdAt'>): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        number: table.number,
        token: table.token,
        capacity: table.capacity,
        is_occupied: table.isOccupied,
        session_id: table.sessionId
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar mesa:', error);
      return null;
    }

    return {
      id: data.id,
      number: data.number,
      token: data.token,
      capacity: data.capacity,
      isOccupied: data.is_occupied,
      sessionId: data.session_id,
      createdAt: new Date(data.created_at)
    };
  }

  static async updateTable(id: string, updates: Partial<Table>): Promise<boolean> {
    const { error } = await supabase
      .from('tables')
      .update({
        number: updates.number,
        token: updates.token,
        capacity: updates.capacity,
        is_occupied: updates.isOccupied,
        session_id: updates.sessionId
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar mesa:', error);
      return false;
    }

    return true;
  }

  static async occupyTable(id: string, sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tables')
      .update({
        is_occupied: true,
        session_id: sessionId
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao ocupar mesa:', error);
      return false;
    }

    return true;
  }

  static async freeTable(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tables')
      .update({
        is_occupied: false,
        session_id: null
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao liberar mesa:', error);
      return false;
    }

    return true;
  }

  // ===== SEATS =====
  static async getSeats(): Promise<Seat[]> {
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .order('joined_at');

    if (error) {
      console.error('Erro ao buscar assentos:', error);
      return [];
    }

    return data?.map(seat => ({
      id: seat.id,
      tableId: seat.table_id,
      seatNumber: seat.seat_number,
      guestName: seat.guest_name,
      deviceId: seat.device_id,
      joinedAt: new Date(seat.joined_at)
    })) || [];
  }

  static async createSeat(seat: Omit<Seat, 'id' | 'joinedAt'>): Promise<Seat | null> {
    const { data, error } = await supabase
      .from('seats')
      .insert({
        table_id: seat.tableId,
        seat_number: seat.seatNumber,
        guest_name: seat.guestName,
        device_id: seat.deviceId
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar assento:', error);
      return null;
    }

    return {
      id: data.id,
      tableId: data.table_id,
      seatNumber: data.seat_number,
      guestName: data.guest_name,
      deviceId: data.device_id,
      joinedAt: new Date(data.joined_at)
    };
  }

  static async deleteSeat(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('seats')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar assento:', error);
      return false;
    }

    return true;
  }

  // ===== MENU ITEMS =====
  static async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

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
      modifiers: [] // Por enquanto vazio, pode ser expandido depois
    })) || [];
  }

  static async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image_url: item.imageUrl,
        is_available: item.isAvailable
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar item do menu:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.image_url,
      isAvailable: data.is_available,
      modifiers: []
    };
  }

  static async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        category: updates.category,
        image_url: updates.imageUrl,
        is_available: updates.isAvailable
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar item do menu:', error);
      return false;
    }

    return true;
  }

  static async deleteMenuItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar item do menu:', error);
      return false;
    }

    return true;
  }

  // ===== ORDERS =====
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }

    return data?.map(order => ({
      id: order.id,
      tableId: order.table_id,
      seatId: order.seat_id,
      items: order.items || [],
      subtotal: order.subtotal,
      status: order.status as any,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      notes: order.notes,
      orderType: 'table' as const
    })) || [];
  }

  static async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        table_id: order.tableId,
        seat_id: order.seatId,
        items: order.items,
        subtotal: order.subtotal,
        status: order.status,
        notes: order.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pedido:', error);
      return null;
    }

    return {
      id: data.id,
      tableId: data.table_id,
      seatId: data.seat_id,
      items: data.items || [],
      subtotal: data.subtotal,
      status: data.status as any,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes,
      orderType: 'table' as const
    };
  }

  static async updateOrderStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return false;
    }

    return true;
  }

  // ===== PAYMENTS =====
  static async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pagamentos:', error);
      return [];
    }

    return data?.map(payment => ({
      id: payment.id,
      tableId: payment.table_id,
      seatId: payment.seat_id,
      amount: payment.amount,
      method: payment.method as any,
      status: payment.status as any,
      createdAt: new Date(payment.created_at)
    })) || [];
  }

  static async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        table_id: payment.tableId,
        seat_id: payment.seatId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pagamento:', error);
      return null;
    }

    return {
      id: data.id,
      tableId: data.table_id,
      seatId: data.seat_id,
      amount: data.amount,
      method: data.method as any,
      status: data.status as any,
      createdAt: new Date(data.created_at)
    };
  }

  // ===== INITIALIZATION =====
  static async initializeDatabase(): Promise<void> {
    try {
      // Verificar se já existem dados
      const { data: existingTables } = await supabase
        .from('tables')
        .select('count')
        .limit(1);

      if (existingTables && existingTables.length > 0) {
        console.log('Banco de dados já inicializado');
        return;
      }

      console.log('Inicializando banco de dados...');
      
      // Criar tabelas padrão
      const defaultTables = [
        { number: 1, capacity: 4 },
        { number: 2, capacity: 4 },
        { number: 3, capacity: 6 },
        { number: 4, capacity: 6 },
        { number: 5, capacity: 8 },
        { number: 6, capacity: 8 },
        { number: 7, capacity: 4 },
        { number: 8, capacity: 4 },
        { number: 9, capacity: 6 },
        { number: 10, capacity: 6 }
      ];

      for (const table of defaultTables) {
        await this.createTable({
          ...table,
          token: `table-${table.number}-${Math.random().toString(36).substr(2, 8)}`,
          isOccupied: false,
          sessionId: undefined
        });
      }

      // Criar itens do menu padrão
      const defaultMenuItems = [
        {
          name: "Bruschetta Tradicional",
          description: "Pão italiano tostado com tomate, manjericão e azeite extra virgem",
          price: 24.90,
          category: "Entradas",
          imageUrl: "https://images.pexels.com/photos/5840071/pexels-photo-5840071.jpeg",
          isAvailable: true
        },
        {
          name: "Hambúrguer Artesanal",
          description: "Blend da casa 180g, queijo, alface, tomate e batata rústica",
          price: 42.90,
          category: "Pratos Principais",
          imageUrl: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
          isAvailable: true
        },
        {
          name: "Coca-Cola",
          description: "Refrigerante gelado 350ml",
          price: 8.90,
          category: "Bebidas",
          imageUrl: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg",
          isAvailable: true
        }
      ];

      for (const item of defaultMenuItems) {
        await this.createMenuItem(item);
      }

      console.log('Banco de dados inicializado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
    }
  }
}
