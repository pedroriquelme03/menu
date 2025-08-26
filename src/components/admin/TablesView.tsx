import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { TableCard } from './TableCard';
import { PaymentModal } from './PaymentModal';
import { QRCodeGenerator } from './QRCodeGenerator';
import { QRCodeManager } from './QRCodeManager';
import { Table } from '../../types';
import { QrCode, Users, AlertCircle, DollarSign } from 'lucide-react';

export const TablesView: React.FC = () => {
  const { state } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [showQRManager, setShowQRManager] = useState(false);

  const occupiedTables = state.tables.filter(table => table.isOccupied);
  const availableTables = state.tables.filter(table => !table.isOccupied);

  const totalRevenue = state.orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.subtotal, 0);

  const activeOrders = state.orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-gray-800">{occupiedTables.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mesas Disponíveis</p>
              <p className="text-2xl font-bold text-gray-800">{availableTables.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Ativos</p>
              <p className="text-2xl font-bold text-gray-800">{activeOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Hoje</p>
              <p className="text-2xl font-bold text-gray-800">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Occupied Tables */}
      {occupiedTables.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Mesas Ocupadas ({occupiedTables.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {occupiedTables.map((table) => (
              <TableCard 
                key={table.id} 
                table={table} 
                onPayment={() => handleTablePayment(table)}
                onGenerateQR={() => handleGenerateQR(table)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Tables */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            Mesas Disponíveis ({availableTables.length})
          </h2>
          <button
            onClick={() => setShowQRManager(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Gerenciar Todos os QR Codes
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {availableTables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-gray-600">{table.number}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
              </p>
              <button
                onClick={() => handleGenerateQR(table)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Gerar QR
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTable && (
        <PaymentModal
          table={selectedTable}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTable(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTableForQR && (
        <QRCodeGenerator
          table={selectedTableForQR}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTableForQR(null);
          }}
        />
      )}

      {/* QR Code Manager Modal */}
      {showQRManager && (
        <QRCodeManager
          onClose={() => setShowQRManager(false)}
        />
      )}
    </div>
  );
};