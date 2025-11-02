import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { WhatsAppService } from '../../services/whatsappService';
import { DatabaseService } from '../../services/databaseService';
import { UnifiedOrderTicket } from './UnifiedOrderTicket';
import { Order, WhatsAppOrder } from '../../types';
import { ChefHat, Clock, CheckCircle, Package, MessageCircle, Users, RefreshCw } from 'lucide-react';

type KDSFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'cancelled';
type OrderSource = 'all' | 'table' | 'whatsapp';

export const KDSApp: React.FC = () => {
  const { state } = useRestaurant();
  const [activeFilter, setActiveFilter] = useState<KDSFilter>('all');
  const [activeSource, setActiveSource] = useState<OrderSource>('all');
  const [whatsappOrders, setWhatsappOrders] = useState<WhatsAppOrder[]>([]);
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { id: 'all' as KDSFilter, label: 'Todos', icon: ChefHat },
    { id: 'pending' as KDSFilter, label: 'Pendentes', icon: Clock },
    { id: 'confirmed' as KDSFilter, label: 'Confirmados', icon: CheckCircle },
    { id: 'preparing' as KDSFilter, label: 'Preparando', icon: Clock },
    { id: 'ready' as KDSFilter, label: 'Prontos', icon: Package },
    { id: 'cancelled' as KDSFilter, label: 'Recusados', icon: Package }
  ];

  const sourceFilters = [
    { id: 'all' as OrderSource, label: 'Todos', icon: ChefHat },
    { id: 'table' as OrderSource, label: 'Mesas', icon: Users },
    { id: 'whatsapp' as OrderSource, label: 'WhatsApp', icon: MessageCircle }
  ];

  useEffect(() => {
    loadOrders();
    // Atualizar pedidos a cada 5 segundos
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const [whatsapp, table] = await Promise.all([
        WhatsAppService.getWhatsAppOrders(),
        DatabaseService.getOrders()
      ]);
      setWhatsappOrders(whatsapp);
      setTableOrders(table);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      // Verificar se é um pedido WhatsApp ou de mesa
      const whatsappOrder = whatsappOrders.find(o => o.id === orderId);
      const tableOrder = tableOrders.find(o => o.id === orderId);

      if (whatsappOrder) {
        const success = await WhatsAppService.updateWhatsAppOrderStatus(orderId, status);
        if (success) {
          setWhatsappOrders(orders => 
            orders.map(order => 
              order.id === orderId 
                ? { ...order, status: status as any, updatedAt: new Date() }
                : order
            )
          );
        }
      } else if (tableOrder) {
        // Atualizar pedido de mesa usando o DatabaseService
        const success = await DatabaseService.updateOrderStatus(orderId, status);
        if (success) {
          // Atualizar o estado local e recarregar
          setTableOrders(orders =>
            orders.map(order =>
              order.id === orderId
                ? { ...order, status: status as any, updatedAt: new Date() }
                : order
            )
          );
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Combinar pedidos de mesa e WhatsApp
  const allOrders = [
    ...tableOrders.map(order => ({ ...order, orderType: 'table' as const })),
    ...whatsappOrders.map(order => ({ ...order, orderType: 'whatsapp' as const }))
  ];

  const filteredOrders = allOrders.filter(order => {
    // Filtro por status
    const statusMatch = activeFilter === 'all' 
      ? order.status !== 'delivered'
      : order.status === activeFilter;

    // Filtro por fonte
    const sourceMatch = activeSource === 'all' 
      ? true 
      : order.orderType === activeSource;

    return statusMatch && sourceMatch;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const orderCounts = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
    preparing: allOrders.filter(o => o.status === 'preparing').length,
    ready: allOrders.filter(o => o.status === 'ready').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-green-600" />
                Sistema da Cozinha (KDS)
              </h1>
              <p className="text-gray-600 mt-1">Painel de controle de pedidos</p>
            </div>
            <button
              onClick={loadOrders}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="space-y-4">
          {/* Status Filters */}
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

          {/* Source Filters */}
          <div className="flex gap-4 overflow-x-auto">
            {sourceFilters.map((filter) => {
              const Icon = filter.icon;
              const count = filter.id === 'all' 
                ? allOrders.length 
                : allOrders.filter(o => o.orderType === filter.id).length;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveSource(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    activeSource === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                  {count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeSource === filter.id
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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
              <UnifiedOrderTicket 
                key={order.id} 
                order={order} 
                onStatusUpdate={handleStatusUpdate}
                tables={state.tables.map(t => ({ id: t.id, number: t.number }))}
                seats={state.seats.map(s => ({ id: s.id, guestName: s.guestName, seatNumber: s.seatNumber }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};