import { supabase } from '../lib/supabase';
import { Reservation, ReservationStatus } from '../types';

export class ReservationService {
  private static mapReservation(row: any): Reservation {
    return {
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email || undefined,
      partySize: row.party_size,
      reservedAt: new Date(row.reserved_at),
      notes: row.notes || undefined,
      tableId: row.table_id || undefined,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  static async getReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('reserved_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }

    return data?.map((row) => this.mapReservation(row)) || [];
  }

  static async createReservation(input: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    partySize: number;
    reservedAt: Date;
    notes?: string;
  }): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        customer_name: input.customerName.trim(),
        customer_phone: input.customerPhone.trim(),
        customer_email: input.customerEmail?.trim() || null,
        party_size: input.partySize,
        reserved_at: input.reservedAt.toISOString(),
        notes: input.notes?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar reserva:', error);
      return null;
    }

    return this.mapReservation(data);
  }

  static async updateStatus(
    id: string,
    status: ReservationStatus,
    tableId?: string | null
  ): Promise<Reservation | null> {
    const payload: Record<string, unknown> = { status };
    if (tableId !== undefined) {
      payload.table_id = tableId;
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar reserva:', error);
      return null;
    }

    return this.mapReservation(data);
  }
}
