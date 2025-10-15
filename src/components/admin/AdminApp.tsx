import React, { useState } from 'react';
import { TablesView } from './TablesView';
import { MenuManagement } from './MenuManagement';
import { ReportsView } from './ReportsView';
import { Settings } from './Settings';
import { WhatsAppOrdersView } from './WhatsAppOrdersView';
import { SystemConfigView } from './SystemConfigView';
import { LayoutGrid, Menu, BarChart3, Settings as SettingsIcon, Asterisk as CashRegister, MessageCircle, Cog } from 'lucide-react';

type AdminTab = 'tables' | 'menu' | 'whatsapp' | 'reports' | 'settings' | 'system';

export const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('tables');

  const tabs = [
    { id: 'tables' as AdminTab, label: 'Mesas', icon: LayoutGrid },
    { id: 'menu' as AdminTab, label: 'Cardápio', icon: Menu },
    { id: 'whatsapp' as AdminTab, label: 'WhatsApp', icon: MessageCircle },
    { id: 'reports' as AdminTab, label: 'Relatórios', icon: BarChart3 },
    { id: 'settings' as AdminTab, label: 'Configurações', icon: SettingsIcon },
    { id: 'system' as AdminTab, label: 'Sistema', icon: Cog }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <CashRegister className="w-8 h-8 text-blue-600" />
            Painel Administrativo
          </h1>
          <p className="text-gray-600 mt-1">Gestão completa do restaurante</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <nav className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'tables' && <TablesView />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'whatsapp' && <WhatsAppOrdersView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'system' && <SystemConfigView />}
      </div>
    </div>
  );
};