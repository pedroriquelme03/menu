import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { DatabaseService } from '../../services/databaseService';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCreated: () => void;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onTableCreated
}) => {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber.trim()) {
      setError('Número da mesa é obrigatório');
      return;
    }

    const number = parseInt(tableNumber);
    if (isNaN(number) || number <= 0) {
      setError('Número da mesa deve ser um número positivo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newTable = await DatabaseService.createTable({
        number,
        capacity,
        token: `table-${number}-${Math.random().toString(36).substr(2, 8)}`,
        isOccupied: false,
        sessionId: undefined
      });

      if (newTable) {
        setTableNumber('');
        setCapacity(4);
        onTableCreated();
        onClose();
      } else {
        setError('Erro ao criar mesa. Verifique o console para mais detalhes.');
      }
    } catch (err) {
      console.error('Erro detalhado ao criar mesa:', err);
      setError(`Erro ao criar mesa: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600" />
            Nova Mesa
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
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Número da Mesa *
            </label>
            <input
              type="number"
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 1, 2, 3..."
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Capacidade
            </label>
            <select
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2}>2 lugares</option>
              <option value={4}>4 lugares</option>
              <option value={6}>6 lugares</option>
              <option value={8}>8 lugares</option>
              <option value={10}>10 lugares</option>
              <option value={12}>12 lugares</option>
            </select>
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
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Criar Mesa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
