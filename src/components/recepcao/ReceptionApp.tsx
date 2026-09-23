import React, { useEffect, useRef, useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { ReservationService } from '../../services/reservationService';
import { Reservation, Table } from '../../types';
import {
  ConciergeBell,
  Search,
  MapPin,
  Users,
  Phone,
  CalendarDays,
  X,
} from 'lucide-react';

const TABLE_SIZE = 64;

function getDefaultPosition(index: number, total: number): { x: number; y: number } {
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = ((col + 0.5) / cols) * 80 + 10;
  const y = ((row + 0.5) / Math.ceil(total / cols)) * 70 + 15;
  return { x: Math.min(90, Math.max(8, x)), y: Math.min(88, Math.max(10, y)) };
}

function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
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

function statusLabel(status: Reservation['status']) {
  switch (status) {
    case 'pending':
      return 'Solicitação';
    case 'accepted':
      return 'Aceita';
    case 'refused':
      return 'Recusada';
    case 'waiting_client':
      return 'Aguardando cliente';
    case 'occupied':
      return 'Ocupada agora';
    case 'completed':
      return 'Finalizada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
}

export const ReceptionApp: React.FC = () => {
  const { state } = useRestaurant();
  const mapRef = useRef<HTMLDivElement>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [query, setQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [highlightedTableId, setHighlightedTableId] = useState<string | null>(null);
  const [selectedPraca, setSelectedPraca] = useState<string>('all');
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});

  const pracas = Array.from(
    new Set(state.tables.map((t) => t.praca || 'Salão'))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  useEffect(() => {
    const load = async () => {
      const data = await ReservationService.getReservations();
      setReservations(data);
    };
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const next: Record<string, { x: number; y: number }> = {};
    const filtered = state.tables.filter(
      (t) => selectedPraca === 'all' || (t.praca || 'Salão') === selectedPraca
    );

    filtered.forEach((table, index) => {
      if (table.posX != null && table.posY != null) {
        next[table.id] = { x: table.posX, y: table.posY };
      } else {
        next[table.id] = getDefaultPosition(index, filtered.length || 1);
      }
    });

    setLocalPositions(next);
  }, [state.tables, selectedPraca]);

  const visibleTables = state.tables
    .filter((t) => selectedPraca === 'all' || (t.praca || 'Salão') === selectedPraca)
    .sort((a, b) => a.number - b.number);

  const normalizedQuery = query.trim().toLowerCase();
  const searchResults =
    normalizedQuery.length < 2
      ? []
      : reservations
          .filter((reservation) => {
            const nameMatch = reservation.customerName.toLowerCase().includes(normalizedQuery);
            const phoneMatch = reservation.customerPhone
              .replace(/\D/g, '')
              .includes(normalizedQuery.replace(/\D/g, ''));
            return nameMatch || phoneMatch;
          })
          .filter((reservation) =>
            ['pending', 'accepted', 'waiting_client', 'occupied'].includes(reservation.status)
          )
          .sort(
            (a, b) => new Date(a.reservedAt).getTime() - new Date(b.reservedAt).getTime()
          )
          .slice(0, 8);

  const focusReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setQuery(reservation.customerName);

    if (reservation.tableId) {
      const table = state.tables.find((t) => t.id === reservation.tableId);
      if (table) {
        setHighlightedTableId(table.id);
        setSelectedPraca(table.praca || 'Salão');
      } else {
        setHighlightedTableId(reservation.tableId);
      }
    } else {
      setHighlightedTableId(null);
    }
  };

  const clearSelection = () => {
    setSelectedReservation(null);
    setHighlightedTableId(null);
    setQuery('');
  };

  const highlightedTable = highlightedTableId
    ? state.tables.find((t) => t.id === highlightedTableId) || null
    : null;

  const getTableLabel = (table: Table) => {
    const reservation = reservations.find(
      (item) =>
        item.tableId === table.id &&
        ['accepted', 'waiting_client', 'occupied'].includes(item.status)
    );
    return reservation?.customerName;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ConciergeBell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Recepção</h1>
              <p className="text-sm text-slate-500">Busque a reserva e localize a mesa no mapa</p>
            </div>
          </div>

          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setSelectedReservation(null);
                  setHighlightedTableId(null);
                }
              }}
              placeholder="Pesquisar reserva por nome ou telefone..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
            {query && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {normalizedQuery.length >= 2 && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">Nenhuma reserva encontrada</p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {searchResults.map((reservation) => {
                      const table = state.tables.find((t) => t.id === reservation.tableId);
                      return (
                        <li key={reservation.id}>
                          <button
                            type="button"
                            onClick={() => focusReservation(reservation)}
                            className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-indigo-50"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {reservation.customerName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatPhone(reservation.customerPhone)} ·{' '}
                                {reservation.partySize}p · {formatDateTime(reservation.reservedAt)}
                              </p>
                              <p className="mt-1 text-xs font-medium text-indigo-600">
                                {statusLabel(reservation.status)}
                                {table
                                  ? ` · Mesa ${table.number} (${table.praca || 'Salão'})`
                                  : ' · Sem mesa atribuída'}
                              </p>
                            </div>
                            <MapPin className="mt-1 h-4 w-4 shrink-0 text-indigo-500" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 md:p-6 xl:grid-cols-[1fr_300px]">
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedPraca('all')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                selectedPraca === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              Todas
            </button>
            {pracas.map((praca) => (
              <button
                key={praca}
                type="button"
                onClick={() => setSelectedPraca(praca)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  selectedPraca === praca
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200'
                }`}
              >
                {praca}
              </button>
            ))}
          </div>

          <div
            ref={mapRef}
            className="relative min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:32px_32px] bg-slate-50"
          >
            <div className="pointer-events-none absolute inset-x-8 top-4 rounded-xl border border-dashed border-slate-300/80 bg-white/50 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
              {selectedPraca === 'all' ? 'Mapa do salão' : `Praça · ${selectedPraca}`}
            </div>

            {visibleTables.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Nenhuma mesa cadastrada nesta praça
              </div>
            ) : (
              visibleTables.map((table) => {
                const pos = localPositions[table.id] || { x: 50, y: 50 };
                const isHighlight = highlightedTableId === table.id;
                const guestName = getTableLabel(table);

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => {
                      setHighlightedTableId(table.id);
                      const linked = reservations.find(
                        (item) =>
                          item.tableId === table.id &&
                          ['accepted', 'waiting_client', 'occupied', 'pending'].includes(
                            item.status
                          )
                      );
                      if (linked) setSelectedReservation(linked);
                    }}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border-2 shadow-md transition-all ${
                      isHighlight
                        ? 'z-20 scale-125 border-indigo-500 bg-indigo-100 text-indigo-900 ring-4 ring-indigo-300'
                        : table.isOccupied
                          ? 'z-10 border-amber-400 bg-amber-100 text-amber-900'
                          : 'z-10 border-emerald-400 bg-emerald-50 text-emerald-900'
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: TABLE_SIZE,
                      height: TABLE_SIZE,
                    }}
                    title={
                      guestName
                        ? `Mesa ${table.number} · ${guestName}`
                        : `Mesa ${table.number}`
                    }
                  >
                    <span className="text-lg font-bold leading-none">{table.number}</span>
                    <span className="mt-0.5 max-w-[56px] truncate text-[9px] font-medium opacity-70">
                      {guestName || `${table.capacity}p`}
                    </span>
                  </button>
                );
              })
            )}

            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-400" /> Livre
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-400" /> Ocupada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-indigo-500" /> Reserva
              </span>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {selectedReservation ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  {statusLabel(selectedReservation.status)}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedReservation.customerName}
                </h2>
              </div>

              <div className="space-y-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {formatPhone(selectedReservation.customerPhone)}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  {selectedReservation.partySize}{' '}
                  {selectedReservation.partySize === 1 ? 'pessoa' : 'pessoas'}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {formatDateTime(selectedReservation.reservedAt)}
                </p>
                {selectedReservation.notes && (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
                    {selectedReservation.notes}
                  </p>
                )}
              </div>

              {highlightedTable ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Mesa no mapa
                  </p>
                  <p className="mt-1 text-3xl font-black text-indigo-700">
                    Mesa {highlightedTable.number}
                  </p>
                  <p className="text-sm text-indigo-600">
                    {highlightedTable.praca || 'Salão'} · {highlightedTable.capacity} lugares
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Esta reserva ainda não tem mesa atribuída. Aceite e vincule uma mesa no admin
                  de Reservas.
                </div>
              )}

              <button
                type="button"
                onClick={clearSelection}
                className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Limpar seleção
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-sm text-slate-400">
              <Search className="mb-3 h-8 w-8 opacity-40" />
              <p className="font-medium text-slate-500">Pesquise uma reserva</p>
              <p className="mt-1 max-w-[200px]">
                Digite o nome do cliente para destacar a mesa no mapa.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};
