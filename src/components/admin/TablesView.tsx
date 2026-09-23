import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { TableCard } from './TableCard';
import { PaymentModal } from './PaymentModal';
import { QRCodeGenerator } from './QRCodeGenerator';
import { QRCodeManager } from './QRCodeManager';
import { TableFormModal } from './TableFormModal';
import { Table } from '../../types';
import { QrCode, Users, AlertCircle, DollarSign, Plus, MapPin } from 'lucide-react';

export const TablesView: React.FC = () => {
  const { state } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [showQRManager, setShowQRManager] = useState(false);
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);

  const occupiedTables = state.tables
    .filter((table) => table.isOccupied)
    .sort((a, b) => {
      const pracaCompare = (a.praca || 'Salão').localeCompare(b.praca || 'Salão', 'pt-BR');
      return pracaCompare !== 0 ? pracaCompare : a.number - b.number;
    });

  const availableTables = state.tables
    .filter((table) => !table.isOccupied)
    .sort((a, b) => {
      const pracaCompare = (a.praca || 'Salão').localeCompare(b.praca || 'Salão', 'pt-BR');
      return pracaCompare !== 0 ? pracaCompare : a.number - b.number;
    });

  const groupByPraca = (tables: Table[]) => {
    const map = new Map<string, Table[]>();
    tables.forEach((table) => {
      const key = table.praca || 'Salão';
      const list = map.get(key) || [];
      list.push(table);
      map.set(key, list);
    });
    return Array.from(map.entries()).map(([praca, items]) => ({ praca, tables: items }));
  };

  const occupiedByPraca = groupByPraca(occupiedTables);
  const availableByPraca = groupByPraca(availableTables);
  const existingPracas = Array.from(
    new Set(state.tables.map((table) => table.praca || 'Salão'))
  );

  const totalRevenue = state.orders
    .filter((order) => order.status === 'delivered')
    .reduce((sum, order) => sum + order.subtotal, 0);

  const activeOrders = state.orders.filter(
    (order) => order.status !== 'delivered' && order.status !== 'cancelled'
  ).length;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const handleTablePayment = (table: Table) => {
    setSelectedTable(table);
    setShowPaymentModal(true);
  };

  const handleGenerateQR = (table: Table) => {
    setSelectedTableForQR(table);
    setShowQRModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-gray-800">{occupiedTables.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mesas Disponíveis</p>
              <p className="text-2xl font-bold text-gray-800">{availableTables.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Ativos</p>
              <p className="text-2xl font-bold text-gray-800">{activeOrders}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Hoje</p>
              <p className="text-2xl font-bold text-gray-800">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {occupiedByPraca.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Users className="h-6 w-6 text-green-600" />
            Mesas Ocupadas ({occupiedTables.length})
          </h2>
          {occupiedByPraca.map(({ praca, tables }) => (
            <div key={`occ-${praca}`} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <MapPin className="h-4 w-4" />
                {praca}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onPayment={() => handleTablePayment(table)}
                    onGenerateQR={() => handleGenerateQR(table)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <QrCode className="h-6 w-6 text-blue-600" />
            Mesas Disponíveis ({availableTables.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreateTableModal(true)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Nova Mesa
            </button>
            <button
              type="button"
              onClick={() => setShowQRManager(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <QrCode className="h-4 w-4" />
              Gerenciar QR Codes
            </button>
          </div>
        </div>

        {availableByPraca.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
            Nenhuma mesa livre no momento. Cadastre novas em Cadastro Mesas.
          </div>
        ) : (
          <div className="space-y-5">
            {availableByPraca.map(({ praca, tables }) => (
              <div key={`free-${praca}`} className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {praca}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <span className="font-bold text-gray-600">{table.number}</span>
                      </div>
                      <p className="mb-1 text-xs font-medium text-blue-600">{table.praca}</p>
                      <p className="mb-3 text-sm text-gray-500">
                        {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGenerateQR(table)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                      >
                        <QrCode className="h-4 w-4" />
                        Gerar QR
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPaymentModal && selectedTable && (
        <PaymentModal
          table={selectedTable}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTable(null);
          }}
        />
      )}

      {showQRModal && selectedTableForQR && (
        <QRCodeGenerator
          table={selectedTableForQR}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTableForQR(null);
          }}
        />
      )}

      {showQRManager && <QRCodeManager onClose={() => setShowQRManager(false)} />}

      <TableFormModal
        isOpen={showCreateTableModal}
        onClose={() => setShowCreateTableModal(false)}
        existingPracas={existingPracas}
      />
    </div>
  );
};
