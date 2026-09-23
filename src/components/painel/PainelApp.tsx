import React, { useEffect, useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { DatabaseService } from '../../services/databaseService';
import { WhatsAppService } from '../../services/whatsappService';
import { WaiterCallService } from '../../services/waiterCallService';
import { Order, WaiterCall, WhatsAppOrder } from '../../types';
import {
  Monitor,
  Clock,
  Flame,
  CheckCircle2,
  MessageCircle,
  Users,
  Bell,
  Check,
} from 'lucide-react';

type DisplayOrder = (Order | WhatsAppOrder) & {
  orderType: 'table' | 'whatsapp';
};

type ColumnId = 'pending' | 'preparing' | 'ready';

const COLUMNS: {
  id: ColumnId;
  label: string;
  statuses: string[];
  accent: string;
  header: string;
  icon: typeof Clock;
}[] = [
  {
    id: 'pending',
    label: 'Novos',
    statuses: ['pending', 'confirmed'],
    accent: 'border-amber-400',
    header: 'bg-amber-500',
    icon: Clock,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    statuses: ['preparing'],
    accent: 'border-orange-400',
    header: 'bg-orange-500',
    icon: Flame,
  },
  {
    id: 'ready',
    label: 'Prontos',
    statuses: ['ready'],
    accent: 'border-emerald-400',
    header: 'bg-emerald-500',
    icon: CheckCircle2,
  },
];

function getElapsedMinutes(date: Date) {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
}

function formatElapsed(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export const PainelApp: React.FC = () => {
  const { state } = useRestaurant();
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [whatsappOrders, setWhatsappOrders] = useState<WhatsAppOrder[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [now, setNow] = useState(new Date());
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadOrders = async () => {
    try {
      const [whatsapp, table, calls] = await Promise.all([
        WhatsAppService.getWhatsAppOrders(),
        DatabaseService.getOrders(),
        WaiterCallService.getPendingCalls(),
      ]);
      setWhatsappOrders(whatsapp);
      setTableOrders(table);
      setWaiterCalls(calls);
      setLastSync(new Date());
    } catch (error) {
      console.error('Erro ao carregar painel:', error);
    }
  };

  useEffect(() => {
    loadOrders();
    const ordersInterval = setInterval(loadOrders, 4000);
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(ordersInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const handleAttendCall = async (callId: string) => {
    const success = await WaiterCallService.attendCall(callId);
    if (success) {
      setWaiterCalls((prev) => prev.filter((call) => call.id !== callId));
    }
  };

  const allOrders: DisplayOrder[] = [
    ...tableOrders.map((order) => ({ ...order, orderType: 'table' as const })),
    ...whatsappOrders.map((order) => ({ ...order, orderType: 'whatsapp' as const })),
  ].filter((order) => !['delivered', 'cancelled'].includes(order.status));

  const getTitle = (order: DisplayOrder) => {
    if (order.orderType === 'whatsapp') {
      const wa = order as WhatsAppOrder & { orderType: 'whatsapp' };
      return wa.customerName || `WhatsApp #${wa.id.slice(-6)}`;
    }
    const tableOrder = order as Order & { orderType: 'table' };
    const table = state.tables.find((t) => t.id === tableOrder.tableId);
    return table ? `Mesa ${table.number}` : 'Mesa';
  };

  const getSubtitle = (order: DisplayOrder) => {
    if (order.orderType === 'whatsapp') {
      const wa = order as WhatsAppOrder & { orderType: 'whatsapp' };
      return wa.customerPhone || 'Delivery';
    }
    const tableOrder = order as Order & { orderType: 'table' };
    const table = state.tables.find((t) => t.id === tableOrder.tableId);
    const seat = state.seats.find((s) => s.id === tableOrder.seatId);
    const praca = table?.praca ? ` · ${table.praca}` : '';
    const guest = seat?.guestName ? ` · ${seat.guestName}` : '';
    return `Salão${praca}${guest}`;
  };

  const getItems = (order: DisplayOrder) => {
    if (order.orderType === 'whatsapp') {
      const wa = order as WhatsAppOrder & { orderType: 'whatsapp' };
      return wa.items.map((item) => ({
        qty: item.quantity,
        name: item.menuItemSnapshot?.name || 'Item',
        notes: item.notes,
      }));
    }
    const tableOrder = order as Order & { orderType: 'table' };
    return tableOrder.items.map((item) => ({
      qty: item.quantity,
      name: item.menuItemSnapshot?.name || 'Item',
      notes: item.notes,
    }));
  };

  const clock = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500">
            <Monitor className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Painel de Pedidos</h1>
            <p className="text-sm capitalize text-slate-400 lg:text-base">{dateLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {waiterCalls.length > 0 && (
            <div className="hidden text-right md:block">
              <p className="text-xs uppercase tracking-wider text-rose-400">Chamar garçom</p>
              <p className="text-3xl font-bold tabular-nums text-rose-400">{waiterCalls.length}</p>
            </div>
          )}
          <div className="hidden text-right sm:block">
            <p className="text-xs uppercase tracking-wider text-slate-500">Ativos</p>
            <p className="text-3xl font-bold tabular-nums text-sky-400">{allOrders.length}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-4xl font-bold tabular-nums tracking-tight lg:text-5xl">
              {clock}
            </p>
            {lastSync && (
              <p className="text-xs text-slate-500">
                Atualizado às{' '}
                {lastSync.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="grid flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-3 lg:gap-5 lg:p-6">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const orders = allOrders
            .filter((order) => column.statuses.includes(order.status))
            .sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

          return (
            <section
              key={column.id}
              className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80"
            >
              <div
                className={`flex items-center justify-between px-5 py-4 ${column.header}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6" />
                  <h2 className="text-xl font-bold lg:text-2xl">{column.label}</h2>
                </div>
                <span className="rounded-full bg-black/20 px-3 py-1 text-lg font-bold tabular-nums">
                  {orders.length}
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {orders.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500">
                    Sem pedidos
                  </div>
                ) : (
                  orders.map((order) => {
                    const elapsed = getElapsedMinutes(order.createdAt);
                    const urgent = elapsed >= 15;
                    const items = getItems(order);

                    return (
                      <article
                        key={`${order.orderType}-${order.id}`}
                        className={`rounded-2xl border-l-4 bg-slate-800 p-4 shadow-lg ${column.accent} ${
                          urgent ? 'ring-2 ring-red-500/60' : ''
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-2">
                              {order.orderType === 'whatsapp' ? (
                                <MessageCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                              ) : (
                                <Users className="h-5 w-5 shrink-0 text-sky-400" />
                              )}
                              <h3 className="truncate text-xl font-bold lg:text-2xl">
                                {getTitle(order)}
                              </h3>
                            </div>
                            <p className="truncate text-sm text-slate-400 lg:text-base">
                              {getSubtitle(order)}
                            </p>
                          </div>
                          <div
                            className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums ${
                              urgent
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {formatElapsed(elapsed)}
                          </div>
                        </div>

                        <ul className="space-y-2">
                          {items.map((item, index) => (
                            <li key={`${order.id}-item-${index}`} className="text-base lg:text-lg">
                              <span className="mr-2 inline-flex min-w-[2rem] justify-center rounded-md bg-slate-950/60 px-2 py-0.5 font-bold text-sky-300">
                                {item.qty}x
                              </span>
                              <span className="font-medium text-slate-100">{item.name}</span>
                              {item.notes && (
                                <p className="mt-0.5 pl-10 text-sm italic text-amber-300">
                                  {item.notes}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>

                        {'notes' in order && order.notes && (
                          <p className="mt-3 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-200">
                            Obs: {order.notes}
                          </p>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </main>

      <footer
        className={`border-t px-4 py-3 lg:px-6 ${
          waiterCalls.length > 0
            ? 'border-rose-700/40 bg-rose-600'
            : 'border-slate-800 bg-slate-900'
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell
              className={`h-5 w-5 ${
                waiterCalls.length > 0 ? 'animate-pulse text-white' : 'text-slate-500'
              }`}
            />
            <p
              className={`text-sm font-semibold uppercase tracking-wide lg:text-base ${
                waiterCalls.length > 0 ? 'text-white' : 'text-slate-500'
              }`}
            >
              Mesas chamando garçom
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
              waiterCalls.length > 0
                ? 'bg-white text-rose-700'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {waiterCalls.length}
          </span>
        </div>

        {waiterCalls.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma mesa chamando no momento</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {waiterCalls.map((call) => {
              const table = state.tables.find((t) => t.id === call.tableId);
              const seat = state.seats.find((s) => s.id === call.seatId);
              const elapsed = getElapsedMinutes(call.createdAt);

              return (
                <button
                  key={call.id}
                  type="button"
                  onClick={() => handleAttendCall(call.id)}
                  className="flex min-w-[160px] shrink-0 items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 text-left text-rose-700 shadow-lg transition hover:bg-rose-50"
                  title="Clique para marcar como atendido"
                >
                  <div>
                    <p className="text-3xl font-black leading-none">
                      Mesa {table?.number ?? '?'}
                    </p>
                    <p className="mt-1 text-xs font-medium text-rose-500">
                      {table?.praca || 'Salão'}
                      {seat?.guestName ? ` · ${seat.guestName}` : ''}
                      {' · '}
                      {formatElapsed(elapsed)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-bold">
                    <Check className="h-3.5 w-3.5" />
                    OK
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
};
