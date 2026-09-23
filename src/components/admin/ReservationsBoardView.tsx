import React, { useEffect, useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { ReservationService } from '../../services/reservationService';
import { Reservation, ReservationStatus } from '../../types';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Phone,
  RefreshCw,
  Armchair,
  UserRoundSearch,
} from 'lucide-react';

const COLUMNS: {
  id: ReservationStatus;
  label: string;
  header: string;
  accent: string;
  icon: typeof Clock;
}[] = [
  {
    id: 'pending',
    label: 'Solicitações',
    header: 'bg-amber-500',
    accent: 'border-amber-400',
    icon: Clock,
  },
  {
    id: 'accepted',
    label: 'Aceitas',
    header: 'bg-sky-500',
    accent: 'border-sky-400',
    icon: CheckCircle2,
  },
  {
    id: 'refused',
    label: 'Recusadas',
    header: 'bg-rose-500',
    accent: 'border-rose-400',
    icon: XCircle,
  },
  {
    id: 'occupied',
    label: 'Ocupadas agora',
    header: 'bg-violet-500',
    accent: 'border-violet-400',
    icon: Armchair,
  },
  {
    id: 'waiting_client',
    label: 'Aguardando cliente',
    header: 'bg-emerald-500',
    accent: 'border-emerald-400',
    icon: UserRoundSearch,
  },
];

function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function formatDateTime(date: Date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ReservationsBoardView: React.FC = () => {
  const { state } = useRestaurant();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState('');

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const data = await ReservationService.getReservations();
      setReservations(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
    const interval = setInterval(loadReservations, 8000);
    return () => clearInterval(interval);
  }, []);

  const freeTables = state.tables
    .filter((table) => !table.isOccupied)
    .sort((a, b) => a.number - b.number);

  const updateReservation = async (
    id: string,
    status: ReservationStatus,
    tableId?: string | null
  ) => {
    const updated = await ReservationService.updateStatus(id, status, tableId);
    if (updated) {
      setReservations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setAssigningId(null);
      setSelectedTableId('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <CalendarDays className="h-6 w-6 text-orange-600" />
            Reservas
          </h2>
          <p className="text-sm text-gray-500">
            Solicitações públicas em{' '}
            <a href="/reserva" target="_blank" rel="noreferrer" className="font-medium text-orange-600 hover:underline">
              /reserva
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={loadReservations}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const items = reservations
            .filter((reservation) => reservation.status === column.id)
            .sort(
              (a, b) => new Date(a.reservedAt).getTime() - new Date(b.reservedAt).getTime()
            );

          return (
            <section
              key={column.id}
              className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className={`flex items-center justify-between px-4 py-3 text-white ${column.header}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <h3 className="text-sm font-bold">{column.label}</h3>
                </div>
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-bold">
                  {items.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {items.length === 0 ? (
                  <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
                    Vazio
                  </div>
                ) : (
                  items.map((reservation) => {
                    const table = state.tables.find((t) => t.id === reservation.tableId);

                    return (
                      <article
                        key={reservation.id}
                        className={`rounded-xl border-l-4 bg-slate-50 p-3 shadow-sm ${column.accent}`}
                      >
                        <div className="mb-2">
                          <h4 className="font-bold text-gray-900">{reservation.customerName}</h4>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            {formatPhone(reservation.customerPhone)}
                          </p>
                        </div>

                        <div className="mb-3 space-y-1 text-xs text-gray-600">
                          <p className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {reservation.partySize}{' '}
                            {reservation.partySize === 1 ? 'pessoa' : 'pessoas'}
                          </p>
                          <p className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDateTime(reservation.reservedAt)}
                          </p>
                          {table && (
                            <p className="font-semibold text-orange-700">
                              Mesa {table.number}
                              {table.praca ? ` · ${table.praca}` : ''}
                            </p>
                          )}
                          {reservation.notes && (
                            <p className="rounded-lg bg-white px-2 py-1 italic text-amber-700">
                              {reservation.notes}
                            </p>
                          )}
                        </div>

                        {assigningId === reservation.id && (
                          <div className="mb-2 space-y-2 rounded-lg border border-sky-200 bg-sky-50 p-2">
                            <select
                              value={selectedTableId}
                              onChange={(e) => setSelectedTableId(e.target.value)}
                              className="w-full rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-xs"
                            >
                              <option value="">Selecionar mesa (opcional)</option>
                              {freeTables.map((tableOption) => (
                                <option key={tableOption.id} value={tableOption.id}>
                                  Mesa {tableOption.number} · {tableOption.praca} ·{' '}
                                  {tableOption.capacity}p
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateReservation(
                                    reservation.id,
                                    'accepted',
                                    selectedTableId || null
                                  )
                                }
                                className="flex-1 rounded-lg bg-sky-600 px-2 py-1.5 text-xs font-semibold text-white"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningId(null);
                                  setSelectedTableId('');
                                }}
                                className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningId(reservation.id);
                                  setSelectedTableId(reservation.tableId || '');
                                }}
                                className="rounded-lg bg-sky-600 px-2 py-1 text-xs font-semibold text-white"
                              >
                                Aceitar
                              </button>
                              <button
                                type="button"
                                onClick={() => updateReservation(reservation.id, 'refused')}
                                className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white"
                              >
                                Recusar
                              </button>
                            </>
                          )}

                          {reservation.status === 'accepted' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  updateReservation(reservation.id, 'waiting_client')
                                }
                                className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                              >
                                Aguardando
                              </button>
                              <button
                                type="button"
                                onClick={() => updateReservation(reservation.id, 'occupied')}
                                className="rounded-lg bg-violet-600 px-2 py-1 text-xs font-semibold text-white"
                              >
                                Ocupar
                              </button>
                            </>
                          )}

                          {reservation.status === 'waiting_client' && (
                            <button
                              type="button"
                              onClick={() => updateReservation(reservation.id, 'occupied')}
                              className="rounded-lg bg-violet-600 px-2 py-1 text-xs font-semibold text-white"
                            >
                              Cliente chegou
                            </button>
                          )}

                          {reservation.status === 'occupied' && (
                            <button
                              type="button"
                              onClick={() => updateReservation(reservation.id, 'completed')}
                              className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold text-white"
                            >
                              Finalizar
                            </button>
                          )}

                          {reservation.status === 'refused' && (
                            <button
                              type="button"
                              onClick={() => updateReservation(reservation.id, 'pending')}
                              className="rounded-lg bg-amber-500 px-2 py-1 text-xs font-semibold text-white"
                            >
                              Reabrir
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
