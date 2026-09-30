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
                <div className="bg-gray-50 rounded-xl p-6 space-y-4 max-h-80 overflow-y-auto">
                  {availableTables.length > 0 ? (
                    Array.from(
                      availableTables.reduce((map, table) => {
                        const key = table.praca || 'Salão';
                        const list = map.get(key) || [];
                        list.push(table);
                        map.set(key, list);
                        return map;
                      }, new Map<string, typeof availableTables>())
                    ).map(([praca, tables]) => (
                      <div key={praca} className="space-y-2">
                        <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {praca}
                        </p>
                        {tables
                          .sort((a, b) => a.number - b.number)
                          .map((table) => (
                            <Link
                              key={table.id}
                              to={`/table/${table.token}`}
                              className="block rounded-lg border border-gray-200 bg-white px-6 py-4 text-base text-gray-800 transition-colors hover:border-orange-300 hover:bg-orange-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">Mesa {table.number}</span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                                  {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
                                </span>
                              </div>
                            </Link>
                          ))}
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-base text-gray-500">Nenhuma mesa disponível</p>
                      <p className="mt-2 text-sm text-gray-400">
                        Aguarde ou peça ao salão para cadastrar mesas
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/delivery"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ea1d2c] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-700 sm:w-auto"
          >
            Pedir delivery
          </Link>
          <Link
            to="/reserva"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-6 py-3 text-base font-semibold text-orange-700 shadow-sm transition-colors hover:bg-orange-50 sm:w-auto"
          >
            Solicitar reserva de mesa
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Escaneie o QR code da mesa ou escolha uma mesa disponível para começar</p>
        </div>
      </div>
    </div>
  );
};