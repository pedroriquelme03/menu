import React from 'react';
import { Order, WhatsAppOrder } from '../../types';
import { Clock, CheckCircle, Package, Truck, MessageCircle, Users, Phone, MapPin } from 'lucide-react';

interface UnifiedOrderTicketProps {
  order: Order | WhatsAppOrder;
  onStatusUpdate: (orderId: string, status: string) => void;
  tables?: Array<{ id: string; number: number }>;
  seats?: Array<{ id: string; guestName?: string; seatNumber?: number }>;
}

export const UnifiedOrderTicket: React.FC<UnifiedOrderTicketProps> = ({ 
  order, 
  onStatusUpdate,
  tables = [],
  seats = []
}) => {
  const isWhatsAppOrder = 'customerPhone' in order;
  const whatsappOrder = isWhatsAppOrder ? order as WhatsAppOrder : null;
  const tableOrder = !isWhatsAppOrder ? order as Order : null;

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivered';
      default: return currentStatus;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'Confirmar';
      case 'confirmed': return 'Iniciar Preparo';
      case 'preparing': return 'Marcar Pronto';
      case 'ready': return 'Marcar Entregue';
      default: return 'Atualizar';
    }
  };

  const getOrderTitle = () => {
    if (isWhatsAppOrder && whatsappOrder) {
      return `WhatsApp #${whatsappOrder.id.slice(-8)}`;
    } else if (tableOrder) {
      // Buscar número da mesa
      const table = tables.find(t => t.id === tableOrder.tableId);
      const tableNumber = table ? table.number : '?';
      return `Mesa ${tableNumber}`;
    }
    return 'Pedido';
  };

  const getOrderSubtitle = () => {
    if (isWhatsAppOrder && whatsappOrder) {
      return whatsappOrder.customerName || formatPhone(whatsappOrder.customerPhone);
    } else if (tableOrder) {
      // Buscar informações do assento
      const seat = seats.find(s => s.id === tableOrder.seatId);
      if (seat) {
        return seat.guestName || `Assento ${seat.seatNumber || '?'}`;
      }
      return `Assento ${tableOrder.seatId?.slice(0, 8) || '?'}`;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isWhatsAppOrder ? (
            <MessageCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Users className="w-5 h-5 text-blue-600" />
          )}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{getOrderTitle()}</h3>
            <p className="text-xs text-gray-600">{getOrderSubtitle()}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-gray-800">
            {isWhatsAppOrder && whatsappOrder ? formatPrice(whatsappOrder.total) : 
             tableOrder ? formatPrice(tableOrder.subtotal) : 'R$ 0,00'}
          </div>
          <div className="text-xs text-gray-500">
            {order.createdAt.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Customer Info (WhatsApp only) */}
      {isWhatsAppOrder && whatsappOrder && (
        <div className="mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <Phone className="w-3 h-3" />
            <span>{formatPhone(whatsappOrder.customerPhone)}</span>
          </div>
          {whatsappOrder.customerAddress && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{whatsappOrder.customerAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="mb-3">
        <div className="space-y-1">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex-1">
                <span className="font-medium text-gray-800">
                  {item.quantity}x {item.menuItemSnapshot?.name || 'Item'}
                </span>
                {item.notes && (
                  <div className="text-gray-500 text-xs">({item.notes})</div>
                )}
              </div>
              <span className="text-gray-600">
                {formatPrice((item.menuItemSnapshot?.price || 0) * item.quantity)}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-xs text-gray-500">
              +{order.items.length - 3} itens adicionais
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>Observações:</strong> {order.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <>
            <button
              onClick={() => onStatusUpdate(order.id, 'confirmed')}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium transition-colors hover:bg-green-700"
            >
              Preparar
            </button>
            <button
              onClick={() => onStatusUpdate(order.id, 'cancelled')}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium transition-colors hover:bg-red-700"
            >
              Recusar
            </button>
          </>
        )}
        
        {order.status === 'confirmed' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'preparing')}
            className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors hover:bg-orange-700"
          >
            Iniciar Preparo
          </button>
        )}
        
        {order.status === 'preparing' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'ready')}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium transition-colors hover:bg-green-700"
          >
            Marcar Pronto
          </button>
        )}
        
        {order.status === 'ready' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'delivered')}
            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors hover:bg-gray-700"
          >
            Marcar Entregue
          </button>
        )}
        
        {order.status === 'delivered' && (
          <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium text-center">
            Pedido Finalizado
          </div>
        )}
        
        {order.status === 'cancelled' && (
          <div className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-medium text-center">
            Pedido Recusado
          </div>
        )}
      </div>
    </div>
  );
};
