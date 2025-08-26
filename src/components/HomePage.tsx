import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ChefHat, Asterisk as CashRegister, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';

export const HomePage: React.FC = () => {
  const { state } = useRestaurant();
  const [showTables, setShowTables] = useState(false);

  // Filtrar mesas disponíveis (não ocupadas)
  const availableTables = state.tables.filter(table => !table.isOccupied);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Sistema de Pedidos QR
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema completo de gerenciamento de pedidos para restaurantes via QR Code
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Cliente */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Cliente</h3>
              <p className="text-gray-600 mb-6">
                Escaneie o QR code da mesa e faça seus pedidos diretamente pelo celular
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowTables(!showTables)}
                  className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {showTables ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Ocultar Mesas
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Escolher uma Mesa
                    </>
                  )}
                </button>
                
                {showTables && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
                    {availableTables.length > 0 ? (
                      availableTables.map((table) => (
                        <Link
                          key={table.id}
                          to={`/table/${table.token}`}
                          className="block bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors text-sm border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Mesa {table.number}</span>
                            <span className="text-xs text-gray-500">
                              {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">Todas as mesas estão ocupadas</p>
                        <p className="text-xs text-gray-400 mt-1">Aguarde uma mesa ficar disponível</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cozinha KDS */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Cozinha</h3>
              <p className="text-gray-600 mb-6">
                Painel KDS para acompanhar e gerenciar os pedidos em tempo real
              </p>
              <Link
                to="/kds"
                className="block bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                Acessar KDS
              </Link>
            </div>
          </div>

          {/* Admin/Caixa */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 md:col-span-2 lg:col-span-1">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CashRegister className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin/Caixa</h3>
              <p className="text-gray-600 mb-6">
                Gerencie mesas, pagamentos, cardápio e visualize relatórios
              </p>
              <Link
                to="/admin"
                className="block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Acessar Painel
              </Link>
            </div>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Principais Funcionalidades
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Multi-convidados</h3>
              <p className="text-sm text-gray-600">Cada pessoa tem seu carrinho individual</p>
            </div>
            <div className="text-center">
              <QrCode className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">QR Code único</h3>
              <p className="text-sm text-gray-600">Token seguro por mesa</p>
            </div>
            <div className="text-center">
              <ChefHat className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">KDS Integrado</h3>
              <p className="text-sm text-gray-600">Painel da cozinha em tempo real</p>
            </div>
            <div className="text-center">
              <CashRegister className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Conta dividida</h3>
              <p className="text-sm text-gray-600">Pagamento individual ou conjunto</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Sistema de Pedidos QR - Desenvolvido para restaurantes</p>
        </div>
      </div>
    </div>
  );
};