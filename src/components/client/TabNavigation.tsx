import React from 'react';
import { Menu, ShoppingCart, Clock, Receipt } from 'lucide-react';

type ClientTab = 'menu' | 'cart' | 'orders' | 'bill';

interface TabNavigationProps {
  activeTab: ClientTab;
  onTabChange: (tab: ClientTab) => void;
  cartItemsCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  cartItemsCount
}) => {
  const tabs = [
    { id: 'menu' as ClientTab, label: 'Cardápio', icon: Menu },
    { id: 'cart' as ClientTab, label: 'Carrinho', icon: ShoppingCart, badge: cartItemsCount > 0 ? cartItemsCount : undefined },
    { id: 'orders' as ClientTab, label: 'Pedidos', icon: Clock },
    { id: 'bill' as ClientTab, label: 'Conta', icon: Receipt }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative ${
                isActive 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              
              {tab.badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};