import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Utensils } from 'lucide-react';
import { MenuItem } from '../../types';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { MenuItemModal } from './MenuItemModal';
import { DatabaseService } from '../../services/databaseService';

export const MenuManagement: React.FC = () => {
  const { state, dispatch } = useRestaurant();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Obter categorias únicas
  const categories = ['Todas', ...Array.from(new Set(state.menu.map(item => item.category)))];

  // Filtrar itens por categoria
  const filteredItems = selectedCategory === 'Todas' 
    ? state.menu 
    : state.menu.filter(item => item.category === selectedCategory);

  const handleEdit = (item: MenuItem) => {
    setItemToEdit(item);
    setShowCreateModal(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    setIsDeleting(itemId);
    try {
      const success = await DatabaseService.deleteMenuItem(itemId);
      if (success) {
        dispatch({ type: 'DELETE_MENU_ITEM', payload: itemId });
      }
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setItemToEdit(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Utensils className="w-8 h-8 text-orange-600" />
          Gerenciar Cardápio
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Novo Item
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">{state.menu.length}</div>
          <div className="text-sm text-gray-600">Total de Itens</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {state.menu.filter(item => item.isAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Disponíveis</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {state.menu.filter(item => !item.isAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Indisponíveis</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {Array.from(new Set(state.menu.map(item => item.category))).length}
          </div>
          <div className="text-sm text-gray-600">Categorias</div>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <Utensils className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isAvailable ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Disponível
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Indisponível
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting === item.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="Excluir"
                        >
                          {isDeleting === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Utensils className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">Nenhum item encontrado</p>
                      <p className="text-sm">Comece criando seu primeiro item do cardápio</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para criar/editar item */}
      <MenuItemModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        itemToEdit={itemToEdit}
      />
    </div>
  );
};