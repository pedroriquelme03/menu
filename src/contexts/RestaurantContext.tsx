import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Table, Seat, MenuItem, Order, OrderItem, Payment, Staff } from '../types';
import { seedData } from '../data/seedData';

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
                status: action.payload.itemId ? order.status : action.payload.status,
                items: action.payload.itemId
                  ? order.items.map(item =>
                      item.id === action.payload.itemId
                        ? { ...item, status: action.payload.status }
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

  useEffect(() => {
    const savedData = localStorage.getItem('restaurantData');
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
    } else {
      dispatch({ type: 'LOAD_DATA', payload: seedData });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restaurantData', JSON.stringify(state));
  }, [state]);

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