import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Table } from '../../types';
import { Users, Clock, CreditCard, QrCode as QrCode2 } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onPayment: () => void;
  onGenerateQR: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onPayment, onGenerateQR }) => {
  const { state } = useRestaurant();
  
  const tableSeats = state.seats.filter(seat => seat.tableId === table.id);
  const tableOrders = state.orders.filter(order => order.tableId === table.id);
  const tableTotal = tableOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const serviceCharge = tableTotal * 0.1;
  const finalTotal = tableTotal + serviceCharge;

  const activeOrders = tableOrders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const getSessionDuration = () => {
    if (!tableSeats.length) return '';
    const earliestJoin = Math.min(...tableSeats.map(seat => new Date(seat.joinedAt).getTime()));
    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - earliestJoin) / 1000 / 60);
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  const copyTableUrl = () => {
    const url = `${window.location.origin}/table/${table.token}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="font-bold text-orange-600 text-lg">{table.number}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Mesa {table.number}</h3>
            <p className="text-sm text-gray-500">{table.capacity} lugares</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={onGenerateQR}
            className="text-blue-400 hover:text-blue-600 p-1"
            title="Gerar QR Code"
          >
            <QrCode2 className="w-5 h-5" />
          </button>
          <button
            onClick={copyTableUrl}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Copiar link da mesa"
          >
            <QrCode2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-gray-600">
            {tableSeats.length} {tableSeats.length === 1 ? 'convidado' : 'convidados'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">
            Sessão: {getSessionDuration()}
          </span>
        </div>

        {activeOrders.length > 0 && (
          <div className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full text-center">
            {activeOrders.length} {activeOrders.length === 1 ? 'pedido ativo' : 'pedidos ativos'}
          </div>
        )}
      </div>

      {/* Guests */}
      {tableSeats.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Convidados:</h4>
          <div className="space-y-1">
            {tableSeats.map((seat, index) => {
              const seatOrders = state.orders.filter(order => order.seatId === seat.id);
              const seatTotal = seatOrders.reduce((sum, order) => sum + order.subtotal, 0);
              
              return (
                <div key={seat.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {seat.guestName || `Convidado ${index + 1}`}
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatPrice(seatTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Subtotal:</span>
          <span className="text-sm font-medium">{formatPrice(tableTotal)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Taxa (10%):</span>
          <span className="text-sm font-medium">{formatPrice(serviceCharge)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800">Total:</span>
          <span className="font-bold text-lg text-orange-600">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onPayment}
        disabled={activeOrders.length > 0}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title={activeOrders.length > 0 ? 'Aguarde todos os pedidos serem entregues' : 'Processar pagamento'}
      >
        <CreditCard className="w-4 h-4" />
        {activeOrders.length > 0 ? 'Aguardando pedidos' : 'Processar Pagamento'}
      </button>
    </div>
  );
};