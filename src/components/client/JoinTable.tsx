import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { DatabaseService } from '../../services/databaseService';
import { Table } from '../../types';
import { Users, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface JoinTableProps {
  table: Table;
}

export const JoinTable: React.FC<JoinTableProps> = ({ table }) => {
  const { state, dispatch } = useRestaurant();
  const [guestName, setGuestName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const tableSeats = state.seats.filter(seat => seat.tableId === table.id);

  const handleJoinTable = async () => {
    setIsJoining(true);
    
    try {
      const deviceId = localStorage.getItem('deviceId') || uuidv4();
      localStorage.setItem('deviceId', deviceId);

      // Gerar ID de sessão único para a mesa
      const sessionId = `session-${table.id}-${Date.now()}`;
      
      // Salvar informações da sessão no localStorage
      localStorage.setItem('currentTableId', table.id);
      localStorage.setItem('currentSessionId', sessionId);
      localStorage.setItem('currentSeatId', uuidv4());
      localStorage.setItem('guestName', guestName.trim() || '');

      // Ocupar a mesa no banco de dados primeiro
      console.log('Ocupando mesa:', table.id, 'com sessionId:', sessionId);
      const success = await DatabaseService.occupyTable(table.id, sessionId);
      if (!success) {
        console.error('Falha ao ocupar mesa no banco');
        throw new Error('Erro ao ocupar mesa. Verifique sua conexão.');
      }
      console.log('Mesa ocupada com sucesso');

      // Criar assento no banco de dados
      const seatData = {
        tableId: table.id,
        seatNumber: tableSeats.length + 1,
        guestName: guestName.trim() || undefined,
        deviceId
      };

      console.log('Criando assento:', seatData);
      const savedSeat = await DatabaseService.createSeat(seatData);
      if (!savedSeat) {
        console.error('Falha ao criar assento no banco');
        throw new Error('Erro ao criar assento. Verifique sua conexão.');
      }
      console.log('Assento criado com sucesso:', savedSeat.id);

      // Atualizar localStorage com o ID real do banco
      localStorage.setItem('currentSeatId', savedSeat.id);

      // Recarregar mesas do banco para garantir sincronização
      const updatedTables = await DatabaseService.getTables();

      // Atualizar estado com os dados atualizados do banco
      const updatedTable = updatedTables.find(t => t.id === table.id);
      if (updatedTable) {
        dispatch({ type: 'OCCUPY_TABLE', payload: { tableId: updatedTable.id, sessionId } });
      }

      // Adicionar o assento criado ao estado
      dispatch({ type: 'ADD_SEAT', payload: savedSeat });
      
      // Definir o assento atual
      dispatch({ type: 'SET_CURRENT_SEAT', payload: savedSeat });
      
      // Forçar recarregamento da página ou atualização após um pequeno delay
      // Isso garante que o useTableSession detecte a nova sessão
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Erro ao entrar na mesa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao entrar na mesa: ${errorMessage}`);
      // Limpar localStorage em caso de erro
      localStorage.removeItem('currentTableId');
      localStorage.removeItem('currentSessionId');
      localStorage.removeItem('currentSeatId');
      localStorage.removeItem('guestName');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mesa {table.number}
          </h1>
          <p className="text-gray-600">
            Bem-vindo! Junte-se à mesa para fazer seus pedidos.
          </p>
        </div>

        {tableSeats.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Convidados na mesa ({tableSeats.length})
            </h3>
            <div className="space-y-2">
              {tableSeats.map((seat, index) => (
                <div key={seat.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">
                    {seat.guestName || `Convidado ${seat.seatNumber}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu nome (opcional)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: João"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={30}
            />
          </div>

          <button
            onClick={handleJoinTable}
            disabled={isJoining}
            className="w-full bg-orange-600 text-white py-4 rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Entrando na mesa...' : 'Entrar na Mesa'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Você poderá fazer pedidos individuais e acompanhar o status em tempo real</p>
        </div>
      </div>
    </div>
  );
};