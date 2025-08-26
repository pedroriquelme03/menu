import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { JoinTable } from './JoinTable';
import { MenuView } from './MenuView';
import { CartView } from './CartView';
import { OrdersView } from './OrdersView';
import { BillView } from './BillView';
import { TabNavigation } from './TabNavigation';

type ClientTab = 'menu' | 'cart' | 'orders' | 'bill';

export const ClientApp: React.FC = () => {
  const { tableToken } = useParams<{ tableToken: string }>();
  const { state } = useRestaurant();
  const [activeTab, setActiveTab] = useState<ClientTab>('menu');
  const [currentTable, setCurrentTable] = useState(null);

  useEffect(() => {
    if (tableToken && state.tables.length > 0) {
      const table = state.tables.find(t => t.token === tableToken);
      setCurrentTable(table || null);
    }
  }, [tableToken, state.tables]);

  if (!currentTable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mesa não encontrada</h2>
          <p className="text-gray-600">Token da mesa inválido ou expirado</p>
        </div>
      </div>
    );
  }

  if (!state.currentSeat) {
    return <JoinTable table={currentTable} />;
  }

  const cartItemsCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Mesa {currentTable.number}</h1>
              <p className="text-sm text-gray-600">
                {state.currentSeat.guestName || `Convidado ${state.currentSeat.seatNumber || 1}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Online</div>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'menu' && <MenuView />}
        {activeTab === 'cart' && <CartView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'bill' && <BillView />}
      </div>

      {/* Bottom Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartItemsCount={cartItemsCount}
      />
    </div>
  );
};