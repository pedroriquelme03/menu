import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { PaymentModal } from '../admin/PaymentModal';
import { Table } from '../../types';
import {
  Asterisk as CashRegister,
  Users,
  CreditCard,
  Clock,
  DollarSign,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { DatabaseService } from '../../services/databaseService';

type CaixaFilter = 'all' | 'ready' | 'waiting';

export const CaixaApp: React.FC = () => {
  const { state, dispatch } = useRestaurant();
  const [filter, setFilter] = useState<CaixaFilter>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const occupiedTables = state.tables
    .filter((table) => table.isOccupied)
    .sort((a, b) => a.number - b.number);

  const getTableMetrics = (table: Table) => {
    const seats = state.seats.filter((seat) => seat.tableId === table.id);
    const orders = state.orders.filter((order) => order.tableId === table.id);
    const activeOrders = orders.filter(
      (order) => order.status !== 'delivered' && order.status !== 'cancelled'
    );
    const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const serviceCharge = subtotal * 0.1;
    const total = subtotal + serviceCharge;
    const readyToPay = activeOrders.length === 0 && orders.length > 0;

    return { seats, orders, activeOrders, subtotal, serviceCharge, total, readyToPay };
  };

  const tablesWithMetrics = occupiedTables.map((table) => ({
    table,
    ...getTableMetrics(table),
  }));

  const readyCount = tablesWithMetrics.filter((t) => t.readyToPay).length;
  const waitingCount = tablesWithMetrics.filter((t) => t.activeOrders.length > 0).length;
  const openBalance = tablesWithMetrics.reduce((sum, t) => sum + t.total, 0);

  const filteredTables = tablesWithMetrics.filter((item) => {
    if (filter === 'ready') return item.readyToPay;
    if (filter === 'waiting') return item.activeOrders.length > 0;
    return true;
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [tables, seats, orders, payments] = await Promise.all([
        DatabaseService.getTables(),
        DatabaseService.getSeats(),
        DatabaseService.getOrders(),
        DatabaseService.getPayments(),
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          tables,
          seats,
          menu: state.menu,
          orders,
          payments,
          staff: state.staff,
          cart: state.cart,
          currentSeat: state.currentSeat,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar caixa:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filters: { id: CaixaFilter; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'ready', label: 'Prontas p/ pagar' },
    { id: 'waiting', label: 'Aguardando cozinha' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CashRegister className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Caixa</h1>
              <p className="text-sm text-slate-500">Fechamento de mesas e pagamentos</p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Ocupadas</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{occupiedTables.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Prontas</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{readyCount}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-600">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Aguardando</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{waitingCount}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Em aberto</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatPrice(openBalance)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredTables.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CashRegister className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-800">Nenhuma mesa neste filtro</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quando houver mesas ocupadas, elas aparecerão aqui para fechamento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTables.map(({ table, seats, orders, activeOrders, subtotal, serviceCharge, total, readyToPay }) => (
              <article
                key={table.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                  readyToPay ? 'border-emerald-200' : 'border-slate-200'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                        readyToPay
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {table.number}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Mesa {table.number}</h3>
                      <p className="text-sm text-slate-500">
                        {table.praca || 'Salão'} · {seats.length}{' '}
                        {seats.length === 1 ? 'convidado' : 'convidados'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      readyToPay
                        ? 'bg-emerald-100 text-emerald-700'
                        : activeOrders.length > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {readyToPay
                      ? 'Pronta'
                      : activeOrders.length > 0
                        ? `${activeOrders.length} ativo(s)`
                        : 'Sem pedidos'}
                  </span>
                </div>

                {seats.length > 0 && (
                  <div className="mb-4 space-y-1.5">
                    {seats.map((seat, index) => {
                      const seatTotal = orders
                        .filter((order) => order.seatId === seat.id)
                        .reduce((sum, order) => sum + order.subtotal, 0);

                      return (
                        <div key={seat.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {seat.guestName || `Convidado ${index + 1}`}
                          </span>
                          <span className="font-medium text-slate-800">
                            {formatPrice(seatTotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mb-4 space-y-1 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Taxa 10%</span>
                    <span className="font-medium text-slate-800">{formatPrice(serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-emerald-700">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTable(table)}
                  disabled={!readyToPay}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    readyToPay
                      ? 'Processar pagamento'
                      : activeOrders.length > 0
                        ? 'Aguarde a cozinha entregar os pedidos'
                        : 'Mesa sem pedidos para cobrar'
                  }
                >
                  <CreditCard className="h-4 w-4" />
                  {readyToPay
                    ? 'Receber pagamento'
                    : activeOrders.length > 0
                      ? 'Aguardando cozinha'
                      : 'Sem pedidos'}
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      {selectedTable && (
        <PaymentModal table={selectedTable} onClose={() => setSelectedTable(null)} />
      )}
    </div>
  );
};
