import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';

export const HomePage: React.FC = () => {
  const { state } = useRestaurant();
  const [showTables, setShowTables] = useState(false);

  // Filtrar mesas disponíveis (não ocupadas)
  const availableTables = state.tables.filter(table => !table.isOccupied);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Bem-vindo ao Restaurante
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha uma mesa disponível para começar a fazer seus pedidos
          </p>
        </div>

        {/* Card Principal - Escolher Mesa */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
              <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <QrCode className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Escolher uma Mesa</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Clique no botão abaixo para ver as mesas disponíveis e começar a fazer seus pedidos
              </p>
              
              <button
                onClick={() => setShowTables(!showTables)}
                className="w-full bg-orange-600 text-white px-8 py-4 rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg flex items-center justify-center gap-3 mb-6"
              >
                {showTables ? (
                  <>
                    <ChevronUp className="w-6 h-6" />
                    Ocultar Mesas Disponíveis
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-6 h-6" />
                    Ver Mesas Disponíveis
                  </>
                )}
              </button>
              
              {showTables && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-3 max-h-64 overflow-y-auto">
                  {availableTables.length > 0 ? (
                    availableTables.map((table) => (
                      <Link
                        key={table.id}
                        to={`/table/${table.token}`}
                        className="block bg-white text-gray-800 px-6 py-4 rounded-lg hover:bg-orange-50 transition-colors text-base border border-gray-200 hover:border-orange-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">Mesa {table.number}</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-base">Todas as mesas estão ocupadas</p>
                      <p className="text-sm text-gray-400 mt-2">Aguarde uma mesa ficar disponível</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Escaneie o QR code da mesa ou escolha uma mesa disponível para começar</p>
        </div>
      </div>
    </div>
  );
};