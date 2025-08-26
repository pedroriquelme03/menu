import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { OrderTicket } from './OrderTicket';
import { ChefHat, Clock, CheckCircle, Package } from 'lucide-react';

type KDSFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready';

export const KDSApp: React.FC = () => {
  const { state } = useRestaurant();
  const [activeFilter, setActiveFilter] = useState<KDSFilter>('all');

  const filters = [
    { id: 'all' as KDSFilter, label: 'Todos', icon: ChefHat },
    { id: 'confirmed' as KDSFilter, label: 'Confirmados', icon: CheckCircle },
    { id: 'preparing' as KDSFilter, label: 'Preparando', icon: Clock },
    { id: 'ready' as KDSFilter, label: 'Prontos', icon: Package }
  ];

  const filteredOrders = state.orders
    .filter(order => {
      if (activeFilter === 'all') return order.status !== 'delivered' && order.status !== 'cancelled';
      return order.status === activeFilter;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const orderCounts = {
    confirmed: state.orders.filter(o => o.status === 'confirmed').length,
    preparing: state.orders.filter(o => o.status === 'preparing').length,
    ready: state.orders.filter(o => o.status === 'ready').length
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-green-600" />
            Sistema da Cozinha (KDS)
          </h1>
          <p className="text-gray-600 mt-1">Painel de controle de pedidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-4 overflow-x-auto">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const count = filter.id === 'all' 
              ? filteredOrders.length 
              : orderCounts[filter.id as keyof typeof orderCounts] || 0;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                {count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeFilter === filter.id
                      ? 'bg-white text-green-600'
                      : 'bg-green-600 text-white'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {activeFilter === 'all' ? 'Nenhum pedido ativo' : `Nenhum pedido ${activeFilter}`}
            </h2>
            <p className="text-gray-600">
              {activeFilter === 'all' 
                ? 'Quando houver pedidos, eles aparecerão aqui'
                : `Pedidos ${activeFilter} aparecerão nesta seção`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <OrderTicket key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};