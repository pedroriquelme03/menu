import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Receipt, Users, CreditCard } from 'lucide-react';

export const BillView: React.FC = () => {
  const { state } = useRestaurant();

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  if (!state.currentSeat) return null;

  const currentTable = state.tables.find(t => t.id === state.currentSeat!.tableId);
  const tableSeats = state.seats.filter(seat => seat.tableId === state.currentSeat!.tableId);
  const myOrders = state.orders.filter(order => order.seatId === state.currentSeat!.id);
  const tableOrders = state.orders.filter(order => order.tableId === state.currentSeat!.tableId);

  const myTotal = myOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const tableTotal = tableOrders.reduce((sum, order) => sum + order.subtotal, 0);

  const serviceCharge = tableTotal * 0.1; // 10% taxa de serviço
  const tableTotalWithService = tableTotal + serviceCharge;

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Receipt className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Mesa {currentTable?.number} - Conta
          </h2>
        </div>
        <p className="text-gray-600">
          {tableSeats.length} {tableSeats.length === 1 ? 'convidado' : 'convidados'} na mesa
        </p>
      </div>

      {/* Minha Conta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Minha Conta Individual
        </h3>

        {myOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Você ainda não fez pedidos</p>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order) => (
              <div key={order.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    Pedido #{order.id.slice(0, 8)}
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.menuItemSnapshot.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold text-lg">
              <span>Total Individual:</span>
              <span className="text-blue-600">{formatPrice(myTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Conta da Mesa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          Resumo da Mesa
        </h3>

        <div className="space-y-3">
          {tableSeats.map((seat) => {
            const seatOrders = state.orders.filter(order => order.seatId === seat.id);
            const seatTotal = seatOrders.reduce((sum, order) => sum + order.subtotal, 0);
            
            return (
              <div key={seat.id} className="flex justify-between items-center">
                <span className={`${seat.id === state.currentSeat?.id ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                  {seat.guestName || `Convidado ${seat.seatNumber}`}
                  {seat.id === state.currentSeat?.id && ' (Você)'}
                </span>
                <span className="font-medium">{formatPrice(seatTotal)}</span>
              </div>
            );
          })}
          
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">{formatPrice(tableTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Taxa de Serviço (10%):</span>
              <span className="font-medium">{formatPrice(serviceCharge)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-2">
              <span>Total da Mesa:</span>
              <span className="text-orange-600">{formatPrice(tableTotalWithService)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <h4 className="font-semibold text-orange-800 mb-2">💡 Formas de Pagamento</h4>
        <p className="text-sm text-orange-700 mb-3">
          O pagamento é processado pelo caixa. Você pode:
        </p>
        <ul className="text-sm text-orange-700 space-y-1 list-disc ml-4">
          <li>Pagar apenas sua parte individual</li>
          <li>Dividir igualmente com todos</li>
          <li>Pagar a conta inteira da mesa</li>
        </ul>
      </div>
    </div>
  );
};