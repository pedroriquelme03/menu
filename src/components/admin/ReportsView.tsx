import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { state } = useRestaurant();

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const totalOrders = state.orders.length;
  const completedOrders = state.orders.filter(order => order.status === 'delivered').length;
  const totalRevenue = state.orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.subtotal, 0);

  const averageTicket = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Popular items
  const itemCount = new Map();
  state.orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.menuItemSnapshot.name;
      itemCount.set(name, (itemCount.get(name) || 0) + item.quantity);
    });
  });

  const popularItems = Array.from(itemCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Revenue by table
  const tableRevenue = new Map();
  state.orders
    .filter(order => order.status === 'delivered')
    .forEach(order => {
      const table = state.tables.find(t => t.id === order.tableId);
      if (table) {
        const tableNumber = table.number;
        tableRevenue.set(tableNumber, (tableRevenue.get(tableNumber) || 0) + order.subtotal);
      }
    });

  const topTables = Array.from(tableRevenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise de performance do restaurante</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-800">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Totais</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-800">{formatPrice(averageTicket)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa Conclusão</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Itens Mais Pedidos
          </h3>
          {popularItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pedido realizado ainda</p>
          ) : (
            <div className="space-y-4">
              {popularItems.map(([itemName, quantity], index) => (
                <div key={itemName} className="flex items-center gap-3">
                  <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{itemName}</h4>
                    <p className="text-sm text-gray-600">{quantity} vendidos</p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(quantity / popularItems[0][1]) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tables by Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Mesas por Receita
          </h3>
          {topTables.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma venda finalizada ainda</p>
          ) : (
            <div className="space-y-4">
              {topTables.map(([tableNumber, revenue], index) => (
                <div key={tableNumber} className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">Mesa {tableNumber}</h4>
                    <p className="text-sm text-gray-600">{formatPrice(revenue)}</p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(revenue / topTables[0][1]) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders Status Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Status dos Pedidos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: 'pending', label: 'Pendentes', color: 'yellow' },
            { status: 'confirmed', label: 'Confirmados', color: 'blue' },
            { status: 'preparing', label: 'Preparando', color: 'orange' },
            { status: 'ready', label: 'Prontos', color: 'green' },
            { status: 'delivered', label: 'Entregues', color: 'gray' }
          ].map(({ status, label, color }) => {
            const count = state.orders.filter(order => order.status === status).length;
            return (
              <div key={status} className="text-center">
                <div className={`text-2xl font-bold text-${color}-600 mb-1`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};