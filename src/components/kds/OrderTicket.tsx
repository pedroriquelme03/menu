import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Order } from '../../types';
import { Clock, CheckCircle, ChefHat, Package, User } from 'lucide-react';

interface OrderTicketProps {
  order: Order;
}

const statusConfig = {
  pending: { color: 'border-yellow-300 bg-yellow-50', label: 'Pendente', action: 'Confirmar' },
  confirmed: { color: 'border-blue-300 bg-blue-50', label: 'Confirmado', action: 'Iniciar Preparo' },
  preparing: { color: 'border-orange-300 bg-orange-50', label: 'Preparando', action: 'Marcar Pronto' },
  ready: { color: 'border-green-300 bg-green-50', label: 'Pronto', action: 'Entregar' },
  delivered: { color: 'border-gray-300 bg-gray-50', label: 'Entregue', action: null },
  cancelled: { color: 'border-red-300 bg-red-50', label: 'Cancelado', action: null }
};

export const OrderTicket: React.FC<OrderTicketProps> = ({ order }) => {
  const { state, dispatch } = useRestaurant();
  
  const config = statusConfig[order.status as keyof typeof statusConfig];
  
  const currentTable = state.tables.find(t => t.id === order.tableId);
  const currentSeat = state.seats.find(s => s.id === order.seatId);
  
  const formatTime = (date: Date) => 
    new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  const getElapsedTime = () => {
    const now = new Date().getTime();
    const orderTime = new Date(order.createdAt).getTime();
    const diff = Math.floor((now - orderTime) / 1000 / 60); // em minutos
    
    if (diff < 60) return `${diff}min`;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}min`;
  };

  const handleStatusUpdate = () => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered'
    };
    
    const nextStatus = statusFlow[order.status as keyof typeof statusFlow];
    if (nextStatus) {
      dispatch({ 
        type: 'UPDATE_ORDER_STATUS', 
        payload: { orderId: order.id, status: nextStatus } 
      });
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'preparing': return <ChefHat className="w-5 h-5 text-orange-600" />;
      case 'ready': return <Package className="w-5 h-5 text-green-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${config.color} hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-bold text-lg">
            Mesa {currentTable?.number}
          </span>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>{formatTime(order.createdAt)}</div>
          <div className="font-medium text-red-600">{getElapsedTime()}</div>
        </div>
      </div>

      {/* Guest Info */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span>{currentSeat?.guestName || `Convidado ${currentSeat?.seatNumber || 1}`}</span>
        <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
          #{order.id.slice(0, 8)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-gray-800">
                {item.quantity}x {item.menuItemSnapshot.name}
              </span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusConfig[item.status as keyof typeof statusConfig]?.color
              }`}>
                {statusConfig[item.status as keyof typeof statusConfig]?.label}
              </div>
            </div>
            
            {item.selectedModifiers.length > 0 && (
              <div className="space-y-1 mb-2">
                {item.selectedModifiers.map((modifier) => (
                  <div key={modifier.modifierId} className="text-sm text-gray-600">
                    <span className="font-medium">{modifier.modifierName}:</span>
                    <span className="ml-1">
                      {modifier.selectedOptions.map(option => option.name).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {item.notes && (
              <div className="text-sm text-orange-700 bg-orange-100 rounded p-2 mt-2">
                <strong>Obs:</strong> {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {config.action && (
        <button
          onClick={handleStatusUpdate}
          className={`w-full py-3 rounded-xl font-semibold transition-colors ${
            order.status === 'preparing'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : order.status === 'confirmed'
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {config.action}
        </button>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mt-3 p-2 bg-yellow-100 rounded-lg text-sm">
          <strong className="text-yellow-800">Observações:</strong>
          <p className="text-yellow-700 mt-1">{order.notes}</p>
        </div>
      )}
    </div>
  );
};