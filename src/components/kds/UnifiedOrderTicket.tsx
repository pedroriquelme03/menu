import React from 'react';
import { Order, PrepStation, WhatsAppOrder } from '../../types';
import { MessageCircle, Users, Phone, MapPin, Siren } from 'lucide-react';
import { filterItemsByStation, stationLabel } from '../../utils/prepStation';

interface UnifiedOrderTicketProps {
  order: Order | WhatsAppOrder;
  onStatusUpdate: (orderId: string, status: string) => void;
  tables?: Array<{ id: string; number: number }>;
  seats?: Array<{ id: string; guestName?: string; seatNumber?: number }>;
  stationFilter?: PrepStation;
}

export const UnifiedOrderTicket: React.FC<UnifiedOrderTicketProps> = ({
  order,
  onStatusUpdate,
  tables = [],
  seats = [],
  stationFilter,
}) => {
  const isWhatsAppOrder = 'customerPhone' in order;
  const whatsappOrder = isWhatsAppOrder ? (order as WhatsAppOrder) : null;
  const tableOrder = !isWhatsAppOrder ? (order as Order) : null;
  const visibleItems = stationFilter
    ? filterItemsByStation(order.items, stationFilter)
    : order.items;

  if (stationFilter && visibleItems.length === 0) {
    return null;
  }

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
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
      default:
        return status;
    }
  };

  const getOrderTitle = () => {
    if (isWhatsAppOrder && whatsappOrder) {
      return `${whatsappOrder.id.startsWith('delivery-') ? 'Delivery' : 'WhatsApp'} #${whatsappOrder.id.slice(-8)}`;
    }
    if (tableOrder) {
      const table = tables.find((t) => t.id === tableOrder.tableId);
      return `Mesa ${table ? table.number : '?'}`;
    }
    return 'Pedido';
  };

  const getOrderSubtitle = () => {
    if (isWhatsAppOrder && whatsappOrder) {
      return whatsappOrder.customerName || formatPhone(whatsappOrder.customerPhone);
    }
    if (tableOrder) {
      const seat = seats.find((s) => s.id === tableOrder.seatId);
      if (seat) return seat.guestName || `Assento ${seat.seatNumber || '?'}`;
      return `Assento ${tableOrder.seatId?.slice(0, 8) || '?'}`;
    }
    return '';
  };

  const getElapsedTime = () => {
    const diffMins = Math.floor(
      (Date.now() - new Date(order.createdAt).getTime()) / 60000
    );
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}min`;
  };

  return (
    <div
      className={`rounded-xl border-2 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        !isWhatsAppOrder && tableOrder?.chaseAlert
          ? 'animate-pulse border-orange-400 ring-2 ring-orange-300'
          : 'border-gray-200'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {isWhatsAppOrder ? (
              <MessageCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Users className="h-4 w-4 text-blue-600" />
            )}
            <h3 className="text-sm font-bold text-gray-800">{getOrderTitle()}</h3>
          </div>
          <p className="text-xs text-gray-600">{getOrderSubtitle()}</p>
          {stationFilter && (
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {stationLabel(stationFilter)}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-gray-500">{getElapsedTime()}</div>
          <div className="text-sm font-bold text-gray-800">
            {isWhatsAppOrder && whatsappOrder
              ? formatPrice(whatsappOrder.total)
              : tableOrder
                ? formatPrice(tableOrder.subtotal)
                : ''}
          </div>
        </div>
      </div>

      {!isWhatsAppOrder && tableOrder?.chaseAlert && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-xs font-bold text-orange-800">
          <Siren className="h-4 w-4" />
          APURAR — garçom solicitou atenção
        </div>
      )}

      <div className="mb-3">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {isWhatsAppOrder && whatsappOrder && (
        <div className="mb-3 space-y-1 rounded-lg bg-gray-50 p-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="h-3 w-3" />
            <span>{formatPhone(whatsappOrder.customerPhone)}</span>
          </div>
          {whatsappOrder.customerAddress && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{whatsappOrder.customerAddress}</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-3 space-y-1">
        {visibleItems.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex-1">
              <span className="font-medium text-gray-800">
                {item.quantity}x {item.menuItemSnapshot?.name || 'Item'}
              </span>
              {item.notes && <div className="text-xs text-gray-500">({item.notes})</div>}
            </div>
            <span className="text-gray-600">
              {formatPrice((item.menuItemSnapshot?.price || 0) * item.quantity)}
            </span>
          </div>
        ))}
        {visibleItems.length > 6 && (
          <div className="text-xs text-gray-500">+{visibleItems.length - 6} itens adicionais</div>
        )}
      </div>

      {order.notes && (
        <div className="mb-3 rounded-lg bg-yellow-50 p-2">
          <p className="text-xs text-gray-700">
            <strong>Observações:</strong> {order.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {order.status === 'pending' && (
          <>
            <button
              type="button"
              onClick={() => onStatusUpdate(order.id, 'confirmed')}
              className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
            >
              {stationFilter === 'cambuza' ? 'Separar' : 'Preparar'}
            </button>
            <button
              type="button"
              onClick={() => onStatusUpdate(order.id, 'cancelled')}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
            >
              Recusar
            </button>
          </>
        )}

        {order.status === 'confirmed' && (
          <button
            type="button"
            onClick={() =>
              onStatusUpdate(
                order.id,
                stationFilter === 'cambuza' ? 'ready' : 'preparing'
              )
            }
            className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white hover:bg-orange-700"
          >
            {stationFilter === 'cambuza' ? 'Pronto para servir' : 'Iniciar Preparo'}
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            type="button"
            onClick={() => onStatusUpdate(order.id, 'ready')}
            className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
          >
            Marcar Pronto
          </button>
        )}

        {order.status === 'ready' && (
          <button
            type="button"
            onClick={() => onStatusUpdate(order.id, 'delivered')}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            {stationFilter === 'cambuza' ? 'Entregue na mesa' : 'Marcar Entregue'}
          </button>
        )}

        {order.status === 'cancelled' && (
          <div className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600">
            Pedido Recusado
          </div>
        )}
      </div>
    </div>
  );
};
