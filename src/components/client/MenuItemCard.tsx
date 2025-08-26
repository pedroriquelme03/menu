import React, { useState } from 'react';
import { MenuItem, OrderItem, SelectedModifier } from '../../types';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Plus, Minus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { dispatch } = useRestaurant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [notes, setNotes] = useState('');

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const calculateItemPrice = () => {
    let total = item.price;
    selectedModifiers.forEach(modifier => {
      modifier.selectedOptions.forEach(option => {
        total += option.price;
      });
    });
    return total * quantity;
  };

  const handleModifierChange = (modifierId: string, modifierName: string, option: any, type: 'radio' | 'checkbox') => {
    setSelectedModifiers(prev => {
      const existingModifier = prev.find(m => m.modifierId === modifierId);
      
      if (type === 'radio') {
        // Radio: substitui a seleção
        if (existingModifier) {
          return prev.map(m => 
            m.modifierId === modifierId 
              ? { ...m, selectedOptions: [option] }
              : m
          );
        } else {
          return [...prev, { modifierId, modifierName, selectedOptions: [option] }];
        }
      } else {
        // Checkbox: adiciona/remove da seleção
        if (existingModifier) {
          const hasOption = existingModifier.selectedOptions.some(o => o.id === option.id);
          if (hasOption) {
            // Remove a opção
            const newOptions = existingModifier.selectedOptions.filter(o => o.id !== option.id);
            if (newOptions.length === 0) {
              return prev.filter(m => m.modifierId !== modifierId);
            } else {
              return prev.map(m => 
                m.modifierId === modifierId 
                  ? { ...m, selectedOptions: newOptions }
                  : m
              );
            }
          } else {
            // Adiciona a opção
            return prev.map(m => 
              m.modifierId === modifierId 
                ? { ...m, selectedOptions: [...m.selectedOptions, option] }
                : m
            );
          }
        } else {
          return [...prev, { modifierId, modifierName, selectedOptions: [option] }];
        }
      }
    });
  };

  const isModifierOptionSelected = (modifierId: string, optionId: string) => {
    const modifier = selectedModifiers.find(m => m.modifierId === modifierId);
    return modifier ? modifier.selectedOptions.some(o => o.id === optionId) : false;
  };

  const canAddToCart = () => {
    if (!item.modifiers) return true;
    
    const requiredModifiers = item.modifiers.filter(m => m.required);
    return requiredModifiers.every(requiredMod => 
      selectedModifiers.some(selectedMod => selectedMod.modifierId === requiredMod.id)
    );
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;

    const orderItem: OrderItem = {
      id: uuidv4(),
      menuItemId: item.id,
      menuItemSnapshot: item,
      quantity,
      selectedModifiers,
      notes: notes.trim() || undefined,
      status: 'pending'
    };

    dispatch({ type: 'ADD_TO_CART', payload: orderItem });
    setIsModalOpen(false);
    setQuantity(1);
    setSelectedModifiers([]);
    setNotes('');
  };

  const handleQuickAdd = () => {
    if (item.modifiers && item.modifiers.length > 0) {
      setIsModalOpen(true);
    } else {
      handleAddToCart();
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          {item.imageUrl && (
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                <p className="font-bold text-orange-600 text-lg">{formatPrice(item.price)}</p>
              </div>
              
              <button
                onClick={handleQuickAdd}
                className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              <div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <p className="font-bold text-orange-600 text-xl">{formatPrice(item.price)}</p>
              </div>

              {/* Modifiers */}
              {item.modifiers && item.modifiers.map((modifier) => (
                <div key={modifier.id} className="space-y-3">
                  <h3 className="font-semibold text-gray-800">
                    {modifier.name}
                    {modifier.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  
                  <div className="space-y-2">
                    {modifier.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type={modifier.type}
                          name={modifier.id}
                          checked={isModifierOptionSelected(modifier.id, option.id)}
                          onChange={() => handleModifierChange(modifier.id, modifier.name, option, modifier.type)}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <span className="text-gray-800">{option.name}</span>
                          {option.price > 0 && (
                            <span className="text-orange-600 ml-2">
                              +{formatPrice(option.price)}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Sem cebola, molho à parte..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart()}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar • {formatPrice(calculateItemPrice())}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};