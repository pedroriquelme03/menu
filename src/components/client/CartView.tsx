import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Order, OrderItem } from '../../types';
import { Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const CartView: React.FC = () => {
  const { state, dispatch } = useRestaurant();

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const calculateItemTotal = (item: OrderItem) => {
    let total = item.menuItemSnapshot.price;
    item.selectedModifiers.forEach(modifier => {
      modifier.selectedOptions.forEach(option => {
        total += option.price;
      });
    });
    return total * item.quantity;
  };

  const cartTotal = state.cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: itemId, quantity } });
    }
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const sendOrder = () => {
    if (state.cart.length === 0 || !state.currentSeat) return;

    const order: Order = {
      id: uuidv4(),
      tableId: state.currentSeat.tableId,
      seatId: state.currentSeat.id,
      items: [...state.cart],
      subtotal: cartTotal,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dispatch({ type: 'CREATE_ORDER', payload: order });
    dispatch({ type: 'CLEAR_CART' });
    
    // Simulate status updates
    setTimeout(() => {
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'confirmed' } });
    }, 2000);
    
    setTimeout(() => {
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'preparing' } });
    }, 5000);
  };

  if (state.cart.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Carrinho vazio</h2>
        <p className="text-gray-600">Adicione itens do cardápio para fazer seu pedido</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="space-y-4 mb-6">
        {state.cart.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.menuItemSnapshot.name}</h3>
                <p className="text-orange-600 font-medium">
                  {formatPrice(calculateItemTotal(item) / item.quantity)} cada
                </p>
                
                {item.selectedModifiers.length > 0 && (
                  <div className="mt-2 space-y-1">
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
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Obs:</span> {item.notes}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <span className="font-bold text-lg text-gray-800">
                {formatPrice(calculateItemTotal(item))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total and Send Order */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky bottom-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-800">Total</span>
          <span className="text-xl font-bold text-orange-600">
            {formatPrice(cartTotal)}
          </span>
        </div>
        
        <button
          onClick={sendOrder}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Enviar Pedido
        </button>
      </div>
    </div>
  );
};