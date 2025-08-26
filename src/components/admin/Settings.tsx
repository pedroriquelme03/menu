import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Settings as SettingsIcon, Users, CreditCard, Bell } from 'lucide-react';

export const Settings: React.FC = () => {
  const { state } = useRestaurant();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-gray-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <p className="text-gray-600">Gerencie configurações do sistema</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staff Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Equipe</h3>
          </div>
          
          <div className="space-y-3">
            {state.staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'cashier' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'kitchen' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    member.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Configurações de Pagamento</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Taxa de Serviço</h4>
                <p className="text-sm text-gray-600">Percentual aplicado automaticamente</p>
              </div>
              <span className="text-lg font-bold text-green-600">10%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Métodos Aceitos</h4>
                <p className="text-sm text-gray-600">Formas de pagamento disponíveis</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Cartão</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">PIX</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Dinheiro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Notificações</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Novos Pedidos</h4>
                <p className="text-sm text-gray-600">Notificar sobre pedidos recebidos</p>
              </div>
              <input type="checkbox" defaultChecked className="text-orange-600" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Pedidos Prontos</h4>
                <p className="text-sm text-gray-600">Notificar quando pedidos estiverem prontos</p>
              </div>
              <input type="checkbox" defaultChecked className="text-orange-600" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Pagamentos</h4>
                <p className="text-sm text-gray-600">Notificar sobre pagamentos processados</p>
              </div>
              <input type="checkbox" defaultChecked className="text-orange-600" />
            </label>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistema</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Versão:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mesas Configuradas:</span>
              <span className="font-medium">{state.tables.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Itens no Cardápio:</span>
              <span className="font-medium">{state.menu.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Membros da Equipe:</span>
              <span className="font-medium">{state.staff.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};