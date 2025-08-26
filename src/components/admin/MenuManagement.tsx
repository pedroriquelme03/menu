import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { MenuItem } from '../../types';
import { Menu, Plus, Edit2, Eye, EyeOff } from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { state } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(state.menu.map(item => item.category))];
  
  const filteredMenu = state.menu.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestão do Cardápio</h2>
            <p className="text-gray-600">Gerencie itens, categorias e disponibilidade</p>
          </div>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-800">{state.menu.length}</div>
          <div className="text-sm text-gray-600">Total de Itens</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {state.menu.filter(item => item.isAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Disponíveis</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {state.menu.filter(item => !item.isAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Indisponíveis</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-800">{categories.length - 1}</div>
          <div className="text-sm text-gray-600">Categorias</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Todas as Categorias' : category}
              <span className="ml-2 text-sm opacity-75">
                ({category === 'all' 
                  ? state.menu.length 
                  : state.menu.filter(item => item.category === category).length
                })
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">
            Itens do Cardápio ({filteredMenu.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredMenu.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                {/* Image */}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isAvailable ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Categoria: {item.category}</span>
                    <span className="font-bold text-orange-600 text-lg">
                      {formatPrice(item.price)}
                    </span>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <span className="text-blue-600">
                        {item.modifiers.length} modificador{item.modifiers.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      item.isAvailable
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-red-600 hover:bg-red-100'
                    }`}
                    title={item.isAvailable ? 'Disponível' : 'Indisponível'}
                  >
                    {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};