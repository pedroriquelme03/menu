export interface Table {
  id: string;
  number: number;
  token: string;
  capacity: number;
  isOccupied: boolean;
  sessionId?: string;
  createdAt: Date;
}

export interface Seat {
  id: string;
  tableId: string;
  seatNumber?: number;
  guestName?: string;
  deviceId: string;
  joinedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  modifiers?: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemSnapshot: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  selectedOptions: ModifierOption[];
}

export interface Order {
  id: string;
  tableId: string;
  seatId: string;
  items: OrderItem[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface Payment {
  id: string;
  tableId: string;
  seatId?: string;
  amount: number;
  method: 'cash' | 'card' | 'pix';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'kitchen' | 'waiter';
  isActive: boolean;
}