import React, { useEffect, useRef, useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { DatabaseService } from '../../services/databaseService';
import { PaymentModal } from './PaymentModal';
import { Table } from '../../types';
import {
  Map,
  Pencil,
  Eye,
  Wand2,
  Users,
  CreditCard,
  MapPin,
} from 'lucide-react';

const TABLE_SIZE = 64; // px visual size for clamping

function getDefaultPosition(index: number, total: number): { x: number; y: number } {
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = ((col + 0.5) / cols) * 80 + 10;
  const y = ((row + 0.5) / Math.ceil(total / cols)) * 70 + 15;
  return { x: Math.min(90, Math.max(8, x)), y: Math.min(88, Math.max(10, y)) };
}

export const FloorMapView: React.FC = () => {
  const { state, dispatch } = useRestaurant();
  const mapRef = useRef<HTMLDivElement>(null);

  const pracas = Array.from(
    new Set(state.tables.map((t) => t.praca || 'Salão'))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const [selectedPraca, setSelectedPraca] = useState<string>('all');
  const [editMode, setEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedPraca !== 'all' && !pracas.includes(selectedPraca)) {
      setSelectedPraca('all');
    }
  }, [pracas, selectedPraca]);

  useEffect(() => {
    const next: Record<string, { x: number; y: number }> = {};
    const filtered = state.tables.filter(
      (t) => selectedPraca === 'all' || (t.praca || 'Salão') === selectedPraca
    );

    filtered.forEach((table, index) => {
      if (table.posX != null && table.posY != null) {
        next[table.id] = { x: table.posX, y: table.posY };
      } else {
        next[table.id] = getDefaultPosition(index, filtered.length || 1);
      }
    });

    setLocalPositions(next);
  }, [state.tables, selectedPraca]);

  const visibleTables = state.tables
    .filter((t) => selectedPraca === 'all' || (t.praca || 'Salão') === selectedPraca)
    .sort((a, b) => a.number - b.number);

  const occupiedCount = visibleTables.filter((t) => t.isOccupied).length;
  const freeCount = visibleTables.length - occupiedCount;

  const getTableMetrics = (table: Table) => {
    const orders = state.orders.filter((o) => o.tableId === table.id);
    const seats = state.seats.filter((s) => s.tableId === table.id);
    const activeOrders = orders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    );
    const subtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
    return { seats, orders, activeOrders, total: subtotal * 1.1 };
  };

  const clampPercent = (value: number) => Math.min(92, Math.max(6, value));

  const handlePointerDown = (e: React.PointerEvent, tableId: string) => {
    if (!editMode) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingId(tableId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!editMode || !draggingId || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = clampPercent(((e.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((e.clientY - rect.top) / rect.height) * 100);
    setLocalPositions((prev) => ({ ...prev, [draggingId]: { x, y } }));
  };

  const handlePointerUp = async () => {
    if (!draggingId) return;
    const pos = localPositions[draggingId];
    const tableId = draggingId;
    setDraggingId(null);

    if (!pos) return;

    setSaving(true);
    try {
      const updated = await DatabaseService.updateTable(tableId, {
        posX: Number(pos.x.toFixed(2)),
        posY: Number(pos.y.toFixed(2)),
      });
      if (updated) {
        dispatch({ type: 'UPDATE_TABLE', payload: updated });
      }
    } catch (err) {
      console.error('Erro ao salvar posição:', err);
    } finally {
      setSaving(false);
    }
  };

  const autoLayout = async () => {
    if (visibleTables.length === 0) return;
    setSaving(true);

    const nextPositions: Record<string, { x: number; y: number }> = {};
    const updates: Table[] = [];

    for (let i = 0; i < visibleTables.length; i++) {
      const table = visibleTables[i];
      const pos = getDefaultPosition(i, visibleTables.length);
      nextPositions[table.id] = pos;

      const updated = await DatabaseService.updateTable(table.id, {
        posX: Number(pos.x.toFixed(2)),
        posY: Number(pos.y.toFixed(2)),
      });
      if (updated) updates.push(updated);
    }

    setLocalPositions((prev) => ({ ...prev, ...nextPositions }));
    updates.forEach((table) => dispatch({ type: 'UPDATE_TABLE', payload: table }));
    setSaving(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const detailTable = selectedTable
    ? state.tables.find((t) => t.id === selectedTable.id) || selectedTable
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Map className="h-6 w-6 text-blue-600" />
            Mapa do Salão
          </h2>
          <p className="text-sm text-gray-500">
            Visualize a ocupação e arraste as mesas no modo edição para montar o layout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              !editMode
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </button>
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              editMode
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            <Pencil className="h-4 w-4" />
            Editar layout
          </button>
          <button
            type="button"
            onClick={autoLayout}
            disabled={saving || visibleTables.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            Auto organizar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedPraca('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            selectedPraca === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200'
          }`}
        >
          Todas as praças
        </button>
        {pracas.map((praca) => (
          <button
            key={praca}
            type="button"
            onClick={() => setSelectedPraca(praca)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
              selectedPraca === praca
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {praca}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Mesas no mapa</p>
          <p className="text-xl font-bold text-gray-800">{visibleTables.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Ocupadas</p>
          <p className="text-xl font-bold text-amber-600">{occupiedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Livres</p>
          <p className="text-xl font-bold text-emerald-600">{freeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Modo</p>
          <p className="text-xl font-bold text-gray-800">{editMode ? 'Edição' : 'Operação'}</p>
        </div>
      </div>

      {editMode && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Arraste as mesas para posicioná-las. A posição é salva automaticamente
          {saving ? ' (salvando...)' : ''}.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div
          ref={mapRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`relative min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:32px_32px] bg-slate-100 ${
            editMode ? 'cursor-crosshair' : ''
          }`}
          style={{ touchAction: editMode ? 'none' : 'auto' }}
        >
          {/* ambient zones */}
          <div className="pointer-events-none absolute inset-x-8 top-4 rounded-xl border border-dashed border-slate-300/80 bg-white/40 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
            {selectedPraca === 'all' ? 'Mapa geral do salão' : `Praça · ${selectedPraca}`}
          </div>

          {visibleTables.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <Map className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-600">Nenhuma mesa para exibir</p>
                <p className="mt-1 text-sm text-slate-400">
                  Cadastre mesas em Cadastro Mesas para montar o mapa.
                </p>
              </div>
            </div>
          ) : (
            visibleTables.map((table) => {
              const pos = localPositions[table.id] || { x: 50, y: 50 };
              const metrics = getTableMetrics(table);
              const isSelected = detailTable?.id === table.id;

              return (
                <button
                  key={table.id}
                  type="button"
                  onPointerDown={(e) => handlePointerDown(e, table.id)}
                  onClick={() => {
                    if (editMode) return;
                    setSelectedTable(table);
                  }}
                  className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border-2 shadow-md transition-shadow select-none ${
                    table.isOccupied
                      ? 'border-amber-400 bg-amber-100 text-amber-900'
                      : 'border-emerald-400 bg-emerald-50 text-emerald-900'
                  } ${isSelected ? 'ring-4 ring-blue-300' : ''} ${
                    editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:shadow-lg'
                  } ${draggingId === table.id ? 'z-20 scale-110 shadow-xl' : 'z-10'}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: TABLE_SIZE,
                    height: TABLE_SIZE,
                  }}
                  title={`Mesa ${table.number} · ${table.praca}`}
                >
                  <span className="text-lg font-bold leading-none">{table.number}</span>
                  <span className="mt-0.5 text-[10px] font-medium opacity-70">
                    {table.capacity}p
                  </span>
                  {table.isOccupied && metrics.activeOrders.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {metrics.activeOrders.length}
                    </span>
                  )}
                </button>
              );
            })
          )}

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-400" /> Livre
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-400" /> Ocupada
            </span>
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-4">
          {detailTable && !editMode ? (
            (() => {
              const metrics = getTableMetrics(detailTable);
              return (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {detailTable.praca}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">Mesa {detailTable.number}</h3>
                    <p className="text-sm text-gray-500">
                      {detailTable.capacity} lugares ·{' '}
                      {detailTable.isOccupied ? 'Ocupada' : 'Livre'}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <Users className="h-3.5 w-3.5" /> Convidados
                      </span>
                      <span className="font-semibold text-gray-800">{metrics.seats.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Pedidos ativos</span>
                      <span className="font-semibold text-gray-800">
                        {metrics.activeOrders.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                      <span className="text-gray-500">Total + taxa</span>
                      <span className="font-bold text-gray-900">
                        {formatPrice(metrics.total)}
                      </span>
                    </div>
                  </div>

                  {metrics.seats.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase text-gray-400">Convidados</p>
                      {metrics.seats.map((seat, index) => (
                        <p key={seat.id} className="text-sm text-gray-700">
                          {seat.guestName || `Convidado ${index + 1}`}
                        </p>
                      ))}
                    </div>
                  )}

                  {detailTable.isOccupied && (
                    <button
                      type="button"
                      onClick={() => setShowPayment(true)}
                      disabled={metrics.activeOrders.length > 0 || metrics.orders.length === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4" />
                      {metrics.activeOrders.length > 0
                        ? 'Aguardando cozinha'
                        : metrics.orders.length === 0
                          ? 'Sem pedidos'
                          : 'Receber pagamento'}
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-sm text-gray-400">
              <Eye className="mb-2 h-8 w-8 opacity-40" />
              {editMode
                ? 'Modo edição ativo. Arraste as mesas no mapa.'
                : 'Clique em uma mesa para ver detalhes.'}
            </div>
          )}
        </aside>
      </div>

      {showPayment && detailTable && (
        <PaymentModal
          table={detailTable}
          onClose={() => {
            setShowPayment(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
};
