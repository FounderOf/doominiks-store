import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, Review, Order, ChatMessage, Settings, TopUpRequest, Badge, BadgeType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StoreContextType {
  // Auth
  currentUser: User | null;
  isOwner: boolean;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  deleteReview: (id: string) => void;
  
  // Orders
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  uploadPaymentProof: (orderId: string, proof: string) => void;
  
  // Chat
  messages: ChatMessage[];
  sendMessage: (receiverId: string, message: string) => void;
  getConversation: (userId: string) => ChatMessage[];
  markAsRead: (messageIds: string[]) => void;
  
  // Settings
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  
  // User Management
  users: User[];
  updateUserBalance: (username: string, amount: number) => void;
  updateUserCoins: (username: string, amount: number) => void;
  giftBadge: (username: string, badgeType: BadgeType) => void;
  removeBadge: (username: string, badgeType: BadgeType) => void;
  
  // Top Up
  topUpRequests: TopUpRequest[];
  createTopUpRequest: (request: Omit<TopUpRequest, 'id' | 'createdAt' | 'status'>) => string;
  updateTopUpStatus: (id: string, status: TopUpRequest['status']) => void;
  uploadTopUpProof: (requestId: string, proof: string) => void;
  
  // Purchase
  purchaseWithBalance: (productId: string, quantity: number) => boolean;
  purchaseWithCoins: (productId: string, quantity: number) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultSettings: Settings = {
  ownerUsername: 'admin',
  ownerPassword: 'admin123',
  discordLink: 'https://discord.gg/doominiks',
  bankAccounts: [
    { bankName: 'BCA', accountNumber: '1234567890', accountName: 'DOOMINIKS STORE' },
    { bankName: 'BRI', accountNumber: '0987654321', accountName: 'DOOMINIKS STORE' }
  ],
  ewallets: [
    { name: 'DANA', number: '081234567890', accountName: 'DOOMINIKS' },
    { name: 'OVO', number: '081234567890', accountName: 'DOOMINIKS' },
    { name: 'GoPay', number: '081234567890', accountName: 'DOOMINIKS' }
  ],
  globalDiscount: 0
};

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Diamond Mobile Legends 100',
    description: 'Top up 100 Diamond Mobile Legends. Proses cepat 1-5 menit.',
    price: 25000,
    coinPrice: 250,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400',
    category: 'Mobile Legends',
    discount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Diamond Mobile Legends 500',
    description: 'Top up 500 Diamond Mobile Legends. Proses cepat 1-5 menit.',
    price: 100000,
    coinPrice: 1000,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400',
    category: 'Mobile Legends',
    discount: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'UC PUBG Mobile 60',
    description: 'Top up 60 UC PUBG Mobile. Proses instan.',
    price: 15000,
    coinPrice: 150,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    category: 'PUBG Mobile',
    discount: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Voucher Google Play 50K',
    description: 'Voucher Google Play senilai Rp 50.000',
    price: 52000,
    coinPrice: 520,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400',
    category: 'Voucher',
    discount: 0,
    createdAt: new Date().toISOString()
  }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('doominiks_users');
    if (saved) return JSON.parse(saved);
    return [{
      username: 'admin',
      password: 'admin123',
      balance: 0,
      coins: 0,
      badges: [{ type: 'owner' as BadgeType, giftedAt: new Date().toISOString(), giftedBy: 'system' }],
      isOwner: true,
      createdAt: new Date().toISOString()
    }];
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('doominiks_products');
    return saved ? JSON.parse(saved) : sampleProducts;
  });
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('doominiks_reviews');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('doominiks_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('doominiks_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('doominiks_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const [topUpRequests, setTopUpRequests] = useState<TopUpRequest[]>(() => {
    const saved = localStorage.getItem('doominiks_topup');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('doominiks_users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('doominiks_products', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('doominiks_reviews', JSON.stringify(reviews));
  }, [reviews]);
  
  useEffect(() => {
    localStorage.setItem('doominiks_orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('doominiks_messages', JSON.stringify(messages));
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('doominiks_settings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    localStorage.setItem('doominiks_topup', JSON.stringify(topUpRequests));
  }, [topUpRequests]);

  // Check saved session
  useEffect(() => {
    const savedSession = localStorage.getItem('doominiks_session');
    if (savedSession) {
      const username = JSON.parse(savedSession);
      const user = users.find(u => u.username === username);
      if (user) setCurrentUser(user);
    }
  }, []);

  const isOwner = currentUser?.isOwner || false;

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('doominiks_session', JSON.stringify(username));
      return true;
    }
    return false;
  };

  const register = (username: string, password: string): boolean => {
    if (users.find(u => u.username === username)) return false;
    const newUser: User = {
      username,
      password,
      balance: 0,
      coins: 100, // Bonus coins for new users
      badges: [],
      isOwner: false,
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('doominiks_session', JSON.stringify(username));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('doominiks_session');
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setReviews([...reviews, newReview]);
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): string => {
    const id = uuidv4();
    const newOrder: Order = {
      ...orderData,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setOrders([...orders, newOrder]);
    return id;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => 
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ));
  };

  const uploadPaymentProof = (orderId: string, proof: string) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, paymentProof: proof, status: 'paid', updatedAt: new Date().toISOString() } : o
    ));
  };

  const sendMessage = (receiverId: string, message: string) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: uuidv4(),
      senderId: currentUser.username,
      receiverId,
      message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages([...messages, newMessage]);
  };

  const getConversation = (userId: string): ChatMessage[] => {
    if (!currentUser) return [];
    return messages.filter(m => 
      (m.senderId === currentUser.username && m.receiverId === userId) ||
      (m.senderId === userId && m.receiverId === currentUser.username)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const markAsRead = (messageIds: string[]) => {
    setMessages(messages.map(m => 
      messageIds.includes(m.id) ? { ...m, isRead: true } : m
    ));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
    // Update owner credentials in users if changed
    if (newSettings.ownerUsername || newSettings.ownerPassword) {
      setUsers(users.map(u => 
        u.isOwner ? { 
          ...u, 
          username: newSettings.ownerUsername || u.username,
          password: newSettings.ownerPassword || u.password
        } : u
      ));
    }
  };

  const updateUserBalance = (username: string, amount: number) => {
    setUsers(users.map(u => 
      u.username === username ? { ...u, balance: u.balance + amount } : u
    ));
    if (currentUser?.username === username) {
      setCurrentUser({ ...currentUser, balance: currentUser.balance + amount });
    }
  };

  const updateUserCoins = (username: string, amount: number) => {
    setUsers(users.map(u => 
      u.username === username ? { ...u, coins: u.coins + amount } : u
    ));
    if (currentUser?.username === username) {
      setCurrentUser({ ...currentUser, coins: currentUser.coins + amount });
    }
  };

  const giftBadge = (username: string, badgeType: BadgeType) => {
    const newBadge: Badge = {
      type: badgeType,
      giftedAt: new Date().toISOString(),
      giftedBy: currentUser?.username || 'system'
    };
    setUsers(users.map(u => {
      if (u.username === username && !u.badges.find(b => b.type === badgeType)) {
        return { ...u, badges: [...u.badges, newBadge] };
      }
      return u;
    }));
  };

  const removeBadge = (username: string, badgeType: BadgeType) => {
    setUsers(users.map(u => {
      if (u.username === username) {
        return { ...u, badges: u.badges.filter(b => b.type !== badgeType) };
      }
      return u;
    }));
  };

  const createTopUpRequest = (request: Omit<TopUpRequest, 'id' | 'createdAt' | 'status'>): string => {
    const id = uuidv4();
    const newRequest: TopUpRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTopUpRequests([...topUpRequests, newRequest]);
    return id;
  };

  const updateTopUpStatus = (id: string, status: TopUpRequest['status']) => {
    const request = topUpRequests.find(r => r.id === id);
    if (request && status === 'approved') {
      if (request.type === 'balance') {
        updateUserBalance(request.username, request.amount);
      } else {
        updateUserCoins(request.username, request.amount);
      }
    }
    setTopUpRequests(topUpRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  const uploadTopUpProof = (requestId: string, proof: string) => {
    setTopUpRequests(topUpRequests.map(r => 
      r.id === requestId ? { ...r, paymentProof: proof } : r
    ));
  };

  const purchaseWithBalance = (productId: string, quantity: number): boolean => {
    if (!currentUser) return false;
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) return false;
    
    const discountedPrice = product.price * (1 - (product.discount + settings.globalDiscount) / 100);
    const totalPrice = discountedPrice * quantity;
    
    if (currentUser.balance < totalPrice) return false;
    
    updateUserBalance(currentUser.username, -totalPrice);
    updateProduct(productId, { stock: product.stock - quantity });
    
    createOrder({
      username: currentUser.username,
      productId,
      productName: product.name,
      quantity,
      totalPrice,
      paymentMethod: 'bank'
    });
    
    return true;
  };

  const purchaseWithCoins = (productId: string, quantity: number): boolean => {
    if (!currentUser) return false;
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) return false;
    
    const discountedPrice = product.coinPrice * (1 - (product.discount + settings.globalDiscount) / 100);
    const totalCoins = Math.floor(discountedPrice * quantity);
    
    if (currentUser.coins < totalCoins) return false;
    
    updateUserCoins(currentUser.username, -totalCoins);
    updateProduct(productId, { stock: product.stock - quantity });
    
    const orderId = createOrder({
      username: currentUser.username,
      productId,
      productName: product.name,
      quantity,
      totalPrice: totalCoins,
      paymentMethod: 'coin'
    });
    
    // Auto complete coin orders
    updateOrderStatus(orderId, 'processing');
    
    return true;
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      isOwner,
      login,
      register,
      logout,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      reviews,
      addReview,
      deleteReview,
      orders,
      createOrder,
      updateOrderStatus,
      uploadPaymentProof,
      messages,
      sendMessage,
      getConversation,
      markAsRead,
      settings,
      updateSettings,
      users,
      updateUserBalance,
      updateUserCoins,
      giftBadge,
      removeBadge,
      topUpRequests,
      createTopUpRequest,
      updateTopUpStatus,
      uploadTopUpProof,
      purchaseWithBalance,
      purchaseWithCoins
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
