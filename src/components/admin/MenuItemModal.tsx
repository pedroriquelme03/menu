import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Save } from 'lucide-react';
import { MenuItem } from '../../types';
import { DatabaseService } from '../../services/databaseService';
import { useRestaurant } from '../../contexts/RestaurantContext';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: MenuItem | null;
}

const CATEGORIES = [
  'Entradas',
  'Pratos Principais',
  'Sobremesas',
  'Bebidas',
  'Acompanhamentos',
  'Saladas',
  'Sopas',
  'Fast Food'
];

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit
}) => {
  const { dispatch } = useRestaurant();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Pratos Principais');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price.toString());
      setCategory(itemToEdit.category);
      setImageUrl(itemToEdit.imageUrl || '');
      setIsAvailable(itemToEdit.isAvailable);
    } else {
      // Reset form for new item
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Pratos Principais');
      setImageUrl('');
      setIsAvailable(true);
    }
    setError('');
  }, [itemToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome do item é obrigatório');
      return;
    }

    if (!price.trim() || parseFloat(price) <= 0) {
      setError('Preço deve ser um valor positivo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isEditing && itemToEdit) {
        // Atualizar item existente
        const success = await DatabaseService.updateMenuItem(itemToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          imageUrl: imageUrl.trim() || undefined,
          isAvailable
        });

        if (success) {
          // Atualizar no estado global
          const updatedItem: MenuItem = {
            ...itemToEdit,
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category,
            imageUrl: imageUrl.trim() || undefined,
            isAvailable
          };
          
          dispatch({ type: 'UPDATE_MENU_ITEM', payload: updatedItem });
          onClose();
        } else {
          setError('Erro ao atualizar item. Tente novamente.');
        }
      } else {
        // Criar novo item
        const newItem = await DatabaseService.createMenuItem({
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          imageUrl: imageUrl.trim() || undefined,
          isAvailable
        });

        if (newItem) {
          dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
          onClose();
        } else {
          setError('Erro ao criar item. Tente novamente.');
        }
      }
    } catch (err) {
      console.error('Erro ao salvar item:', err);
      setError(`Erro ao salvar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="w-6 h-6 text-blue-600" />
                Editar Item
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-green-600" />
                Novo Item
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Item *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: X-Burger, Coca-Cola..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o item..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Preço *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-gray-700">
              Item disponível
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Criar Item
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
