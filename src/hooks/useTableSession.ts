import { useEffect, useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { Table, Seat } from '../types';

export const useTableSession = () => {
  const { state, dispatch } = useRestaurant();
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [currentSeat, setCurrentSeat] = useState<Seat | null>(null);
  const [isInTable, setIsInTable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há uma sessão ativa no localStorage
    const tableId = localStorage.getItem('currentTableId');
    const sessionId = localStorage.getItem('currentSessionId');
    const seatId = localStorage.getItem('currentSeatId');
    const guestName = localStorage.getItem('guestName');

    if (tableId && sessionId && seatId) {
      // Buscar a mesa atual
      const table = state.tables.find(t => t.id === tableId);
      
      // Se a mesa existe e tem a sessão correta, restaurar
      if (table && table.sessionId === sessionId) {
        // Buscar o assento atual
        const seat = state.seats.find(s => s.id === seatId);
        if (seat) {
          setCurrentTable(table);
          setCurrentSeat(seat);
          setIsInTable(true);
          setIsLoading(false);
          
          // Restaurar o estado da sessão
          dispatch({ type: 'SET_CURRENT_SEAT', payload: seat });
          
          // Garantir que a mesa esteja marcada como ocupada no estado
          if (!table.isOccupied) {
            dispatch({ type: 'OCCUPY_TABLE', payload: { tableId: table.id, sessionId } });
          }
        }
      } else if (tableId && sessionId && state.tables.length > 0) {
        // Se temos tableId e sessionId mas a mesa não foi encontrada ainda,
        // e os dados já foram carregados, então a sessão é inválida
        console.log('Sessão inválida - mesa não encontrada');
        clearTableSession();
        setIsLoading(false);
      } else if (tableId && sessionId) {
        // Se temos tableId e sessionId mas os dados ainda não foram carregados,
        // vamos aguardar um pouco mais
        console.log('Aguardando carregamento dos dados da mesa...');
        setIsLoading(false);
      }
    } else {
      // Não há sessão ativa
      setIsLoading(false);
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
    isLoading,
    leaveTable,
    clearTableSession
  };
};
