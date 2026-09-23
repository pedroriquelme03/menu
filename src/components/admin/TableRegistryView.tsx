import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { TableFormModal } from './TableFormModal';
import { DatabaseService } from '../../services/databaseService';
import { Table } from '../../types';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Users,
  LayoutGrid,
} from 'lucide-react';

export const TableRegistryView: React.FC = () => {
  const { state, dispatch } = useRestaurant();
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const sortedTables = [...state.tables].sort((a, b) => {
    const pracaCompare = (a.praca || 'Salão').localeCompare(b.praca || 'Salão', 'pt-BR');
    if (pracaCompare !== 0) return pracaCompare;
    return a.number - b.number;
  });

  const pracas = Array.from(
    new Set(sortedTables.map((table) => table.praca || 'Salão'))
  );

  const tablesByPraca = pracas.map((praca) => ({
    praca,
    tables: sortedTables.filter((table) => (table.praca || 'Salão') === praca),
  }));

  const openCreate = () => {
    setEditingTable(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (table: Table) => {
    setEditingTable(table);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (table: Table) => {
    if (table.isOccupied) {
      setError(`A mesa ${table.number} está ocupada e não pode ser excluída.`);
      return;
    }

    const confirmed = window.confirm(
      `Excluir a mesa ${table.number} da praça "${table.praca}"?\n\nEssa ação remove o cadastro permanente.`
    );
    if (!confirmed) return;

    setDeletingId(table.id);
    setError('');

    try {
      const success = await DatabaseService.deleteTable(table.id);
      if (!success) {
        setError('Não foi possível excluir a mesa.');
        return;
      }
      dispatch({ type: 'DELETE_TABLE', payload: table.id });
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir mesa.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cadastro de Mesas</h2>
          <p className="text-sm text-gray-500">
            Mesas permanentes da casa, organizadas por praça. Ocupação não apaga o cadastro.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nova Mesa
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-gray-500">
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Total cadastradas</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{state.tables.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Praças</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{pracas.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-gray-500">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Ocupadas agora</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {state.tables.filter((t) => t.isOccupied).length}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {tablesByPraca.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800">Nenhuma mesa cadastrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre as mesas da casa e organize por praça (Salão, Varanda, Terraço...).
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Cadastrar primeira mesa
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {tablesByPraca.map(({ praca, tables }) => (
            <section key={praca} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">{praca}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                    {tables.length} {tables.length === 1 ? 'mesa' : 'mesas'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Mesa</th>
                      <th className="px-5 py-3 font-medium">Capacidade</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Token</th>
                      <th className="px-5 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                            {table.number}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {table.capacity} {table.capacity === 1 ? 'lugar' : 'lugares'}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              table.isOccupied
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {table.isOccupied ? 'Ocupada' : 'Livre'}
                          </span>
                        </td>
                        <td className="max-w-[180px] truncate px-5 py-3 font-mono text-xs text-gray-400">
                          {table.token}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(table)}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(table)}
                              disabled={table.isOccupied || deletingId === table.id}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              title={
                                table.isOccupied
                                  ? 'Libere a mesa antes de excluir'
                                  : 'Excluir cadastro'
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      <TableFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTable(null);
        }}
        table={editingTable}
        existingPracas={pracas}
      />
    </div>
  );
};
