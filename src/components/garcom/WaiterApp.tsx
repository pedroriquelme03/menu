import React, { useEffect, useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { DatabaseService } from '../../services/databaseService';
import { WaiterCallService } from '../../services/waiterCallService';
import { MenuView } from '../client/MenuView';
import { CartView } from '../client/CartView';
import { Order, Seat, Table, WaiterCall } from '../../types';
import {
  HandPlatter,
  Bell,
  ClipboardList,
  ShoppingCart,
  UtensilsCrossed,
  ArrowLeft,
  Siren,
  Check,
  Users,
  RefreshCw,
} from 'lucide-react';

type MainTab = 'tables' | 'calls';
type TableTab = 'menu' | 'cart' | 'orders';

function formatElapsed(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'confirmed':
      return 'Confirmado';
    case 'preparing':
      return 'Preparando';
    case 'ready':
      return 'Pronto';
    case 'delivered':
      return 'Entregue';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
}

export const WaiterApp: React.FC = () => {
  const { state, dispatch } = useRestaurant();
  const [mainTab, setMainTab] = useState<MainTab>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [tableTab, setTableTab] = useState<TableTab>('menu');
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chaseLoadingId, setChaseLoadingId] = useState<string | null>(null);
  const [attendLoadingId, setAttendLoadingId] = useState<string | null>(null);

  const occupiedTables = state.tables
    .filter((table) => table.isOccupied)
    .sort((a, b) => a.number - b.number);

  const loadCallsAndOrders = async () => {
    setIsRefreshing(true);
    try {
      const [calls, orders, seats, tables] = await Promise.all([
        WaiterCallService.getPendingCalls(),
        DatabaseService.getOrders(),
        DatabaseService.getSeats(),
        DatabaseService.getTables(),
      ]);
      setWaiterCalls(calls);
      dispatch({ type: 'SET_TABLES', payload: tables });
      dispatch({ type: 'SET_SEATS', payload: seats });
      dispatch({ type: 'SET_ORDERS', payload: orders });    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCallsAndOrders();
    const interval = setInterval(loadCallsAndOrders, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    const fresh = state.tables.find((t) => t.id === selectedTable.id);
    if (fresh) setSelectedTable(fresh);
  }, [state.tables, selectedTable?.id]);

  const openTable = async (table: Table) => {
    dispatch({ type: 'CLEAR_CART' });

    let seats = state.seats.filter((seat) => seat.tableId === table.id);
    let seat = seats[0];

    if (!seat) {
      const created = await DatabaseService.createSeat({
        tableId: table.id,
        guestName: 'Garçom',
        deviceId: `waiter-${Date.now()}`,
        seatNumber: 1,
      });
      if (created) {
        dispatch({ type: 'ADD_SEAT', payload: created });
        seat = created;
        seats = [created];
      }
    }

    if (!seat) {
      alert('Não foi possível abrir a mesa. Tente novamente.');
      return;
    }

    setSelectedTable(table);
    setSelectedSeat(seat);
    dispatch({ type: 'SET_CURRENT_SEAT', payload: seat });
    setTableTab('menu');
    setMainTab('tables');
  };

  const selectSeat = (seat: Seat) => {
    setSelectedSeat(seat);
    dispatch({ type: 'SET_CURRENT_SEAT', payload: seat });
    dispatch({ type: 'CLEAR_CART' });
  };

  const closeTableView = () => {
    setSelectedTable(null);
    setSelectedSeat(null);
    dispatch({ type: 'CLEAR_CART' });
  };

  const tableOrders = selectedTable
    ? state.orders
        .filter(
          (order) =>
            order.tableId === selectedTable.id &&
            order.status !== 'cancelled'
        )
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];

  const tableSeats = selectedTable
    ? state.seats.filter((seat) => seat.tableId === selectedTable.id)
    : [];

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleChase = async (order: Order) => {
    if (order.chaseAlert || ['delivered', 'cancelled', 'ready'].includes(order.status)) {
      return;
    }
    setChaseLoadingId(order.id);
    try {
      const updated = await DatabaseService.chaseOrder(order.id);
      if (updated) {
        dispatch({ type: 'UPDATE_ORDER', payload: updated });
      } else {
        alert('Não foi possível apurar o pedido.');
      }
    } finally {
      setChaseLoadingId(null);
    }
  };

  const handleAttendCall = async (callId: string) => {
    setAttendLoadingId(callId);
    try {
      const success = await WaiterCallService.attendCall(callId);
      if (success) {
        setWaiterCalls((prev) => prev.filter((call) => call.id !== callId));
      }
    } finally {
      setAttendLoadingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            {selectedTable ? (
              <button
                type="button"
                onClick={closeTableView}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                <HandPlatter className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {selectedTable ? `Mesa ${selectedTable.number}` : 'Garçom'}
              </h1>
              <p className="text-xs text-slate-500">
                {selectedTable
                  ? `${selectedTable.praca || 'Salão'} · ${selectedSeat?.guestName || 'Pedido'}`
                  : 'Pedidos, apuração e chamados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedTable && (
              <button
                type="button"
                onClick={loadCallsAndOrders}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            {waiterCalls.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTable(null);
                  setMainTab('calls');
                }}
                className="relative rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-rose-600">
                  {waiterCalls.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {!selectedTable && (
          <div className="mx-auto flex max-w-5xl gap-2 px-4 pb-3">
            <button
              type="button"
              onClick={() => setMainTab('tables')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                mainTab === 'tables'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Mesas
            </button>
            <button
              type="button"
              onClick={() => setMainTab('calls')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                mainTab === 'calls'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Chamados
              {waiterCalls.length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 text-xs">
                  {waiterCalls.length}
                </span>
              )}
            </button>
          </div>
        )}

        {selectedTable && (
          <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
            {(
              [
                { id: 'menu' as TableTab, label: 'Cardápio', icon: UtensilsCrossed },
                { id: 'cart' as TableTab, label: 'Carrinho', icon: ShoppingCart, badge: cartCount },
                { id: 'orders' as TableTab, label: 'Pedidos', icon: ClipboardList },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTableTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                    tableTab === tab.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {'badge' in tab && tab.badge ? (
                    <span className="rounded-full bg-white/20 px-1.5 text-xs">{tab.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 pb-10">
        {!selectedTable && mainTab === 'calls' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Chamados da TV
            </h2>
            {waiterCalls.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                Nenhum chamado pendente
              </div>
            ) : (
              waiterCalls.map((call) => {
                const table = state.tables.find((t) => t.id === call.tableId);
                const seat = state.seats.find((s) => s.id === call.seatId);
                return (
                  <div
                    key={call.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-2xl font-black text-rose-700">
                        Mesa {table?.number ?? '?'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {table?.praca || 'Salão'}
                        {seat?.guestName ? ` · ${seat.guestName}` : ''}
                        {' · '}
                        {formatElapsed(call.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {table && (
                        <button
                          type="button"
                          onClick={() => openTable(table)}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          Abrir mesa
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={attendLoadingId === call.id}
                        onClick={() => handleAttendCall(call.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Atender
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {!selectedTable && mainTab === 'tables' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Mesas ocupadas
            </h2>
            {occupiedTables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                Nenhuma mesa ocupada no momento
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {occupiedTables.map((table) => {
                  const seats = state.seats.filter((s) => s.tableId === table.id);
                  const activeOrders = state.orders.filter(
                    (o) =>
                      o.tableId === table.id &&
                      !['delivered', 'cancelled'].includes(o.status)
                  );
                  const hasCall = waiterCalls.some((c) => c.tableId === table.id);

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => openTable(table)}
                      className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
                        hasCall ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-xl font-bold text-slate-900">Mesa {table.number}</p>
                          <p className="text-sm text-slate-500">{table.praca || 'Salão'}</p>
                        </div>
                        {hasCall && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
                            <Bell className="h-3 w-3" />
                            Chamando
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {seats.length}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {activeOrders.length} pedidos
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTable && (
          <div className="space-y-4">
            {tableSeats.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {tableSeats.map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => selectSeat(seat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                      selectedSeat?.id === seat.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200'
                    }`}
                  >
                    {seat.guestName || `Assento ${seat.seatNumber || '?'}`}
                  </button>
                ))}
              </div>
            )}

            {tableTab === 'menu' && <MenuView />}
            {tableTab === 'cart' && <CartView />}
            {tableTab === 'orders' && (
              <div className="space-y-3">
                {tableOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
                    Nenhum pedido nesta mesa
                  </div>
                ) : (
                  tableOrders.map((order) => {
                    const canChase =
                      !order.chaseAlert &&
                      !['delivered', 'cancelled', 'ready'].includes(order.status);

                    return (
                      <article
                        key={order.id}
                        className={`rounded-2xl border bg-white p-4 shadow-sm ${
                          order.chaseAlert
                            ? 'border-orange-400 ring-2 ring-orange-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">
                              Pedido #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {statusLabel(order.status)} · {formatElapsed(order.createdAt)} ·{' '}
                              {formatPrice(order.subtotal)}
                            </p>
                          </div>
                          {order.chaseAlert && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                              <Siren className="h-3.5 w-3.5" />
                              Apurado
                            </span>
                          )}
                        </div>

                        <ul className="mb-3 space-y-1 text-sm text-slate-700">
                          {order.items.map((item, index) => (
                            <li key={`${order.id}-${index}`}>
                              {item.quantity}x {item.menuItemSnapshot?.name || 'Item'}
                            </li>
                          ))}
                        </ul>

                        {canChase && (
                          <button
                            type="button"
                            disabled={chaseLoadingId === order.id}
                            onClick={() => handleChase(order)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                          >
                            <Siren className="h-4 w-4" />
                            {chaseLoadingId === order.id
                              ? 'Apurando...'
                              : 'Apurar na cozinha'}
                          </button>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
