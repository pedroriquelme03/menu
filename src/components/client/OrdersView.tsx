import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Clock, CheckCircle, ChefHat, Package } from 'lucide-react';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pendente' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmado' },
  preparing: { icon: ChefHat, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Preparando' },
  ready: { icon: Package, color: 'text-green-600', bg: 'bg-green-100', label: 'Pronto' },
  delivered: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-200', label: 'Entregue' },
  cancelled: { icon: Clock, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelado' }
};

export const OrdersView: React.FC = () => {
  const { state } = useRestaurant();
  
  const myOrders = state.currentSeat 
    ? state.orders
        .filter(order => order.seatId === state.currentSeat!.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const formatTime = (date: Date) => 
    new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  if (myOrders.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum pedido ainda</h2>
        <p className="text-gray-600">Seus pedidos aparecerão aqui com o status em tempo real</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {myOrders.map((order) => {
        const config = statusConfig[order.status as keyof typeof statusConfig];
        const StatusIcon = config.icon;
        
        return (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${config.bg} p-2 rounded-full`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Pedido #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatTime(order.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatPrice(order.subtotal)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-t border-gray-100 first:border-t-0">
                  <div className="flex-1">
                    <span className="text-gray-800">{item.menuItemSnapshot.name}</span>
                    {item.selectedModifiers.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {item.selectedModifiers.map((mod) => (
                          <span key={mod.modifierId} className="block">
                            {mod.modifierName}: {mod.selectedOptions.map(opt => opt.name).join(', ')}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1">Obs: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-gray-600">{item.quantity}x</span>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                      statusConfig[item.status as keyof typeof statusConfig]?.bg
                    } ${statusConfig[item.status as keyof typeof statusConfig]?.color}`}>
                      {statusConfig[item.status as keyof typeof statusConfig]?.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Observações:</span> {order.notes}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};