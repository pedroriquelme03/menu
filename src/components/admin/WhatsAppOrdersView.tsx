import React, { useState, useEffect } from 'react';
import { WhatsAppService } from '../../services/whatsappService';
import { WhatsAppOrder } from '../../types';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Phone, 
  MapPin, 
  CreditCard,
  Filter,
  RefreshCw
} from 'lucide-react';

type WhatsAppFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

export const WhatsAppOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<WhatsAppFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WhatsAppOrder | null>(null);

  const filters = [
    { id: 'all' as WhatsAppFilter, label: 'Todos', icon: MessageCircle },
    { id: 'pending' as WhatsAppFilter, label: 'Pendentes', icon: Clock },
    { id: 'confirmed' as WhatsAppFilter, label: 'Confirmados', icon: CheckCircle },
    { id: 'preparing' as WhatsAppFilter, label: 'Preparando', icon: Package },
    { id: 'ready' as WhatsAppFilter, label: 'Prontos', icon: Truck },
    { id: 'delivered' as WhatsAppFilter, label: 'Entregues', icon: CheckCircle }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const whatsappOrders = await WhatsAppService.getWhatsAppOrders();
      setOrders(whatsappOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos WhatsApp:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const success = await WhatsAppService.updateWhatsAppOrderStatus(orderId, newStatus);
      if (success) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any, updatedAt: new Date() }
            : order
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handlePaymentUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const success = await WhatsAppService.updatePaymentStatus(orderId, paymentStatus);
      if (success) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus: paymentStatus as any, updatedAt: new Date() }
            : order
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const orderCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const formatPhone = (phone: string) => {
    // Formatar telefone brasileiro
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pedidos WhatsApp</h2>
            <p className="text-gray-600">Gerenciar pedidos recebidos via WhatsApp</p>
          </div>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filters.slice(1).map((filter) => {
          const Icon = filter.icon;
          const count = orderCounts[filter.id as keyof typeof orderCounts] || 0;
          
          return (
            <div key={filter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{filter.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filtros</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto">
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {activeFilter === 'all' ? 'Nenhum pedido WhatsApp' : `Nenhum pedido ${activeFilter}`}
            </h3>
            <p className="text-gray-600">
              {activeFilter === 'all' 
                ? 'Quando houver pedidos via WhatsApp, eles aparecerão aqui'
                : `Pedidos ${activeFilter} aparecerão nesta seção`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Pedido #{order.id.slice(-8)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{formatPhone(order.customerPhone)}</span>
                    </div>
                    {order.customerName && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                    )}
                    {order.customerAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{order.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {formatPrice(order.total)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.createdAt.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Itens do Pedido:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.menuItemSnapshot.name}</div>
                        <div className="text-sm text-gray-600">
                          Quantidade: {item.quantity}
                          {item.notes && ` • ${item.notes}`}
                        </div>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Personalizações: {item.customizations.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {formatPrice(item.menuItemSnapshot.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {order.paymentMethod && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {order.paymentMethod === 'cash' ? 'Dinheiro' : 
                         order.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus === 'completed' ? 'Pago' :
                         order.paymentStatus === 'pending' ? 'Pendente' : 'Falhou'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Confirmar
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Iniciar Preparo
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Marcar Pronto
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Marcar Entregue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
