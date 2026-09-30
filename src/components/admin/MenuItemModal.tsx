import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Save, ChefHat, GlassWater } from 'lucide-react';
import { MenuItem, PrepStation } from '../../types';
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

function defaultStationForCategory(category: string): PrepStation {
  return category.toLowerCase().includes('bebida') ? 'cambuza' : 'kitchen';
}

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
  const [station, setStation] = useState<PrepStation>('kitchen');
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
      setStation(itemToEdit.station || defaultStationForCategory(itemToEdit.category));
      setImageUrl(itemToEdit.imageUrl || '');
      setIsAvailable(itemToEdit.isAvailable);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Pratos Principais');
      setStation('kitchen');
      setImageUrl('');
      setIsAvailable(true);
    }
    setError('');
  }, [itemToEdit]);

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    if (!isEditing) {
      setStation(defaultStationForCategory(nextCategory));
    }
  };

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
        const success = await DatabaseService.updateMenuItem(itemToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          station,
          imageUrl: imageUrl.trim() || undefined,
          isAvailable
        });

        if (success) {
          const updatedItem: MenuItem = {
            ...itemToEdit,
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category,
            station,
            imageUrl: imageUrl.trim() || undefined,
            isAvailable
          };

          dispatch({ type: 'UPDATE_MENU_ITEM', payload: updatedItem });
          onClose();
        } else {
          setError('Erro ao atualizar item. Tente novamente.');
        }
      } else {
        const newItem = await DatabaseService.createMenuItem({
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          station,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            {isEditing ? (
              <>
                <Edit className="h-6 w-6 text-blue-600" />
                Editar Item
              </>
            ) : (
              <>
                <Plus className="h-6 w-6 text-green-600" />
                Novo Item
              </>
            )}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Nome do Item *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: X-Burger, Coca-Cola..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o item..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                Categoria
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-2 block text-sm font-medium text-gray-700">Destino do pedido *</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStation('kitchen')}
                className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition ${
                  station === 'kitchen'
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <ChefHat className="h-4 w-4" />
                  Cozinha
                </span>
                <span className="text-xs opacity-80">Precisa preparar (pratos, porções…)</span>
              </button>
              <button
                type="button"
                onClick={() => setStation('cambuza')}
                className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition ${
                  station === 'cambuza'
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <GlassWater className="h-4 w-4" />
                  Cambuza
                </span>
                <span className="text-xs opacity-80">Pronto p/ servir (água, refri…)</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-gray-700">
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-gray-700">
              Item disponível
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
