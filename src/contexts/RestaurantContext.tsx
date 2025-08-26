import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Table, Seat, MenuItem, Order, OrderItem, Payment, Staff } from '../types';
import { DatabaseService } from '../services/databaseService';

interface RestaurantState {
  tables: Table[];
  seats: Seat[];
  menu: MenuItem[];
  orders: Order[];
  payments: Payment[];
  staff: Staff[];
  currentSeat?: Seat;
  cart: OrderItem[];
}

type RestaurantAction =
  | { type: 'SET_CURRENT_SEAT'; payload: Seat }
  | { type: 'ADD_TO_CART'; payload: OrderItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: string; itemId?: string } }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'CLOSE_TABLE'; payload: string }
  | { type: 'ADD_SEAT'; payload: Seat }
  | { type: 'ADD_TABLE'; payload: Table }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'LOAD_DATA'; payload: RestaurantState };

const initialState: RestaurantState = {
  tables: [],
  seats: [],
  menu: [],
  orders: [],
  payments: [],
  staff: [],
  cart: []
};

const restaurantReducer = (state: RestaurantState, action: RestaurantAction): RestaurantState => {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...action.payload };
    
    case 'SET_CURRENT_SEAT':
      return { ...state, currentSeat: action.payload };
    
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'CREATE_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? {
                ...order,
                status: action.payload.itemId ? order.status : (action.payload.status as any),
                items: action.payload.itemId
                  ? order.items.map(item =>
                      item.id === action.payload.itemId
                        ? { ...item, status: action.payload.status as any }
                        : item
                    )
                  : order.items
              }
            : order
        )
      };
    
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    
    case 'ADD_SEAT':
      return { ...state, seats: [...state.seats, action.payload] };
    
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.payload] };
    
    case 'ADD_MENU_ITEM':
      return { ...state, menu: [...state.menu, action.payload] };
    
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menu: state.menu.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menu: state.menu.filter(item => item.id !== action.payload)
      };
    
    case 'CLOSE_TABLE':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.payload
            ? { ...table, sessionId: undefined, isOccupied: false }
            : table
        ),
        seats: state.seats.filter(seat => seat.tableId !== action.payload)
      };
    
    default:
      return state;
  }
};

const RestaurantContext = createContext<{
  state: RestaurantState;
  dispatch: React.Dispatch<RestaurantAction>;
} | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Inicializar banco de dados se necessário
        await DatabaseService.initializeDatabase();
        
        // Carregar dados do banco
        const [tables, seats, menu, orders, payments] = await Promise.all([
          DatabaseService.getTables(),
          DatabaseService.getSeats(),
          DatabaseService.getMenuItems(),
          DatabaseService.getOrders(),
          DatabaseService.getPayments()
        ]);

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            tables,
            seats,
            menu,
            orders,
            payments,
            staff: [], // Por enquanto vazio
            cart: []
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para dados locais em caso de erro
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            tables: [],
            seats: [],
            menu: [],
            orders: [],
            payments: [],
            staff: [],
            cart: []
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sincronizar dados com o banco quando houver mudanças
  useEffect(() => {
    if (!isLoading && state.tables.length > 0) {
      // Aqui você pode implementar sincronização em tempo real se necessário
      // Por enquanto, os dados são carregados apenas na inicialização
    }
  }, [state, isLoading]);

  return (
    <RestaurantContext.Provider value={{ state, dispatch }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};