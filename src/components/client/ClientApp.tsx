import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useTableSession } from '../../hooks/useTableSession';
import { Table } from '../../types';
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
  const { currentTable, currentSeat, isInTable, isLoading } = useTableSession();
  const [activeTab, setActiveTab] = useState<ClientTab>('menu');
  const [tableFromToken, setTableFromToken] = useState<Table | null>(null);

  useEffect(() => {
    if (tableToken && state.tables.length > 0) {
      const table = state.tables.find(t => t.token === tableToken);
      setTableFromToken(table || null);
    }
  }, [tableToken, state.tables]);

  // Se não há mesa do token da URL, mostrar erro
  if (!tableFromToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mesa não encontrada</h2>
          <p className="text-gray-600">Token da mesa inválido ou expirado</p>
        </div>
      </div>
    );
  }

  // Se ainda está carregando a sessão, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Carregando...</h2>
          <p className="text-gray-600">Restaurando sua sessão</p>
        </div>
      </div>
    );
  }

  // Se há uma sessão ativa para esta mesa, usar ela
  if (isInTable && currentTable && currentSeat && currentTable.id === tableFromToken.id) {
    // Usar a mesa da sessão ativa
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
                  {currentSeat.guestName || `Convidado ${currentSeat.seatNumber || 1}`}
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
  } else {
    // Mostrar tela de entrada na mesa
    return <JoinTable table={tableFromToken} />;
  }
};