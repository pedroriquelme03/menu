import { supabase } from '../lib/supabase';
import { WaiterCall } from '../types';

export class WaiterCallService {
  private static mapCall(row: any): WaiterCall {
    return {
      id: row.id,
      tableId: row.table_id,
      seatId: row.seat_id || undefined,
      reason: row.reason || 'assistencia',
      status: row.status,
      createdAt: new Date(row.created_at),
      attendedAt: row.attended_at ? new Date(row.attended_at) : undefined,
    };
  }

  static async getPendingCalls(): Promise<WaiterCall[]> {
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar chamados de garçom:', error);
      return [];
    }

    return data?.map((row) => this.mapCall(row)) || [];
  }

  static async getPendingCallForTable(tableId: string): Promise<WaiterCall | null> {
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*')
      .eq('table_id', tableId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar chamado da mesa:', error);
      return null;
    }

    return data ? this.mapCall(data) : null;
  }

  static async callWaiter(params: {
    tableId: string;
    seatId?: string;
    reason?: string;
  }): Promise<WaiterCall | null> {
    const existing = await this.getPendingCallForTable(params.tableId);
    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('waiter_calls')
      .insert({
        table_id: params.tableId,
        seat_id: params.seatId || null,
        reason: params.reason || 'assistencia',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao chamar garçom:', error);
      return null;
    }

    return this.mapCall(data);
  }

  static async attendCall(callId: string): Promise<boolean> {
    const { error } = await supabase
      .from('waiter_calls')
      .update({
        status: 'attended',
        attended_at: new Date().toISOString(),
      })
      .eq('id', callId);

    if (error) {
      console.error('Erro ao atender chamado:', error);
      return false;
    }

    return true;
  }
}
