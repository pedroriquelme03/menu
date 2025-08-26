import { v4 as uuidv4 } from 'uuid';
import { Table, MenuItem, Staff, RestaurantState } from '../types';

const generateTables = (): Table[] => {
  const tables: Table[] = [];
  for (let i = 1; i <= 20; i++) {
    tables.push({
      id: uuidv4(),
      number: i,
      token: `table-${i}-${uuidv4().slice(0, 8)}`,
      capacity: i <= 10 ? 4 : i <= 15 ? 6 : 8,
      isOccupied: Math.random() > 0.7, // 30% ocupação
      createdAt: new Date()
    });
  }
  return tables;
};

const menuItems: MenuItem[] = [
  // Entradas
  {
    id: uuidv4(),
    name: "Bruschetta Tradicional",
    description: "Pão italiano tostado com tomate, manjericão e azeite extra virgem",
    price: 24.90,
    category: "Entradas",
    imageUrl: "https://images.pexels.com/photos/5840071/pexels-photo-5840071.jpeg",
    isAvailable: true,
    modifiers: [
      {
        id: uuidv4(),
        name: "Tamanho",
        type: "radio",
        required: true,
        options: [
          { id: uuidv4(), name: "Individual", price: 0 },
          { id: uuidv4(), name: "Para compartilhar", price: 15.00 }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Bolinho de Bacalhau",
    description: "Croquetes dourados de bacalhau com molho aioli",
    price: 32.90,
    category: "Entradas",
    imageUrl: "https://images.pexels.com/photos/4226654/pexels-photo-4226654.jpeg",
    isAvailable: true
  },
  {
    id: uuidv4(),
    name: "Tábua de Queijos e Frios",
    description: "Seleção de queijos artesanais, presunto parma e geleia de figo",
    price: 58.90,
    category: "Entradas",
    imageUrl: "https://images.pexels.com/photos/1887508/pexels-photo-1887508.jpeg",
    isAvailable: true
  },

  // Pratos Principais
  {
    id: uuidv4(),
    name: "Hambúrguer Artesanal",
    description: "Blend da casa 180g, queijo, alface, tomate e batata rústica",
    price: 42.90,
    category: "Pratos Principais",
    imageUrl: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
    isAvailable: true,
    modifiers: [
      {
        id: uuidv4(),
        name: "Ponto da Carne",
        type: "radio",
        required: true,
        options: [
          { id: uuidv4(), name: "Mal passado", price: 0 },
          { id: uuidv4(), name: "Ao ponto", price: 0 },
          { id: uuidv4(), name: "Bem passado", price: 0 }
        ]
      },
      {
        id: uuidv4(),
        name: "Adicionais",
        type: "checkbox",
        required: false,
        options: [
          { id: uuidv4(), name: "Bacon", price: 6.00 },
          { id: uuidv4(), name: "Ovo", price: 4.00 },
          { id: uuidv4(), name: "Queijo Extra", price: 5.00 }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Salmão Grelhado",
    description: "Filé de salmão com risotto de limão siciliano e aspargos",
    price: 68.90,
    category: "Pratos Principais",
    imageUrl: "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg",
    isAvailable: true
  },
  {
    id: uuidv4(),
    name: "Pizza Margherita",
    description: "Molho de tomate, mozzarella di bufala, manjericão fresco",
    price: 45.90,
    category: "Pratos Principais",
    imageUrl: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
    isAvailable: true,
    modifiers: [
      {
        id: uuidv4(),
        name: "Borda",
        type: "radio",
        required: false,
        options: [
          { id: uuidv4(), name: "Tradicional", price: 0 },
          { id: uuidv4(), name: "Catupiry", price: 8.00 },
          { id: uuidv4(), name: "Cheddar", price: 8.00 }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Risotto de Cogumelos",
    description: "Arroz arbóreo cremoso com mix de cogumelos e parmesão",
    price: 54.90,
    category: "Pratos Principais",
    imageUrl: "https://images.pexels.com/photos/5848570/pexels-photo-5848570.jpeg",
    isAvailable: true
  },

  // Sobremesas
  {
    id: uuidv4(),
    name: "Tiramisù",
    description: "Clássico italiano com café, mascarpone e cacau",
    price: 28.90,
    category: "Sobremesas",
    imageUrl: "https://images.pexels.com/photos/6134775/pexels-photo-6134775.jpeg",
    isAvailable: true
  },
  {
    id: uuidv4(),
    name: "Petit Gâteau",
    description: "Bolo de chocolate com sorvete de baunilha",
    price: 24.90,
    category: "Sobremesas",
    imageUrl: "https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg",
    isAvailable: true
  },

  // Bebidas
  {
    id: uuidv4(),
    name: "Coca-Cola",
    description: "Refrigerante gelado 350ml",
    price: 8.90,
    category: "Bebidas",
    imageUrl: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg",
    isAvailable: true,
    modifiers: [
      {
        id: uuidv4(),
        name: "Tipo",
        type: "radio",
        required: true,
        options: [
          { id: uuidv4(), name: "Original", price: 0 },
          { id: uuidv4(), name: "Zero", price: 0 }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Suco Natural",
    description: "Suco da fruta 400ml",
    price: 12.90,
    category: "Bebidas",
    imageUrl: "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg",
    isAvailable: true,
    modifiers: [
      {
        id: uuidv4(),
        name: "Sabor",
        type: "radio",
        required: true,
        options: [
          { id: uuidv4(), name: "Laranja", price: 0 },
          { id: uuidv4(), name: "Limão", price: 0 },
          { id: uuidv4(), name: "Maracujá", price: 2.00 },
          { id: uuidv4(), name: "Manga", price: 2.00 }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Água",
    description: "Água mineral sem gás 500ml",
    price: 4.90,
    category: "Bebidas",
    imageUrl: "https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg",
    isAvailable: true,
    modifiers: [
      {
        id: uuidv4(),
        name: "Tipo",
        type: "radio",
        required: true,
        options: [
          { id: uuidv4(), name: "Sem gás", price: 0 },
          { id: uuidv4(), name: "Com gás", price: 1.00 }
        ]
      }
    ]
  }
];

const staff: Staff[] = [
  {
    id: uuidv4(),
    name: "Admin Principal",
    email: "admin@restaurant.com",
    role: "admin",
    isActive: true
  },
  {
    id: uuidv4(),
    name: "João Silva",
    email: "joao@restaurant.com",
    role: "cashier",
    isActive: true
  },
  {
    id: uuidv4(),
    name: "Maria Santos",
    email: "maria@restaurant.com",
    role: "kitchen",
    isActive: true
  },
  {
    id: uuidv4(),
    name: "Pedro Costa",
    email: "pedro@restaurant.com",
    role: "waiter",
    isActive: true
  }
];

export const seedData: RestaurantState = {
  tables: generateTables(),
  seats: [],
  menu: menuItems,
  orders: [],
  payments: [],
  staff,
  cart: []
};