import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Table, Payment } from '../../types';
import { X, CreditCard, Banknote, Smartphone, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PaymentModalProps {
  table: Table;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ table, onClose }) => {
  const { state, dispatch } = useRestaurant();
  const [paymentType, setPaymentType] = useState<'full' | 'individual'>('full');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const tableSeats = state.seats.filter(seat => seat.tableId === table.id);
  const tableOrders = state.orders.filter(order => order.tableId === table.id);
  const tableTotal = tableOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const serviceCharge = tableTotal * 0.1;
  const finalTotal = tableTotal + serviceCharge;

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (paymentType === 'full') {
      // Single payment for entire table
      const payment: Payment = {
        id: uuidv4(),
        tableId: table.id,
        amount: finalTotal,
        method: paymentMethod,
        status: 'completed',
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_PAYMENT', payload: payment });
    } else {
      // Individual payments per seat
      tableSeats.forEach(seat => {
        const seatOrders = state.orders.filter(order => order.seatId === seat.id);
        const seatTotal = seatOrders.reduce((sum, order) => sum + order.subtotal, 0);
        const seatWithService = seatTotal + (seatTotal * 0.1);
        
        if (seatTotal > 0) {
          const payment: Payment = {
            id: uuidv4(),
            tableId: table.id,
            seatId: seat.id,
            amount: seatWithService,
            method: paymentMethod,
            status: 'completed',
            createdAt: new Date()
          };
          dispatch({ type: 'ADD_PAYMENT', payload: payment });
        }
      });
    }

    // Close table
    dispatch({ type: 'CLOSE_TABLE', payload: table.id });
    
    setIsProcessing(false);
    onClose();
  };

  const paymentMethods = [
    { id: 'card' as const, label: 'Cartão', icon: CreditCard },
    { id: 'cash' as const, label: 'Dinheiro', icon: Banknote },
    { id: 'pix' as const, label: 'PIX', icon: Smartphone }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">
            Pagamento - Mesa {table.number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Type */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Tipo de Pagamento</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentType === 'full'}
                  onChange={(e) => setPaymentType(e.target.value as 'full')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Conta única</span>
                  </div>
                  <p className="text-sm text-gray-600">Uma pessoa paga toda a conta</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {formatPrice(finalTotal)}
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  value="individual"
                  checked={paymentType === 'individual'}
                  onChange={(e) => setPaymentType(e.target.value as 'individual')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Conta dividida</span>
                  </div>
                  <p className="text-sm text-gray-600">Cada convidado paga sua parte</p>
                </div>
              </label>
            </div>
          </div>

          {/* Individual breakdown */}
          {paymentType === 'individual' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-3">Divisão por convidado:</h4>
              <div className="space-y-2">
                {tableSeats.map((seat, index) => {
                  const seatOrders = state.orders.filter(order => order.seatId === seat.id);
                  const seatTotal = seatOrders.reduce((sum, order) => sum + order.subtotal, 0);
                  const seatWithService = seatTotal + (seatTotal * 0.1);
                  
                  return (
                    <div key={seat.id} className="flex justify-between items-center">
                      <span className="text-green-700">
                        {seat.guestName || `Convidado ${index + 1}`}
                      </span>
                      <span className="font-medium text-green-800">
                        {formatPrice(seatWithService)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Método de Pagamento</h3>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                      className="sr-only"
                    />
                    <Icon className={`w-6 h-6 ${
                      paymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      paymentMethod === method.id ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {method.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Resumo do Pagamento</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatPrice(tableTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de serviço (10%):</span>
                <span>{formatPrice(serviceCharge)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span className="text-blue-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};