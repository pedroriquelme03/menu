import { useEffect, useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { Table, Seat } from '../types';

export const useTableSession = () => {
  const { state, dispatch } = useRestaurant();
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [currentSeat, setCurrentSeat] = useState<Seat | null>(null);
  const [isInTable, setIsInTable] = useState(false);

  useEffect(() => {
    // Verificar se há uma sessão ativa no localStorage
    const tableId = localStorage.getItem('currentTableId');
    const sessionId = localStorage.getItem('currentSessionId');
    const seatId = localStorage.getItem('currentSeatId');
    const guestName = localStorage.getItem('guestName');

    if (tableId && sessionId && seatId) {
      // Buscar a mesa atual
      const table = state.tables.find(t => t.id === tableId);
      if (table && table.isOccupied && table.sessionId === sessionId) {
        // Buscar o assento atual
        const seat = state.seats.find(s => s.id === seatId);
        if (seat) {
          setCurrentTable(table);
          setCurrentSeat(seat);
          setIsInTable(true);
          
          // Restaurar o estado da sessão
          dispatch({ type: 'SET_CURRENT_SEAT', payload: seat });
        }
      } else {
        // Sessão inválida, limpar localStorage
        clearTableSession();
      }
    }
  }, [state.tables, state.seats, dispatch]);

  const clearTableSession = () => {
    localStorage.removeItem('currentTableId');
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('currentSeatId');
    localStorage.removeItem('guestName');
    setCurrentTable(null);
    setCurrentSeat(null);
    setIsInTable(false);
  };

  const leaveTable = () => {
    if (currentTable && currentSeat) {
      // Remover o assento
      // Aqui você pode implementar a lógica para remover o assento do banco
      
      // Se não há mais assentos na mesa, marcar como não ocupada
      const remainingSeats = state.seats.filter(s => s.tableId === currentTable.id);
      if (remainingSeats.length <= 1) {
        // Marcar mesa como não ocupada
        // Aqui você pode implementar a lógica para atualizar o status da mesa
      }
    }
    
    clearTableSession();
  };

  return {
    currentTable,
    currentSeat,
    isInTable,
    leaveTable,
    clearTableSession
  };
};
