import React, { useEffect, useState } from 'react';
import { X, Plus, Save, MapPin, Layers } from 'lucide-react';
import { DatabaseService } from '../../services/databaseService';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Table } from '../../types';

const SUGGESTED_PRACAS = [
  'Salão',
  'Varanda',
  'Terraço',
  'Área Externa',
  'Mezanino',
  'VIP',
];

type CreateMode = 'single' | 'bulk';

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  table?: Table | null;
  existingPracas?: string[];
}

export const TableFormModal: React.FC<TableFormModalProps> = ({
  isOpen,
  onClose,
  table = null,
  existingPracas = [],
}) => {
  const { state, dispatch } = useRestaurant();
  const isEditing = Boolean(table);

  const [mode, setMode] = useState<CreateMode>('single');
  const [tableNumber, setTableNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('1');
  const [toNumber, setToNumber] = useState('10');
  const [capacity, setCapacity] = useState(4);
  const [praca, setPraca] = useState('Salão');
  const [isCustomPraca, setIsCustomPraca] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const knownPracas = Array.from(
      new Set([...SUGGESTED_PRACAS, ...existingPracas].filter(Boolean))
    );

    if (table) {
      setMode('single');
      setTableNumber(String(table.number));
      setCapacity(table.capacity);
      const currentPraca = table.praca || 'Salão';
      setPraca(currentPraca);
      setIsCustomPraca(!knownPracas.includes(currentPraca));
    } else {
      setMode('single');
      setTableNumber('');
      setFromNumber('1');
      setToNumber('10');
      setCapacity(4);
      const defaultPraca = existingPracas[0] || 'Salão';
      setPraca(defaultPraca);
      setIsCustomPraca(false);
    }
    setError('');
    setProgress('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reinicia ao abrir/editar mesa
  }, [isOpen, table?.id]);

  const pracaOptions = Array.from(
    new Set([...SUGGESTED_PRACAS, ...existingPracas].filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const existingNumbers = new Set(state.tables.map((t) => t.number));

  const getBulkPreview = () => {
    const from = parseInt(fromNumber, 10);
    const to = parseInt(toNumber, 10);
    if (isNaN(from) || isNaN(to) || from <= 0 || to < from) {
      return { total: 0, toCreate: 0, skipped: 0 };
    }
    let toCreate = 0;
    let skipped = 0;
    for (let n = from; n <= to; n++) {
      if (existingNumbers.has(n)) skipped += 1;
      else toCreate += 1;
    }
    return { total: to - from + 1, toCreate, skipped };
  };

  const bulkPreview = !isEditing && mode === 'bulk' ? getBulkPreview() : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pracaName = praca.trim();
    if (!pracaName) {
      setError('Praça é obrigatória');
      return;
    }

    setIsLoading(true);
    setError('');
    setProgress('');

    try {
      if (isEditing && table) {
        const number = parseInt(tableNumber, 10);
        if (isNaN(number) || number <= 0) {
          setError('Número da mesa deve ser um número positivo');
          return;
        }

        const duplicated = state.tables.some(
          (t) => t.number === number && t.id !== table.id
        );
        if (duplicated) {
          setError(`Já existe uma mesa com o número ${number}`);
          return;
        }

        const updated = await DatabaseService.updateTable(table.id, {
          number,
          capacity,
          praca: pracaName,
        });

        if (!updated) {
          setError('Erro ao atualizar mesa. Tente novamente.');
          return;
        }

        dispatch({ type: 'UPDATE_TABLE', payload: updated });
        onClose();
        return;
      }

      if (mode === 'bulk') {
        const from = parseInt(fromNumber, 10);
        const to = parseInt(toNumber, 10);

        if (isNaN(from) || isNaN(to) || from <= 0 || to <= 0) {
          setError('Informe números válidos no intervalo');
          return;
        }
        if (to < from) {
          setError('O número final deve ser maior ou igual ao inicial');
          return;
        }
        if (to - from + 1 > 100) {
          setError('Cadastre no máximo 100 mesas por vez');
          return;
        }

        let createdCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (let number = from; number <= to; number++) {
          if (existingNumbers.has(number)) {
            skippedCount += 1;
            continue;
          }

          setProgress(`Cadastrando mesa ${number} de ${to}...`);

          const created = await DatabaseService.createTable({
            number,
            capacity,
            praca: pracaName,
            token: `table-${number}-${Math.random().toString(36).slice(2, 10)}`,
            isOccupied: false,
            sessionId: undefined,
          });

          if (created) {
            dispatch({ type: 'ADD_TABLE', payload: created });
            existingNumbers.add(number);
            createdCount += 1;
          } else {
            failedCount += 1;
          }
        }

        if (createdCount === 0 && failedCount === 0) {
          setError(
            skippedCount > 0
              ? 'Todas as mesas desse intervalo já estão cadastradas.'
              : 'Nenhuma mesa foi cadastrada.'
          );
          return;
        }

        if (failedCount > 0 && createdCount === 0) {
          setError('Erro ao cadastrar as mesas. Tente novamente.');
          return;
        }

        onClose();
        return;
      }

      if (!tableNumber.trim()) {
        setError('Número da mesa é obrigatório');
        return;
      }

      const number = parseInt(tableNumber, 10);
      if (isNaN(number) || number <= 0) {
        setError('Número da mesa deve ser um número positivo');
        return;
      }

      if (existingNumbers.has(number)) {
        setError(`Já existe uma mesa com o número ${number}`);
        return;
      }

      const created = await DatabaseService.createTable({
        number,
        capacity,
        praca: pracaName,
        token: `table-${number}-${Math.random().toString(36).slice(2, 10)}`,
        isOccupied: false,
        sessionId: undefined,
      });

      if (!created) {
        setError('Erro ao cadastrar mesa. Verifique se o número já existe.');
        return;
      }

      dispatch({ type: 'ADD_TABLE', payload: created });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar mesa:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            {isEditing ? (
              <>
                <Save className="h-5 w-5 text-blue-600" />
                Editar Mesa
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-blue-600" />
                Cadastrar Mesa
              </>
            )}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {!isEditing && (
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('single');
                setError('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === 'single'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Uma mesa
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('bulk');
                setError('');
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === 'bulk'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              Em massa
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing || mode === 'single' ? (
            <div>
              <label htmlFor="tableNumber" className="mb-2 block text-sm font-medium text-gray-700">
                Número da Mesa *
              </label>
              <input
                type="number"
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1, 2, 3..."
                min="1"
                required
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fromNumber" className="mb-2 block text-sm font-medium text-gray-700">
                    De *
                  </label>
                  <input
                    type="number"
                    id="fromNumber"
                    value={fromNumber}
                    onChange={(e) => setFromNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="toNumber" className="mb-2 block text-sm font-medium text-gray-700">
                    Até *
                  </label>
                  <input
                    type="number"
                    id="toNumber"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>
              </div>

              {bulkPreview && bulkPreview.total > 0 && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  {bulkPreview.toCreate > 0 ? (
                    <>
                      Serão criadas <strong>{bulkPreview.toCreate}</strong> mesa
                      {bulkPreview.toCreate === 1 ? '' : 's'}
                      {bulkPreview.skipped > 0 && (
                        <>
                          {' '}
                          · <strong>{bulkPreview.skipped}</strong> já existem e serão ignoradas
                        </>
                      )}
                    </>
                  ) : (
                    <>Todas as mesas desse intervalo já estão cadastradas.</>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="praca" className="mb-2 block text-sm font-medium text-gray-700">
              Praça *
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                id="praca"
                value={isCustomPraca ? '__custom__' : praca}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__custom__') {
                    setIsCustomPraca(true);
                    setPraca('');
                    return;
                  }
                  setIsCustomPraca(false);
                  setPraca(value);
                }}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required={!isCustomPraca}
              >
                {pracaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="__custom__">Outra / nova praça...</option>
              </select>
            </div>

            {isCustomPraca && (
              <input
                type="text"
                value={praca}
                onChange={(e) => setPraca(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome da nova praça"
                autoFocus
                required
              />
            )}

            <p className="mt-1 text-xs text-gray-500">
              Escolha uma praça existente ou selecione &quot;Outra / nova praça...&quot;.
            </p>
          </div>

          <div>
            <label htmlFor="capacity" className="mb-2 block text-sm font-medium text-gray-700">
              Capacidade
            </label>
            <select
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 lugares</option>
              <option value={4}>4 lugares</option>
              <option value={6}>6 lugares</option>
              <option value={8}>8 lugares</option>
              <option value={10}>10 lugares</option>
              <option value={12}>12 lugares</option>
            </select>
            {!isEditing && mode === 'bulk' && (
              <p className="mt-1 text-xs text-gray-500">
                A mesma capacidade e praça serão aplicadas a todas as mesas do intervalo.
              </p>
            )}
          </div>

          {isEditing && table?.isOccupied && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Esta mesa está ocupada. Você pode editar número, praça e capacidade, mas não
              excluí-la enquanto houver sessão aberta.
            </div>
          )}

          {progress && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {progress}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || (mode === 'bulk' && bulkPreview?.toCreate === 0)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {mode === 'bulk' ? 'Cadastrando...' : 'Salvando...'}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Save className="h-4 w-4" />
                  ) : mode === 'bulk' ? (
                    <Layers className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isEditing
                    ? 'Salvar'
                    : mode === 'bulk'
                      ? `Cadastrar ${bulkPreview?.toCreate || 0}`
                      : 'Cadastrar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
